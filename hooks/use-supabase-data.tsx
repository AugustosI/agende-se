"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './use-auth'

export interface Cliente {
  id: string
  nome: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
  // Cliente é considerado ativo por padrão quando 'ativo' é undefined
  ativo?: boolean
}

export interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao: number
  ativo: boolean
}

export interface Agendamento {
  id: string
  cliente_id: string
  servico_id: string
  data_agendamento: string
  hora_inicio: string
  hora_fim: string
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
  observacoes?: string
  valor_pago?: number
  forma_pagamento?: string
  clientes?: Cliente
  servicos?: Servico
}

export interface Transacao {
  id: string
  tipo: 'receita' | 'despesa'
  categoria: string
  descricao: string
  valor: number
  data: string
  agendamento_id?: string
  empresa_id: string
  created_at: string
  updated_at: string
}

export function useSupabaseData() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Buscar clientes
        const { data: clientesData } = await supabase
          .from('clientes')
          .select('*')
          .order('nome')

        // Buscar serviços (todos - ativos e inativos)
        const { data: servicosData } = await supabase
          .from('servicos')
          .select('*')
          .order('nome')

        // Buscar agendamentos com dados dos clientes e serviços
        const { data: agendamentosData } = await supabase
          .from('agendamentos')
          .select(`
            *,
            clientes:cliente_id(nome, telefone),
            servicos:servico_id(nome, preco)
          `)
          .order('data_agendamento', { ascending: true })
          .order('hora_inicio', { ascending: true })

        // Buscar transações
        const { data: transacoesData } = await supabase
          .from('transacoes')
          .select('*')
          .order('data', { ascending: false })

        if (clientesData) setClientes(clientesData)
        if (servicosData) setServicos(servicosData)
        if (agendamentosData) setAgendamentos(agendamentosData)
        if (transacoesData) setTransacoes(transacoesData)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const adicionarCliente = async (cliente: Omit<Cliente, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
  // Trigger preencherá empresa_id via current_user_default_empresa()
  .insert([{ ...cliente }])
        .select()
        .single()

      if (error) throw error
      if (data) setClientes([...clientes, data])
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      return { success: false, error }
    }
  }

  const atualizarCliente = async (
    id: string,
    updates: Partial<Omit<Cliente, 'id'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ ...updates })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      if (data) setClientes(clientes.map(c => (c.id === id ? data : c)))
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      return { success: false, error }
    }
  }

  const removerCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClientes(clientes.filter(c => c.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Erro ao remover cliente:', error)
      return { success: false, error }
    }
  }

  // Ativar/Desativar cliente
  const toggleAtivoCliente = async (id: string, ativo: boolean) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ ativo })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      if (data) setClientes(clientes.map(c => (c.id === id ? data : c)))
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error)
      return { success: false, error }
    }
  }

  const adicionarServico = async (servico: Omit<Servico, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        // Trigger preencherá empresa_id via current_user_default_empresa()
        .insert([{ ...servico }])
        .select()
        .single()

      if (error) throw error
      if (data) setServicos([...servicos, data])
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error)
      return { success: false, error }
    }
  }

  const atualizarServico = async (
    id: string,
    updates: Partial<Omit<Servico, 'id'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update({ ...updates })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      if (data) setServicos(servicos.map(s => (s.id === id ? data : s)))
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      return { success: false, error }
    }
  }

  const removerServico = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setServicos(servicos.filter(s => s.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Erro ao remover serviço:', error)
      return { success: false, error }
    }
  }

  // Ativar/Desativar serviço
  const toggleAtivoServico = async (id: string, ativo: boolean) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update({ ativo })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      if (data) setServicos(servicos.map(s => (s.id === id ? data : s)))
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error)
      return { success: false, error }
    }
  }

  const adicionarAgendamento = async (agendamento: Omit<Agendamento, 'id' | 'clientes' | 'servicos'>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
  // Trigger preencherá empresa_id via current_user_default_empresa()
  .insert([{ ...agendamento }])
        .select(`
          *,
          clientes:cliente_id(nome, telefone),
          servicos:servico_id(nome, preco)
        `)
        .single()

      if (error) throw error
      if (data) setAgendamentos([...agendamentos, data])
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error)
      return { success: false, error }
    }
  }

  const atualizarStatusAgendamento = async (id: string, status: Agendamento['status'], valorPago?: number, formaPagamento?: string) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ 
          status, 
          valor_pago: valorPago,
          forma_pagamento: formaPagamento 
        })
        .eq('id', id)
        .select(`
          *,
          clientes:cliente_id(nome, telefone),
          servicos:servico_id(nome, preco)
        `)
        .single()

      if (error) throw error
      if (data) {
        setAgendamentos(agendamentos.map(ag => ag.id === id ? data : ag))
      }
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      return { success: false, error }
    }
  }

  // Funções para transações financeiras
  const adicionarTransacao = async (transacao: Omit<Transacao, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert([{ ...transacao }])
        .select()
        .single()

      if (error) throw error
      if (data) setTransacoes([data, ...transacoes])
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      return { success: false, error }
    }
  }

  const atualizarTransacao = async (id: string, updates: Partial<Omit<Transacao, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .update({ ...updates })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (data) setTransacoes(transacoes.map(t => t.id === id ? data : t))
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      return { success: false, error }
    }
  }

  const removerTransacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTransacoes(transacoes.filter(t => t.id !== id))
      return { success: true }
    } catch (error) {
      console.error('Erro ao remover transação:', error)
      return { success: false, error }
    }
  }

  // Estatísticas do dashboard
  const getEstatisticas = () => {
    const hoje = new Date().toISOString().split('T')[0]
    const agendamentosHoje = agendamentos.filter(ag => ag.data_agendamento === hoje)
    
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    const agendamentosMes = agendamentos.filter(ag => {
      const dataAg = new Date(ag.data_agendamento)
      return dataAg.getMonth() + 1 === mesAtual && 
             dataAg.getFullYear() === anoAtual &&
             ag.status === 'concluido' &&
             ag.valor_pago
    })
    
    const receitaMes = agendamentosMes.reduce((total, ag) => total + (ag.valor_pago || 0), 0)
    
    return {
      agendamentosHoje: agendamentosHoje.length,
      receitaMes,
  clientesAtivos: clientes.filter(c => c.ativo !== false).length,
      proximosAgendamentos: agendamentos
        .filter(ag => ag.status !== 'cancelado' && ag.status !== 'concluido')
        .slice(0, 3)
        .map(ag => ({
          id: ag.id,
          cliente: ag.clientes?.nome || 'Cliente não encontrado',
          servico: ag.servicos?.nome || 'Serviço não encontrado',
          horario: ag.hora_inicio,
          data: ag.data_agendamento === hoje ? 'Hoje' : 
                ag.data_agendamento === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'Amanhã' :
                new Date(ag.data_agendamento).toLocaleDateString('pt-BR')
        }))
    }
  }

  return {
    clientes,
    servicos,
    agendamentos,
    transacoes,
    loading,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    toggleAtivoCliente,
    adicionarServico,
    atualizarServico,
    removerServico,
    toggleAtivoServico,
    adicionarAgendamento,
    atualizarStatusAgendamento,
    adicionarTransacao,
    atualizarTransacao,
    removerTransacao,
    getEstatisticas
  }
}
