"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Clock, DollarSign, Edit, Trash2 } from 'lucide-react'

interface Servico {
  id: number
  nome: string
  duracao: number // em minutos
  preco: number
  descricao?: string
  ativo: boolean
}

export function ServicosView() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)

  // Dados de exemplo
  useEffect(() => {
    const servicosExemplo: Servico[] = [
      {
        id: 1,
        nome: 'Corte + Escova',
        duracao: 60,
        preco: 50.00,
        descricao: 'Corte de cabelo feminino com escova',
        ativo: true
      },
      {
        id: 2,
        nome: 'Barba',
        duracao: 30,
        preco: 25.00,
        descricao: 'Aparar e modelar barba',
        ativo: true
      },
      {
        id: 3,
        nome: 'Manicure',
        duracao: 45,
        preco: 30.00,
        descricao: 'Cuidados com as unhas das mãos',
        ativo: true
      },
      {
        id: 4,
        nome: 'Pedicure',
        duracao: 60,
        preco: 35.00,
        descricao: 'Cuidados com as unhas dos pés',
        ativo: true
      }
    ]
    setServicos(servicosExemplo)
  }, [])

  const ServicoForm = ({ servico }: { servico?: Servico }) => {
    const [formData, setFormData] = useState({
      nome: servico?.nome || '',
      duracao: servico?.duracao?.toString() || '',
      preco: servico?.preco?.toString() || '',
      descricao: servico?.descricao || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      const servicoData: Servico = {
        id: servico?.id || Date.now(),
        nome: formData.nome,
        duracao: parseInt(formData.duracao),
        preco: parseFloat(formData.preco),
        descricao: formData.descricao,
        ativo: true
      }

      if (servico) {
        // Editar serviço existente
        setServicos(servicos.map(s => s.id === servico.id ? servicoData : s))
      } else {
        // Adicionar novo serviço
        setServicos([...servicos, servicoData])
      }

      setIsDialogOpen(false)
      setEditingServico(null)
      setFormData({ nome: '', duracao: '', preco: '', descricao: '' })
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

        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
          {servico ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
        </Button>
      </form>
    )
  }

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      setServicos(servicos.filter(s => s.id !== id))
    }
  }

  const toggleStatus = (id: number) => {
    setServicos(servicos.map(s => 
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ))
  }

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
            <ServicoForm servico={editingServico || undefined} />
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
            <div className="text-2xl font-bold text-slate-800">{servicos.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Serviços Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {servicos.filter(s => s.ativo).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Preço Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              R$ {servicos.length > 0 
                ? (servicos.reduce((sum, s) => sum + s.preco, 0) / servicos.length).toFixed(2)
                : '0.00'
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Duração Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {servicos.length > 0 
                ? Math.round(servicos.reduce((sum, s) => sum + s.duracao, 0) / servicos.length)
                : 0
              } min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicos.map((servico) => (
          <Card key={servico.id} className={`hover:shadow-md transition-shadow ${!servico.ativo ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{servico.nome}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(servico)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(servico.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {servico.descricao && (
                <CardDescription>{servico.descricao}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(servico.id)}
                  className={servico.ativo ? 'text-emerald-600 border-emerald-200' : 'text-red-600 border-red-200'}
                >
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servicos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-slate-500">
              Nenhum serviço cadastrado ainda. Comece adicionando seu primeiro serviço!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
