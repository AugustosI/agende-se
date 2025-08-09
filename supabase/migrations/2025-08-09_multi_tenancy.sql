-- Multi-tenant: vincular tudo a uma empresa
-- Idempotente: usa IF NOT EXISTS e DO blocks para criar apenas o que faltar

-- Extensões úteis
create extension if not exists pgcrypto;

-- 1) Tabela de empresas
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.empresas enable row level security;

-- 2) Tabela de vínculo usuário <-> empresa (membership)
create table if not exists public.user_empresas (
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (empresa_id, user_id)
);

alter table public.user_empresas enable row level security;

-- 3) Helper functions
-- 3.1) Verifica se um usuário é membro de uma empresa
create or replace function public.is_member(p_user uuid, p_empresa uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_empresas ue
    where ue.user_id = p_user and ue.empresa_id = p_empresa
  );
$$;

-- 3.2) Verifica se um usuário é owner de uma empresa
create or replace function public.is_owner(p_user uuid, p_empresa uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_empresas ue
    where ue.user_id = p_user and ue.empresa_id = p_empresa and ue.role = 'owner'
  );
$$;

-- 3.3) Retorna a empresa padrão do usuário autenticado (primeira associação)
create or replace function public.current_user_default_empresa()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_empresa uuid;
begin
  select empresa_id into v_empresa
  from public.user_empresas
  where user_id = auth.uid()
  order by
    case role when 'owner' then 1 when 'admin' then 2 else 3 end,
    created_at
  limit 1;
  return v_empresa;
end;
$$;

-- 4) Adicionar coluna empresa_id nas tabelas de domínio (caso já existam)
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'clientes' and column_name = 'empresa_id'
  ) then
    alter table public.clientes add column empresa_id uuid references public.empresas(id) on delete cascade;
  end if;
exception when undefined_table then
  -- tabela clientes pode não existir neste projeto; ignore
  null;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'servicos' and column_name = 'empresa_id'
  ) then
    alter table public.servicos add column empresa_id uuid references public.empresas(id) on delete cascade;
  end if;
exception when undefined_table then
  null;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'agendamentos' and column_name = 'empresa_id'
  ) then
    alter table public.agendamentos add column empresa_id uuid references public.empresas(id) on delete cascade;
  end if;
exception when undefined_table then
  null;
end $$;

-- 4.1) Índices para performance por empresa
do $$ begin
  begin
    create index clientes_empresa_id_idx on public.clientes(empresa_id);
  exception when duplicate_table then null; end;
exception when undefined_table then null; end $$;

do $$ begin
  begin
    create index servicos_empresa_id_idx on public.servicos(empresa_id);
  exception when duplicate_table then null; end;
exception when undefined_table then null; end $$;

do $$ begin
  begin
    create index agendamentos_empresa_id_idx on public.agendamentos(empresa_id);
  exception when duplicate_table then null; end;
exception when undefined_table then null; end $$;

-- 4.2) Backfill: definir empresa_id com base no user_id -> user_empresas
-- Nota: Assume que as tabelas têm coluna user_id (uuid)
-- Removido backfill por user_id em clientes (modelo agora só por empresa)

-- Removido backfill por user_id em servicos

-- Removido backfill por user_id em agendamentos

-- 5) Triggers: preencher empresa_id automaticamente se nulo
create or replace function public.set_empresa_id_default()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.empresa_id is null then
    new.empresa_id := public.current_user_default_empresa();
  end if;
  return new;
end;
$$;

do $$ begin
  begin
    create trigger clientes_set_empresa_id
    before insert on public.clientes
    for each row execute function public.set_empresa_id_default();
  exception when duplicate_object then null; end;
exception when undefined_table then null; end $$;

do $$ begin
  begin
    create trigger servicos_set_empresa_id
    before insert on public.servicos
    for each row execute function public.set_empresa_id_default();
  exception when duplicate_object then null; end;
exception when undefined_table then null; end $$;

do $$ begin
  begin
    create trigger agendamentos_set_empresa_id
    before insert on public.agendamentos
    for each row execute function public.set_empresa_id_default();
  exception when duplicate_object then null; end;
exception when undefined_table then null; end $$;

-- 6) Auto membership do owner ao criar empresa
create or replace function public.empresas_after_insert_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_user_id is not null then
    insert into public.user_empresas(empresa_id, user_id, role)
    values (new.id, new.owner_user_id, 'owner')
    on conflict (empresa_id, user_id) do update set role = excluded.role;
  end if;
  return new;
end;
$$;

do $$ begin
  begin
    create trigger empresas_after_insert_owner_membership
    after insert on public.empresas
    for each row execute function public.empresas_after_insert_owner_membership();
  exception when duplicate_object then null; end;
end $$;

-- 7) Políticas RLS
-- Helper para criar política se não existir
-- empresas
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='empresas' and policyname='empresas_select_members'
  ) then
    execute $$create policy empresas_select_members on public.empresas
      for select using (
        public.is_member(auth.uid(), id)
      );$$;
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='empresas' and policyname='empresas_insert_auth'
  ) then
    execute $$create policy empresas_insert_auth on public.empresas
      for insert with check (
        auth.uid() is not null
      );$$;
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='empresas' and policyname='empresas_update_owner'
  ) then
    execute $$create policy empresas_update_owner on public.empresas
      for update using (
        public.is_owner(auth.uid(), id)
      ) with check (
        public.is_owner(auth.uid(), id)
      );$$;
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='empresas' and policyname='empresas_delete_owner'
  ) then
    execute $$create policy empresas_delete_owner on public.empresas
      for delete using (
        public.is_owner(auth.uid(), id)
      );$$;
  end if;
end $$;

-- user_empresas
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_empresas' and policyname='user_empresas_select_self_or_owner'
  ) then
    execute $$create policy user_empresas_select_self_or_owner on public.user_empresas
      for select using (
        user_id = auth.uid() or public.is_owner(auth.uid(), empresa_id)
      );$$;
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_empresas' and policyname='user_empresas_insert_owner'
  ) then
    execute $$create policy user_empresas_insert_owner on public.user_empresas
      for insert with check (
        public.is_owner(auth.uid(), empresa_id)
      );$$;
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_empresas' and policyname='user_empresas_update_owner'
  ) then
    execute $$create policy user_empresas_update_owner on public.user_empresas
      for update using (
        public.is_owner(auth.uid(), empresa_id)
      ) with check (
        public.is_owner(auth.uid(), empresa_id)
      );$$;
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_empresas' and policyname='user_empresas_delete_owner'
  ) then
    execute $$create policy user_empresas_delete_owner on public.user_empresas
      for delete using (
        public.is_owner(auth.uid(), empresa_id)
      );$$;
  end if;
end $$;

-- clientes
do $$ begin
  begin
    alter table public.clientes enable row level security;
  exception when undefined_table then null; end;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='clientes') then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='clientes' and policyname='clientes_select_members'
    ) then
      execute $$create policy clientes_select_members on public.clientes
        for select using (
          public.is_member(auth.uid(), empresa_id)
        );$$;
    end if;
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='clientes' and policyname='clientes_cud_members'
    ) then
      execute $$create policy clientes_cud_members on public.clientes
        for all using (
          public.is_member(auth.uid(), empresa_id)
        ) with check (
          public.is_member(auth.uid(), empresa_id)
        );$$;
    end if;
  end if;
end $$;

-- servicos
do $$ begin
  begin
    alter table public.servicos enable row level security;
  exception when undefined_table then null; end;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='servicos') then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='servicos' and policyname='servicos_select_members'
    ) then
      execute $$create policy servicos_select_members on public.servicos
        for select using (
          public.is_member(auth.uid(), empresa_id)
        );$$;
    end if;
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='servicos' and policyname='servicos_cud_members'
    ) then
      execute $$create policy servicos_cud_members on public.servicos
        for all using (
          public.is_member(auth.uid(), empresa_id)
        ) with check (
          public.is_member(auth.uid(), empresa_id)
        );$$;
    end if;
  end if;
end $$;

-- agendamentos
do $$ begin
  begin
    alter table public.agendamentos enable row level security;
  exception when undefined_table then null; end;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='agendamentos') then
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='agendamentos' and policyname='agendamentos_select_members'
    ) then
      execute $$create policy agendamentos_select_members on public.agendamentos
        for select using (
          public.is_member(auth.uid(), empresa_id)
        );$$;
    end if;
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename='agendamentos' and policyname='agendamentos_cud_members'
    ) then
      execute $$create policy agendamentos_cud_members on public.agendamentos
        for all using (
          public.is_member(auth.uid(), empresa_id)
        ) with check (
          public.is_member(auth.uid(), empresa_id)
        );$$;
    end if;
  end if;
end $$;

-- 8) Restrições de unicidade por empresa (opcional, se colunas existirem)
do $$ begin
  -- clientes(nome, empresa_id)
  begin
    execute $$create unique index clientes_nome_empresa_uniq on public.clientes(lower(nome), empresa_id);$$;
  exception when undefined_table then null when duplicate_table then null; end;
  -- servicos(nome, empresa_id)
  begin
    execute $$create unique index servicos_nome_empresa_uniq on public.servicos(lower(nome), empresa_id);$$;
  exception when undefined_table then null when duplicate_table then null; end;
end $$;

-- Fim da migração multi-tenant
