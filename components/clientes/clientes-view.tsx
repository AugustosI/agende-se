"use client"

import type React from "react"

import { useState } from "react"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Phone, User, MoreVertical, CheckCircle2, CircleSlash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogClose } from "@/components/ui/dialog"
import type { Cliente as ClienteTipo } from "@/hooks/use-supabase-data"

// Tipos locais de exibição podem ser derivados do hook, evitando conflito com o backend

export function ClientesView() {
  const { clientes, adicionarCliente, atualizarCliente, removerCliente, toggleAtivoCliente } = useSupabaseData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null)

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !termo ||
      cliente.nome.toLowerCase().includes(termo) ||
      (cliente.telefone ? cliente.telefone.toLowerCase().includes(termo) : false) ||
      (cliente.observacoes ? cliente.observacoes.toLowerCase().includes(termo) : false)

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' && cliente.ativo !== false) ||
      (statusFilter === 'inativos' && cliente.ativo === false)

    return matchesSearch && matchesStatus
  })

  const NovoClienteForm = () => {
    const [formData, setFormData] = useState({
      nome: "",
      telefone: "",
      observacoes: "",
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.nome.trim()) return
      // Verificar se já existe cliente com este nome (frontend, opcional)
      const clienteExistente = clientes.find((c) => c.nome.toLowerCase() === formData.nome.toLowerCase())
      if (clienteExistente) {
        alert("Já existe um cliente com este nome!")
        return
      }
      setLoading(true)
      const { success, error } = await adicionarCliente({
        nome: formData.nome,
        telefone: formData.telefone,
        observacoes: formData.observacoes,
      })
      setLoading(false)
      if (success) {
        setIsDialogOpen(false)
        setFormData({ nome: "", telefone: "", observacoes: "" })
      } else {
  alert("Erro ao cadastrar cliente: " + ((error as any)?.message || ""))
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            placeholder="Nome completo do cliente"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            placeholder="(11) 99999-9999"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            placeholder="Preferências, alergias, observações gerais..."
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
          Cadastrar Cliente
        </Button>
      </form>
    )
  }

  const EditarClienteForm = () => {
    const cliente = clientes.find(c => c.id === selectedClienteId)
    const [formData, setFormData] = useState({
      nome: cliente?.nome || "",
      telefone: cliente?.telefone || "",
      observacoes: cliente?.observacoes || "",
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedClienteId) return
      setLoading(true)
      const { success, error } = await atualizarCliente(selectedClienteId, {
        nome: formData.nome,
        telefone: formData.telefone,
        observacoes: formData.observacoes,
      })
      setLoading(false)
      if (success) {
        setIsEditOpen(false)
      } else {
        alert("Erro ao atualizar cliente: " + (error as any)?.message)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome-edit">Nome *</Label>
          <Input
            id="nome-edit"
            placeholder="Nome completo do cliente"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone-edit">Telefone</Label>
          <Input
            id="telefone-edit"
            placeholder="(11) 99999-9999"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes-edit">Observações</Label>
          <Textarea
            id="observacoes-edit"
            placeholder="Preferências, alergias, observações gerais..."
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-600">Gerencie sua base de clientes</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Cadastre um novo cliente em sua base</DialogDescription>
            </DialogHeader>
            <NovoClienteForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{clientes.length}</div>
          </CardContent>
        </Card>

    <Card className="border-l-4 border-l-emerald-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
      <div className="text-2xl font-bold text-slate-800">{clientes.filter(c => c.ativo !== false).length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">R$ 0.00</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, telefone ou descrição..."
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

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => (
          <Card
            key={cliente.id}
            className="hover:shadow-md transition-shadow flex flex-col h-full min-h-[240px] p-6"
            style={{ padding: 24 }}
          >
            <div className="flex flex-col flex-1 h-full">
              {/* Topo: nome, telefone, data */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-lg flex items-center font-bold text-slate-800">
                    <User className="w-5 h-5 mr-2 text-slate-500" />
                    {cliente.nome}
                    {cliente.ativo === false ? (
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
                        setSelectedClienteId(cliente.id)
                        // Toggle menu
                        setActionMenuFor((prev) => (prev === cliente.id ? null : cliente.id))
                      }}
                    >
                      <MoreVertical className="w-5 h-5 text-slate-500" />
                    </button>
                    {selectedClienteId === cliente.id && actionMenuFor === cliente.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-10">
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-slate-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsEditOpen(true)
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
                            setSelectedClienteId(cliente.id)
                            await toggleAtivoCliente(cliente.id, !(cliente.ativo !== false))
                          }}
                        >
                          {cliente.ativo === false ? 'Ativar' : 'Desativar'}
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsDeleteOpen(true)
                            setActionMenuFor(null)
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {cliente.telefone && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {cliente.telefone}
                  </div>
                )}
                {/* Removido: linha "Cliente desde" */}
                {cliente.observacoes && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-xl text-center">{cliente.observacoes}</div>
                )}
              </div>
              {/* Espaço flexível para cards com menos conteúdo */}
              <div className="flex-1" />
              {/* Base: estatísticas alinhadas para baixo, gap de 24px acima da barra */}
              <div className="pt-6 mt-6 border-t flex gap-6">
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-slate-800">0</div>
                  <div className="text-xs text-slate-600">Atendimentos</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-emerald-600">R$ 0.00</div>
                  <div className="text-xs text-slate-600">Total Gasto</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-slate-500">
              {searchTerm ? "Nenhum cliente encontrado com este termo de busca" : "Nenhum cliente cadastrado ainda"}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Diálogo de Edição (global) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Atualize as informações do cliente</DialogDescription>
          </DialogHeader>
          <EditarClienteForm />
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão (global) */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={async () => {
                if (!selectedClienteId) return
                const { success, error } = await removerCliente(selectedClienteId)
                if (!success) alert("Erro ao excluir: " + (error as any)?.message)
                setIsDeleteOpen(false)
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
