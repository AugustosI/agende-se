-- RLS policies para tabelas de domínio (clientes, servicos, agendamentos)
-- Executar após 2025-08-09_create_domain_tables_empresa_only.sql

-- clientes
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='clientes') then
    begin
      alter table public.clientes enable row level security;
    exception when undefined_table then null; end;

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
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='servicos') then
    begin
      alter table public.servicos enable row level security;
    exception when undefined_table then null; end;

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
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='agendamentos') then
    begin
      alter table public.agendamentos enable row level security;
    exception when undefined_table then null; end;

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
