-- Seed específico para Estúdio Delicata (Augusto)
-- Usuário: augustonanuque@gmail.com / senha: 123456

-- 1) Criar usuário no auth (requer Supabase SQL em ambiente com permissões adequadas)
-- Observação: Em muitos projetos, signup ocorre via API. Aqui usamos RPC padrão do Supabase.
-- Se não for permitido por políticas, faça o signup via app e rode somente os passos 2..4.

-- Cria usuário se não existir
insert into auth.users (id, email, encrypted_password, email_confirmed_at)
select gen_random_uuid(), 'augustonanuque@gmail.com', crypt('123456', gen_salt('bf')), now()
where not exists (
  select 1 from auth.users where email='augustonanuque@gmail.com'
);

-- Garante presence no auth.identities (alguns projetos criam via trigger)
insert into auth.identities (id, user_id, provider, identity_data)
select gen_random_uuid(), u.id, 'email', jsonb_build_object('email','augustonanuque@gmail.com')
from auth.users u
where u.email='augustonanuque@gmail.com'
  and not exists (
    select 1 from auth.identities i where i.user_id=u.id and i.provider='email'
  );

-- 2) Criar empresa Estúdio Delicata e vínculo
insert into public.empresas (nome, owner_user_id)
select 'Estúdio Delicata', u.id
from auth.users u
where u.email='augustonanuque@gmail.com'
  and not exists (
    select 1 from public.empresas e where e.nome='Estúdio Delicata'
  );

-- 3) Vincular usuário como owner (caso o trigger não tenha feito)
insert into public.user_empresas (empresa_id, user_id, role)
select e.id, u.id, 'owner'
from public.empresas e
join auth.users u on u.email='augustonanuque@gmail.com'
where e.nome='Estúdio Delicata'
  and not exists (
    select 1 from public.user_empresas ue where ue.empresa_id=e.id and ue.user_id=u.id
  );

-- 4) Criar dados fictícios da empresa (clientes, serviços, agendamentos)
-- Clientes
insert into public.clientes (empresa_id, nome, telefone, observacoes)
select e.id, x.nome, x.telefone, x.obs
from public.empresas e,
     (values
       ('Pietra','(31) 90000-0001','Cliente Vip'),
       ('Maria Clara','(31) 90000-0002','Prefere fim de semana'),
       ('Juliana','(31) 90000-0003','Tonalizante 5.0'),
       ('Amanda','(31) 90000-0004','Alérgica a amônia')
     ) as x(nome, telefone, obs)
where e.nome='Estúdio Delicata'
  and not exists (
    select 1 from public.clientes c where c.empresa_id=e.id and c.nome=x.nome
  );

-- Serviços
insert into public.servicos (empresa_id, nome, descricao, duracao_minutos, preco)
select e.id, x.nome, x.descricao, x.duracao, x.preco
from public.empresas e,
     (values
       ('Corte Feminino','Corte e finalização',50,80.00),
       ('Coloração','Coloração completa',120,180.00),
       ('Escova','Escova modelada',45,60.00),
       ('Hidratação','Tratamento capilar',40,70.00)
     ) as x(nome, descricao, duracao, preco)
where e.nome='Estúdio Delicata'
  and not exists (
    select 1 from public.servicos s where s.empresa_id=e.id and s.nome=x.nome
  );

-- Agendamentos (para hoje e próximos dias)
insert into public.agendamentos (empresa_id, cliente_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, valor_pago, forma_pagamento)
select e.id,
       c.id,
       s.id,
       current_date,
       time '14:00',
       time '15:00',
       'confirmado',
       s.preco,
       'Dinheiro'
from public.empresas e
join public.clientes c on c.empresa_id=e.id and c.nome='Pietra'
join public.servicos s on s.empresa_id=e.id and s.nome='Escova'
where e.nome='Estúdio Delicata'
  and not exists (
    select 1 from public.agendamentos a where a.empresa_id=e.id and a.cliente_id=c.id and a.servico_id=s.id and a.data_agendamento=current_date and a.hora_inicio=time '14:00'
  );

insert into public.agendamentos (empresa_id, cliente_id, servico_id, data_agendamento, hora_inicio, hora_fim, status)
select e.id,
       c.id,
       s.id,
       current_date + interval '1 day',
       time '10:00',
       time '11:30',
       'agendado'
from public.empresas e
join public.clientes c on c.empresa_id=e.id and c.nome='Maria Clara'
join public.servicos s on s.empresa_id=e.id and s.nome='Coloração'
where e.nome='Estúdio Delicata'
  and not exists (
    select 1 from public.agendamentos a where a.empresa_id=e.id and a.cliente_id=c.id and a.servico_id=s.id and a.data_agendamento=current_date + interval '1 day' and a.hora_inicio=time '10:00'
  );
