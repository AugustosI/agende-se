"use client"

import { createClient } from "@supabase/supabase-js"
import { useState, useCallback, useEffect } from "react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found")
}

const supabase = createClient(supabaseUrl, supabaseKey)

type Cliente = {
  id: string
  nome: string
  telefone?: string
  email?: string
  data_cadastro: string
  ultimo_agendamento?: string
  user_id: string
}

type Servico = {
  id: string
  nome: string
  preco: number
  duracao: number
  descricao?: string
  ativo: boolean
  user_id: string
}

type Agendamento = {
  id: string
  cliente_id: string
  servico_id: string
  data_agendamento: string
  horario: string
  status: "agendado" | "realizado" | "cancelado"
  valor_pago?: number
  observacoes?: string
  user_id: string
  cliente?: Cliente
  servico?: Servico
}

type TransacaoFinanceira = {
  id: string
  tipo: "receita" | "despesa"
  valor: number
  descricao: string
  data: string
  categoria?: string
  agendamento_id?: string
  user_id: string
}

type UsuarioPerfil = {
  id: string
  user_id: string
  nome_completo?: string
  telefone?: string
  endereco?: string
  bio?: string
  foto_perfil?: string
  configuracoes: Record<string, any>
}

export const useSupabaseData = () => {
  const [loading, setLoading] = useState(false)

  const getEstatisticas = useCallback(() => {
    // Mock data - em produção viria do Supabase
    return {
      agendamentosHoje: 3,
      receitaMes: 2450.00,
      clientesAtivos: 12,
      proximosAgendamentos: [
        {
          id: "1",
          cliente: "Maria Silva",
          servico: "Manicure e Pedicure",
          horario: "14:00",
          data: "Hoje"
        },
        {
          id: "2",
          cliente: "Ana Costa",
          servico: "Sobrancelha",
          horario: "16:30",
          data: "Hoje"
        },
        {
          id: "3",
          cliente: "Carla Souza",
          servico: "Design de Unhas",
          horario: "09:00",
          data: "Amanhã"
        }
      ]
    }
  }, [])

  const getClientes = useCallback(async (): Promise<Cliente[]> => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome')

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const criarCliente = useCallback(async (cliente: Omit<Cliente, "id" | "data_cadastro" | "user_id">): Promise<Cliente | null> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...cliente,
          user_id: user.id,
          data_cadastro: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar cliente:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const atualizarCliente = useCallback(async (id: string, cliente: Partial<Cliente>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar cliente:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const excluirCliente = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir cliente:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getServicos = useCallback(async (): Promise<Servico[]> => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('nome')

      if (error) {
        console.error('Erro ao buscar serviços:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar serviços:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const criarServico = useCallback(async (servico: Omit<Servico, "id" | "user_id">): Promise<Servico | null> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('servicos')
        .insert({
          ...servico,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar serviço:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const atualizarServico = useCallback(async (id: string, servico: Partial<Servico>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar serviço:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const excluirServico = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir serviço:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgendamentos = useCallback(async (filtros?: {
    dataInicio?: string
    dataFim?: string
    clienteId?: string
    status?: string
  }): Promise<Agendamento[]> => {
    setLoading(true)
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*)
        `)
        .order('data_agendamento', { ascending: true })
        .order('horario', { ascending: true })

      if (filtros?.dataInicio) {
        query = query.gte('data_agendamento', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data_agendamento', filtros.dataFim)
      }

      if (filtros?.clienteId) {
        query = query.eq('cliente_id', filtros.clienteId)
      }

      if (filtros?.status) {
        query = query.eq('status', filtros.status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const criarAgendamento = useCallback(async (agendamento: Omit<Agendamento, "id" | "user_id">): Promise<Agendamento | null> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          ...agendamento,
          user_id: user.id
        })
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*)
        `)
        .single()

      if (error) {
        console.error('Erro ao criar agendamento:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const atualizarAgendamento = useCallback(async (id: string, agendamento: Partial<Agendamento>): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update(agendamento)
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar agendamento:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const excluirAgendamento = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir agendamento:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getTransacoes = useCallback(async (filtros?: {
    dataInicio?: string
    dataFim?: string
    tipo?: "receita" | "despesa"
  }): Promise<TransacaoFinanceira[]> => {
    setLoading(true)
    try {
      let query = supabase
        .from('transacoes_financeiras')
        .select('*')
        .order('data', { ascending: false })

      if (filtros?.dataInicio) {
        query = query.gte('data', filtros.dataInicio)
      }

      if (filtros?.dataFim) {
        query = query.lte('data', filtros.dataFim)
      }

      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar transações:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const criarTransacao = useCallback(async (transacao: Omit<TransacaoFinanceira, "id" | "user_id">): Promise<TransacaoFinanceira | null> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert({
          ...transacao,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar transação:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getPerfil = useCallback(async (): Promise<UsuarioPerfil | null> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('perfis_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const atualizarPerfil = useCallback(async (perfil: Omit<UsuarioPerfil, "id" | "user_id">): Promise<boolean> => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('perfis_usuarios')
        .upsert({
          ...perfil,
          user_id: user.id
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    getEstatisticas,
    getClientes,
    criarCliente,
    atualizarCliente,
    excluirCliente,
    getServicos,
    criarServico,
    atualizarServico,
    excluirServico,
    getAgendamentos,
    criarAgendamento,
    atualizarAgendamento,
    excluirAgendamento,
    getTransacoes,
    criarTransacao,
    getPerfil,
    atualizarPerfil
  }
}
