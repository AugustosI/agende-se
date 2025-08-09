"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Search, Phone, Calendar, User } from "lucide-react"

interface Cliente {
  id: number
  nome: string
  telefone: string
  observacoes?: string
  dataCadastro: string
  ultimoAtendimento?: string
  totalAtendimentos: number
  valorTotal: number
}

export function ClientesView() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Dados de exemplo
  useEffect(() => {
    const clientesExemplo: Cliente[] = [
      {
        id: 1,
        nome: "Maria Silva",
        telefone: "(11) 99999-9999",
        observacoes: "Prefere cortes mais conservadores",
        dataCadastro: "2024-01-15",
        ultimoAtendimento: "2024-01-20",
        totalAtendimentos: 5,
        valorTotal: 250.0,
      },
      {
        id: 2,
        nome: "João Santos",
        telefone: "(11) 88888-8888",
        observacoes: "Alérgico a alguns produtos",
        dataCadastro: "2024-01-10",
        ultimoAtendimento: "2024-01-18",
        totalAtendimentos: 3,
        valorTotal: 75.0,
      },
      {
        id: 3,
        nome: "Ana Costa",
        telefone: "(11) 77777-7777",
        dataCadastro: "2024-01-05",
        ultimoAtendimento: "2024-01-16",
        totalAtendimentos: 8,
        valorTotal: 400.0,
      },
    ]
    setClientes(clientesExemplo)
  }, [])

  const clientesFiltrados = clientes.filter(
    (cliente) => cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.telefone.includes(searchTerm),
  )

  const NovoClienteForm = () => {
    const [formData, setFormData] = useState({
      nome: "",
      telefone: "",
      observacoes: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      // Verificar se já existe cliente com este nome
      const clienteExistente = clientes.find((c) => c.nome.toLowerCase() === formData.nome.toLowerCase())

      if (clienteExistente) {
        alert("Já existe um cliente com este nome!")
        return
      }

      const novoCliente: Cliente = {
        id: Date.now(),
        nome: formData.nome,
        telefone: formData.telefone,
        observacoes: formData.observacoes,
        dataCadastro: new Date().toISOString().split("T")[0],
        totalAtendimentos: 0,
        valorTotal: 0,
      }

      setClientes([...clientes, novoCliente])
      setIsDialogOpen(false)
      setFormData({ nome: "", telefone: "", observacoes: "" })
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
            <div className="text-2xl font-bold text-slate-800">
              {clientes.filter((c) => c.totalAtendimentos > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              R${" "}
              {clientes.length > 0
                ? (
                    clientes.reduce((sum, c) => sum + c.valorTotal, 0) /
                      clientes.filter((c) => c.totalAtendimentos > 0).length || 0
                  ).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar cliente por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <User className="w-5 h-5 mr-2 text-slate-500" />
                  {cliente.nome}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cliente.telefone && (
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {cliente.telefone}
                </div>
              )}

              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2" />
                Cliente desde {new Date(cliente.dataCadastro).toLocaleDateString("pt-BR")}
              </div>

              {cliente.observacoes && (
                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-xl">{cliente.observacoes}</div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{cliente.totalAtendimentos}</div>
                  <div className="text-xs text-slate-600">Atendimentos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">R$ {cliente.valorTotal.toFixed(2)}</div>
                  <div className="text-xs text-slate-600">Total Gasto</div>
                </div>
              </div>

              {cliente.ultimoAtendimento && (
                <div className="text-xs text-slate-500 text-center pt-2 border-t">
                  Último atendimento: {new Date(cliente.ultimoAtendimento).toLocaleDateString("pt-BR")}
                </div>
              )}
            </CardContent>
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
    </div>
  )
}
