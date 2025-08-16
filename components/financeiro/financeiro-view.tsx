"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Edit, Search, Filter, Calendar, MoreVertical } from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Transacao {
  id: string
  tipo: "receita" | "despesa"
  valor: number
  descricao: string
  data: string
  categoria: string
}

export function FinanceiroView() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<"receita" | "despesa">("receita")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTransacaoId, setSelectedTransacaoId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null)
  
  // Estado dos filtros
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: 'todos' as 'todos' | 'receita' | 'despesa',
    data: 'este-mes' as 'hoje' | 'ultimos-7' | 'ultimos-15' | 'ultimos-30' | 'este-mes' | 'personalizado',
    dataInicio: '',
    dataFim: ''
  })

  // Mock data
  useEffect(() => {
    setTransacoes([
      {
        id: '1',
        tipo: 'receita',
        valor: 150,
        descricao: 'Corte + Escova - Maria Silva',
        data: '2024-01-15',
        categoria: 'Serviços'
      },
      {
        id: '2',
        tipo: 'receita',
        valor: 80,
        descricao: 'Manicure - Ana Costa',
        data: '2024-01-15',
        categoria: 'Serviços'
      },
      {
        id: '3',
        tipo: 'despesa',
        valor: 200,
        descricao: 'Compra de produtos',
        data: '2024-01-14',
        categoria: 'Estoque'
      }
    ])
  }, [])

  // Função para obter o intervalo de datas baseado no filtro
  const getIntervaloData = () => {
    const hoje = new Date()
    
    switch (filtros.data) {
      case 'hoje':
        return {
          inicio: startOfDay(hoje),
          fim: endOfDay(hoje)
        }
      case 'ultimos-7':
        return {
          inicio: startOfDay(subDays(hoje, 7)),
          fim: endOfDay(hoje)
        }
      case 'ultimos-15':
        return {
          inicio: startOfDay(subDays(hoje, 15)),
          fim: endOfDay(hoje)
        }
      case 'ultimos-30':
        return {
          inicio: startOfDay(subDays(hoje, 30)),
          fim: endOfDay(hoje)
        }
      case 'este-mes':
        return {
          inicio: startOfMonth(hoje),
          fim: endOfMonth(hoje)
        }
      case 'personalizado':
        if (filtros.dataInicio && filtros.dataFim) {
          return {
            inicio: startOfDay(new Date(filtros.dataInicio)),
            fim: endOfDay(new Date(filtros.dataFim))
          }
        }
        return {
          inicio: startOfMonth(hoje),
          fim: endOfMonth(hoje)
        }
      default:
        return {
          inicio: startOfMonth(hoje),
          fim: endOfMonth(hoje)
        }
    }
  }

  // Função para filtrar transações
  const getTransacoesFiltradas = () => {
    const { inicio, fim } = getIntervaloData()
    
    return transacoes.filter((transacao) => {
      // Filtro por data
      const dataTransacao = new Date(transacao.data)
      const dentroPeriodo = dataTransacao >= inicio && dataTransacao <= fim
      
      // Filtro por tipo
      const tipoMatch = filtros.tipo === 'todos' || transacao.tipo === filtros.tipo
      
      // Filtro por busca
      const buscaMatch = filtros.busca === '' || 
        transacao.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        transacao.categoria.toLowerCase().includes(filtros.busca.toLowerCase())
      
      return dentroPeriodo && tipoMatch && buscaMatch
    })
  }

  // Função para verificar se há filtros ativos
  const temFiltrosAtivos = () => {
    return filtros.busca !== '' || 
           filtros.tipo !== 'todos' || 
           filtros.data !== 'este-mes'
  }

  const getRelatorioMensal = (transacoesFiltradas: Transacao[]) => {
    const receitas = transacoesFiltradas.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0)
    const despesas = transacoesFiltradas.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0)

    return {
      mes: format(new Date(), "MMMM yyyy", { locale: ptBR }),
      receitas,
      despesas,
      lucro: receitas - despesas,
      transacoes: transacoesFiltradas,
    }
  }

  const transacoesFiltradas = getTransacoesFiltradas()
  const relatorioAtual = getRelatorioMensal(transacoesFiltradas)

  const NovaTransacaoForm = () => {
    const [formData, setFormData] = useState({
      tipo: tipoTransacao,
      categoria: "",
      descricao: "",
      valor: "",
      data: format(new Date(), "yyyy-MM-dd"),
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      const novaTransacao: Transacao = {
        id: Date.now().toString(),
        tipo: formData.tipo as "receita" | "despesa",
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: Number.parseFloat(formData.valor),
        data: formData.data,
      }

      setTransacoes([...transacoes, novaTransacao])
      setIsDialogOpen(false)
      setFormData({
        tipo: tipoTransacao,
        categoria: "",
        descricao: "",
        valor: "",
        data: format(new Date(), "yyyy-MM-dd"),
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: "receita" | "despesa") => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            placeholder="Ex: Serviços, Estoque, Marketing"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            placeholder="Descrição da transação"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
          Adicionar Transação
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-600">Controle suas receitas e despesas</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={temFiltrosAtivos() ? 'bg-rose-50 border-rose-200' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {temFiltrosAtivos() && <span className="ml-1 bg-rose-500 text-white rounded-full w-2 h-2" />}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>Adicione uma nova receita ou despesa</DialogDescription>
              </DialogHeader>
              <NovaTransacaoForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Painel de Filtros */}
      {isFilterOpen && (
        <Card className="filter-container">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="busca">Buscar</Label>
                <Input
                  id="busca"
                  placeholder="Descrição ou categoria..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Tipo</Label>
                <Select value={filtros.tipo} onValueChange={(value: any) => setFiltros({ ...filtros, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Período</Label>
                <Select value={filtros.data} onValueChange={(value: any) => setFiltros({ ...filtros, data: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="ultimos-7">Últimos 7 dias</SelectItem>
                    <SelectItem value="ultimos-15">Últimos 15 dias</SelectItem>
                    <SelectItem value="ultimos-30">Últimos 30 dias</SelectItem>
                    <SelectItem value="este-mes">Este mês</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFiltros({ busca: '', tipo: 'todos', data: 'este-mes', dataInicio: '', dataFim: '' })}
                  disabled={!temFiltrosAtivos()}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
            
            {filtros.data === 'personalizado' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {relatorioAtual.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-rose-500" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              R$ {relatorioAtual.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${relatorioAtual.lucro >= 0 ? 'border-l-blue-400' : 'border-l-orange-400'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
              {relatorioAtual.lucro >= 0 ? 'Lucro' : 'Prejuízo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${relatorioAtual.lucro >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              R$ {Math.abs(relatorioAtual.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transações 
            {temFiltrosAtivos() && (
              <span className="text-sm text-slate-500 font-normal">
                ({transacoesFiltradas.length} de {transacoes.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transacoesFiltradas
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-sm">
                        {format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
                        {transacao.categoria}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-slate-800 mb-1">{transacao.descricao}</p>
                  </div>
                  <div className="text-right sm:text-right flex items-center gap-2">
                    <div>
                      <p className={`font-bold text-lg ${
                        transacao.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600 capitalize">{transacao.tipo}</p>
                    </div>
                  </div>
                </div>
              ))}

            {transacoesFiltradas.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {temFiltrosAtivos() 
                  ? "Nenhuma transação encontrada com os filtros aplicados" 
                  : "Nenhuma transação cadastrada ainda"
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
