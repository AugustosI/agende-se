-- Seed de empresas para todos os usuários sem vínculo e backfill de empresa_id

-- 1) Criar uma empresa por usuário sem vínculo
insert into public.empresas (nome, owner_user_id)
select coalesce(nullif(split_part(u.email,'@',1),''),'Empresa') || ' LTDA', u.id
from auth.users u
where not exists (
  select 1 from public.user_empresas ue where ue.user_id = u.id
);
-- O trigger empresas_after_insert_owner_membership cria user_empresas como 'owner'

-- 2) Backfill de empresa_id após criar memberships
-- clientes
do $$ begin
  begin
    update public.clientes c
    set empresa_id = sub.empresa_id
    from (
      select distinct on (ue.user_id) ue.user_id, ue.empresa_id
      from public.user_empresas ue
      order by ue.user_id,
        case ue.role when 'owner' then 1 when 'admin' then 2 else 3 end,
        ue.created_at
    ) sub
    where c.empresa_id is null and c.user_id = sub.user_id;
  exception when undefined_table then null; end;
end $$;

-- servicos
do $$ begin
  begin
    update public.servicos s
    set empresa_id = sub.empresa_id
    from (
      select distinct on (ue.user_id) ue.user_id, ue.empresa_id
      from public.user_empresas ue
      order by ue.user_id,
        case ue.role when 'owner' then 1 when 'admin' then 2 else 3 end,
        ue.created_at
    ) sub
    where s.empresa_id is null and s.user_id = sub.user_id;
  exception when undefined_table then null; end;
end $$;

-- agendamentos
do $$ begin
  begin
    update public.agendamentos a
    set empresa_id = sub.empresa_id
    from (
      select distinct on (ue.user_id) ue.user_id, ue.empresa_id
      from public.user_empresas ue
      order by ue.user_id,
        case ue.role when 'owner' then 1 when 'admin' then 2 else 3 end,
        ue.created_at
    ) sub
    where a.empresa_id is null and a.user_id = sub.user_id;
  exception when undefined_table then null; end;
end $$;
