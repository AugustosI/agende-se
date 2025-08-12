"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './use-auth'

export interface Empresa {
  id: string
  nome: string
  created_at: string
}

export interface Usuario {
  id: string
  auth_user_id: string
  nome: string
  empresa_id: string | null
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export function useUsuarioEmpresa() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar dados do usuário atual com empresa
        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuario')
          .select(`*, empresa:empresa_id(*)`)
          .eq('auth_user_id', user.id)
          .single()

        if (usuarioError && usuarioError.code !== 'PGRST116') {
          throw usuarioError
        }

        // Buscar empresas vinculadas ao usuário (multi-tenancy)
        const { data: empresasData, error: empresasError } = await supabase
          .from('empresas')
          .select('*')
          .in('id',
            (
              await supabase
                .from('user_empresas')
                .select('empresa_id')
                .eq('user_id', user.id)
            ).data?.map((ue: any) => ue.empresa_id) || []
          )
          .order('nome')

        if (empresasError) {
          throw empresasError
        }

        setUsuario(usuarioData)
        setEmpresas(empresasData || [])
      } catch (err: any) {
        // Mostra erro real do Supabase
        if (err && err.message) {
          setError(err.message)
          console.error('Erro ao buscar dados do usuário/empresa:', err.message, err)
        } else {
          setError('Erro ao carregar dados')
          console.error('Erro ao buscar dados do usuário/empresa:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const criarUsuario = async (nome: string, empresaId?: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('usuario')
        .insert([{ 
          auth_user_id: user.id, 
          nome, 
          empresa_id: empresaId || null 
        }])
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .single()

      if (error) throw error
      
      setUsuario(data)
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  const atualizarUsuario = async (updates: Partial<Pick<Usuario, 'nome' | 'empresa_id'>>) => {
    if (!usuario) return { success: false, error: 'Usuário não encontrado' }

    try {
      const { data, error } = await supabase
        .from('usuario')
        .update(updates)
        .eq('id', usuario.id)
        .select(`
          *,
          empresa:empresa_id(*)
        `)
        .single()

      if (error) throw error
      
      setUsuario(data)
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      return { success: false, error: error.message }
    }
  }

  const criarEmpresa = async (nome: string) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert([{ nome }])
        .select()
        .single()

      if (error) throw error
      
      setEmpresas([...empresas, data])
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error)
      return { success: false, error: error.message }
    }
  }

  const associarEmpresa = async (empresaId: string) => {
    return await atualizarUsuario({ empresa_id: empresaId })
  }

  return {
    usuario,
    empresas,
    loading,
    error,
    criarUsuario,
    atualizarUsuario,
    criarEmpresa,
    associarEmpresa
  }
}
