"use client"

import { useState, useEffect } from 'react'
import { useSupabaseData } from '@/hooks/use-supabase-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Plus, Clock, DollarSign, MoreVertical, CheckCircle2, CircleSlash2, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ServicosView() {
  const { servicos, adicionarServico, atualizarServico, removerServico, toggleAtivoServico, loading } = useSupabaseData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<typeof servicos[0] | null>(null)
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedServicoId, setSelectedServicoId] = useState<string | null>(null)

  // Formulário para adicionar e editar serviços
  const ServicoForm = () => {
    const [formData, setFormData] = useState({
      nome: editingServico?.nome || '',
      duracao: editingServico?.duracao?.toString() || '',
      preco: editingServico?.preco?.toString() || '',
      descricao: editingServico?.descricao || ''
    })

    // Atualizar formulário quando editingServico mudar
    useEffect(() => {
      if (editingServico) {
        setFormData({
          nome: editingServico.nome,
          duracao: editingServico.duracao.toString(),
          preco: editingServico.preco.toString(),
          descricao: editingServico.descricao || ''
        })
      } else {
        setFormData({ nome: '', duracao: '', preco: '', descricao: '' })
      }
    }, [editingServico])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      const servicoData = {
        nome: formData.nome,
        duracao: Number(formData.duracao),
        preco: Number(formData.preco),
        descricao: formData.descricao,
        ativo: editingServico?.ativo ?? true
      }

      let result
      if (editingServico) {
        // Editar serviço existente
        result = await atualizarServico(editingServico.id, servicoData)
      } else {
        // Adicionar novo serviço
        result = await adicionarServico(servicoData)
      }

      if (result.success) {
        setIsDialogOpen(false)
        setEditingServico(null)
        setFormData({ nome: '', duracao: '', preco: '', descricao: '' })
      } else {
        console.error('Erro ao salvar serviço:', result.error)
        alert('Erro ao salvar serviço. Tente novamente.')
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Serviço *</Label>
          <Input
            id="nome"
            placeholder="Ex: Corte + Escova"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duracao">Duração (minutos) *</Label>
            <Input
              id="duracao"
              type="number"
              placeholder="60"
              value={formData.duracao}
              onChange={(e) => setFormData({...formData, duracao: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              placeholder="50.00"
              value={formData.preco}
              onChange={(e) => setFormData({...formData, preco: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            placeholder="Descrição opcional do serviço"
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              setIsDialogOpen(false)
              setEditingServico(null)
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-rose-500 hover:bg-rose-600">
            {editingServico ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
          </Button>
        </div>
      </form>
    )
  }

  // Funções CRUD para serviços
  const handleEdit = (servico: typeof servicos[0]) => {
    setEditingServico(servico)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setSelectedServicoId(id)
    setIsDeleteOpen(true)
    setActionMenuFor(null) // Fechar o menu de ações
  }

  const toggleStatus = async (id: string, ativoAtual: boolean) => {
    const novoStatus = !ativoAtual
    const result = await toggleAtivoServico(id, novoStatus)
    if (!result.success) {
      console.error('Erro ao alterar status do serviço:', result.error)
      alert('Erro ao alterar status do serviço. Tente novamente.')
    }
  }

  // Filtro de texto e status
  const servicosFiltrados = servicos.filter((servico) => {
    const termo = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !termo ||
      servico.nome.toLowerCase().includes(termo) ||
      (servico.descricao ? servico.descricao.toLowerCase().includes(termo) : false)
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' && servico.ativo) ||
      (statusFilter === 'inativos' && !servico.ativo)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Serviços</h1>
          <p className="text-slate-600">Gerencie seu catálogo de serviços</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setEditingServico(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
              <DialogDescription>
                {editingServico 
                  ? 'Atualize as informações do serviço'
                  : 'Adicione um novo serviço ao seu catálogo'
                }
              </DialogDescription>
            </DialogHeader>
            <ServicoForm />
          </DialogContent>
        </Dialog>
  </div>


  {/* Estatísticas */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card className="border-l-4 border-l-blue-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Total de Serviços</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{loading ? '...' : servicos.length}</div>
      </CardContent>
    </Card>

    <Card className="border-l-4 border-l-emerald-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Serviços Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">
          {loading ? '...' : servicos.filter(s => s.ativo).length}
        </div>
      </CardContent>
    </Card>

    <Card className="border-l-4 border-l-purple-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Preço Médio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">
          {loading ? '...' : `R$ ${servicos.length > 0 
            ? (servicos.reduce((sum, s) => sum + s.preco, 0) / servicos.length).toFixed(2)
            : '0.00'}`}
        </div>
      </CardContent>
    </Card>

    <Card className="border-l-4 border-l-orange-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Duração Média</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">
          {loading ? '...' : `${servicos.length > 0 
            ? Math.round(servicos.reduce((sum, s) => sum + s.duracao, 0) / servicos.length)
            : 0} min`}
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Busca e filtros - agora logo abaixo dos cards de estatísticas */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
    <div className="relative w-full sm:max-w-md">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <Input
        placeholder="Buscar por nome, descrição..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 h-10"
      />
    </div>
    <div className="w-full sm:w-48">
      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="ativos">Ativos</SelectItem>
          <SelectItem value="inativos">Inativos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>



      {/* Lista de Serviços - igual clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicosFiltrados.map((servico) => (
          <Card
            key={servico.id}
            className={`hover:shadow-md transition-shadow flex flex-col h-full min-h-[240px] p-6 ${!servico.ativo ? 'opacity-60' : ''}`}
            style={{ padding: 24 }}
          >
            <div className="flex flex-col flex-1 h-full">
              {/* Topo: nome, status, menu */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-lg flex items-center font-bold text-slate-800">
                    {servico.nome}
                    {servico.ativo === false ? (
                      <CircleSlash2 className="w-4 h-4 ml-2 text-slate-400" aria-label="Inativo" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-500" aria-label="Ativo" />
                    )}
                  </span>
                  {/* Menu de ações */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Ações"
                      className="p-1 rounded hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingServico(null)
                        setActionMenuFor((prev) => (prev === servico.id ? null : servico.id))
                      }}
                    >
                      <MoreVertical className="w-5 h-5 text-slate-500" />
                    </button>
                    {actionMenuFor === servico.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-10">
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingServico(servico)
                            setIsDialogOpen(true)
                            setActionMenuFor(null)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-slate-50"
                          onClick={async (e) => {
                            e.stopPropagation()
                            setActionMenuFor(null)
                            await toggleStatus(servico.id, servico.ativo)
                          }}
                        >
                          {servico.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(servico.id)
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {servico.descricao && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-xl text-center">{servico.descricao}</div>
                )}
              </div>
              <div className="flex-1" />
              {/* Base: estatísticas alinhadas para baixo */}
              <CardContent className="space-y-3 p-0 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {servico.duracao} minutos
                  </div>
                  <div className="flex items-center text-lg font-bold text-emerald-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {servico.preco.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className={servico.ativo ? 'text-emerald-600' : 'text-red-600'}>
                    {servico.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {!loading && servicosFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-slate-500">
              Nenhum serviço encontrado com este filtro.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                if (!selectedServicoId) return
                const result = await removerServico(selectedServicoId)
                if (result.success) {
                  console.log('Serviço excluído com sucesso!')
                } else {
                  console.error('Erro ao excluir serviço:', result.error)
                  alert('Erro ao excluir serviço. Tente novamente.')
                }
                setIsDeleteOpen(false)
                setSelectedServicoId(null)
              }}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
