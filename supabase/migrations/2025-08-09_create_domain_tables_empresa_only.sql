-- Criação das tabelas de domínio usando somente empresa_id (sem user_id)
create extension if not exists pgcrypto;

-- clientes
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  telefone text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- servicos
create table if not exists public.servicos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  descricao text,
  duracao_minutos integer not null default 30,
  preco numeric(10,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- agendamentos
create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  servico_id uuid not null references public.servicos(id) on delete restrict,
  data_agendamento date not null,
  hora_inicio time not null,
  hora_fim time not null,
  status text not null default 'agendado' check (status in ('agendado','confirmado','concluido','cancelado')),
  observacoes text,
  valor_pago numeric(10,2),
  forma_pagamento text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- índices por empresa
create index if not exists clientes_empresa_id_idx on public.clientes(empresa_id);
create index if not exists servicos_empresa_id_idx on public.servicos(empresa_id);
create index if not exists agendamentos_empresa_id_idx on public.agendamentos(empresa_id);

-- unicidade (opcional) por empresa
create unique index if not exists servicos_nome_empresa_uniq on public.servicos (lower(nome), empresa_id);
create unique index if not exists clientes_nome_empresa_uniq on public.clientes (lower(nome), empresa_id);

-- RLS
alter table public.clientes enable row level security;
alter table public.servicos enable row level security;
alter table public.agendamentos enable row level security;

-- políticas básicas (dependem de is_member)
-- assumem que 2025-08-09_multi_tenancy.sql providencia as funções/public.policies
