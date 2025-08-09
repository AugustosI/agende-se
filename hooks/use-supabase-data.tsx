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

export function useSupabaseData() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
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

        // Buscar serviços
        const { data: servicosData } = await supabase
          .from('servicos')
          .select('*')
          .eq('ativo', true)
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

        if (clientesData) setClientes(clientesData)
        if (servicosData) setServicos(servicosData)
        if (agendamentosData) setAgendamentos(agendamentosData)
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
        .insert([{ ...cliente, user_id: user?.id }])
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

  const adicionarServico = async (servico: Omit<Servico, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([{ ...servico, user_id: user?.id }])
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

  const adicionarAgendamento = async (agendamento: Omit<Agendamento, 'id' | 'clientes' | 'servicos'>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{ ...agendamento, user_id: user?.id }])
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
      clientesAtivos: clientes.length,
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
    loading,
    adicionarCliente,
    adicionarServico,
    adicionarAgendamento,
    atualizarStatusAgendamento,
    getEstatisticas
  }
}
