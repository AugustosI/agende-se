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
import { Plus, TrendingUp, TrendingDown, DollarSign, MoreVertical, Trash2, Edit, Search, Filter, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useSupabaseData, type Transacao } from "@/hooks/use-supabase-data"

interface RelatorioMensal {
  mes: string
  receitas: number
  despesas: number
  lucro: number
  transacoes: Transacao[]
}

type FiltroData = 'hoje' | 'ultimos-7' | 'ultimos-15' | 'ultimos-30' | 'este-mes' | 'personalizado'

interface FiltroState {
  busca: string
  tipo: 'todos' | 'receita' | 'despesa'
  data: FiltroData
  dataInicio?: string
  dataFim?: string
}

export function FinanceiroView() {
  const { transacoes, adicionarTransacao, atualizarTransacao, removerTransacao, loading } = useSupabaseData()
  const [mesAtual, setMesAtual] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<"receita" | "despesa">("receita")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTransacaoId, setSelectedTransacaoId] = useState<string | null>(null)
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filtros, setFiltros] = useState<FiltroState>({
    busca: '',
    tipo: 'todos',
    data: 'este-mes',
    dataInicio: undefined,
    dataFim: undefined
  })

  // Função para obter o intervalo de datas baseado no filtro
  const getIntervaloData = (filtroData: FiltroData, dataInicio?: string, dataFim?: string) => {
    const hoje = new Date()
    
    switch (filtroData) {
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
        if (dataInicio && dataFim) {
          return {
            inicio: startOfDay(new Date(dataInicio)),
            fim: endOfDay(new Date(dataFim))
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
    const { inicio, fim } = getIntervaloData(filtros.data, filtros.dataInicio, filtros.dataFim)
    
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

  const getRelatorioMensal = (transacoesFiltradas: Transacao[]): RelatorioMensal => {
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

  // Função para excluir transação
  const handleDeleteTransacao = (id: string) => {
    setSelectedTransacaoId(id)
    setIsDeleteOpen(true)
    setActionMenuFor(null)
  }

  // Função para editar transação
  const handleEditTransacao = (transacao: Transacao) => {
    setTransacaoParaEditar(transacao)
    setTipoTransacao(transacao.tipo)
    setIsEditOpen(true)
    setActionMenuFor(null)
  }

  const confirmarExclusao = async () => {
    if (selectedTransacaoId) {
      const resultado = await removerTransacao(selectedTransacaoId)
      if (resultado.success) {
        setIsDeleteOpen(false)
        setSelectedTransacaoId(null)
      }
    }
  }

  const transacoesFiltradas = getTransacoesFiltradas()
  const relatorioAtual = getRelatorioMensal(transacoesFiltradas)

  // Fechar filtro ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen) {
        const target = event.target as Element
        if (!target.closest('.filter-container')) {
          setIsFilterOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isFilterOpen])

  const NovaTransacaoForm = () => {
    const [formData, setFormData] = useState({
      tipo: tipoTransacao,
      categoria: "",
      descricao: "",
      valor: "",
      data: format(new Date(), "yyyy-MM-dd"),
    })

    const categorias = {
      receita: ["Serviços", "Produtos", "Outros"],
      despesa: ["Produtos", "Fixas", "Marketing", "Equipamentos", "Outros"],
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      const novaTransacao = {
        tipo: formData.tipo as "receita" | "despesa",
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: Number.parseFloat(formData.valor),
        data: formData.data,
      }

      const resultado = await adicionarTransacao(novaTransacao)
      if (resultado.success) {
        setIsDialogOpen(false)
        setFormData({
          tipo: tipoTransacao,
          categoria: "",
          descricao: "",
          valor: "",
          data: format(new Date(), "yyyy-MM-dd"),
        })
      }
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
          <Label>Categoria</Label>
          <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias[formData.tipo].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

  const EditarTransacaoForm = () => {
    const [formData, setFormData] = useState({
      tipo: transacaoParaEditar?.tipo || "receita",
      categoria: transacaoParaEditar?.categoria || "",
      descricao: transacaoParaEditar?.descricao || "",
      valor: transacaoParaEditar?.valor.toString() || "",
      data: transacaoParaEditar?.data || format(new Date(), "yyyy-MM-dd"),
    })

    const categorias = {
      receita: ["Serviços", "Produtos", "Outros"],
      despesa: ["Produtos", "Fixas", "Marketing", "Equipamentos", "Outros"],
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!transacaoParaEditar) return

      const dadosAtualizados = {
        tipo: formData.tipo as "receita" | "despesa",
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: Number.parseFloat(formData.valor),
        data: formData.data,
      }

      const resultado = await atualizarTransacao(transacaoParaEditar.id, dadosAtualizados)
      if (resultado.success) {
        setIsEditOpen(false)
        setTransacaoParaEditar(null)
      }
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
          <Label>Categoria</Label>
          <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias[formData.tipo].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao-edit">Descrição</Label>
          <Input
            id="descricao-edit"
            placeholder="Descrição da transação"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valor-edit">Valor (R$)</Label>
            <Input
              id="valor-edit"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-edit">Data</Label>
            <Input
              id="data-edit"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              setIsEditOpen(false)
              setTransacaoParaEditar(null)
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
            Atualizar Transação
          </Button>
        </div>
      </form>
    )
  }

  const FiltroDataModal = () => {
    const [filtroTemp, setFiltroTemp] = useState(filtros.data)
    const [dataInicioTemp, setDataInicioTemp] = useState(filtros.dataInicio || format(new Date(), 'yyyy-MM-dd'))
    const [dataFimTemp, setDataFimTemp] = useState(filtros.dataFim || format(new Date(), 'yyyy-MM-dd'))

    const aplicarFiltro = () => {
      setFiltros(prev => ({
        ...prev,
        data: filtroTemp,
        dataInicio: filtroTemp === 'personalizado' ? dataInicioTemp : undefined,
        dataFim: filtroTemp === 'personalizado' ? dataFimTemp : undefined
      }))
      setIsFilterOpen(false)
    }

    const opcoesFiltro = [
      { value: 'hoje', label: 'Hoje' },
      { value: 'ultimos-7', label: 'Últimos 7 dias' },
      { value: 'ultimos-15', label: 'Últimos 15 dias' },
      { value: 'ultimos-30', label: 'Últimos 30 dias' },
      { value: 'este-mes', label: 'Este mês' },
      { value: 'personalizado', label: 'Filtrar por data' }
    ]

    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Filtro de Data</h3>
        
        <div className="space-y-3">
          {opcoesFiltro.map((opcao) => (
            <div key={opcao.value} className="flex items-center">
              <input
                type="radio"
                id={opcao.value}
                name="filtro-data"
                value={opcao.value}
                checked={filtroTemp === opcao.value}
                onChange={(e) => setFiltroTemp(e.target.value as FiltroData)}
                className="mr-2"
              />
              <label htmlFor={opcao.value} className="text-sm text-slate-700 cursor-pointer">
                {opcao.label}
              </label>
            </div>
          ))}
        </div>

        {filtroTemp === 'personalizado' && (
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">Data Início</Label>
              <Input
                type="date"
                value={dataInicioTemp}
                onChange={(e) => setDataInicioTemp(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Data Fim</Label>
              <Input
                type="date"
                value={dataFimTemp}
                onChange={(e) => setDataFimTemp(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={aplicarFiltro}
            className="flex-1 bg-rose-500 hover:bg-rose-600"
          >
            Aplicar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-600">Carregando dados financeiros...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Financeiro</h1>
              <p className="text-slate-600">Controle suas receitas e despesas</p>
            </div>

            <div className="flex items-center gap-2">
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
                  <Tabs
                    value={tipoTransacao}
                    onValueChange={(value: string) =>
                      setTipoTransacao(value === 'despesa' ? 'despesa' : 'receita')
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="receita">Receita</TabsTrigger>
                      <TabsTrigger value="despesa">Despesa</TabsTrigger>
                    </TabsList>
                    <TabsContent value="receita" className="mt-4">
                      <NovaTransacaoForm />
                    </TabsContent>
                    <TabsContent value="despesa" className="mt-4">
                      <NovaTransacaoForm />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Barra de Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, telefone ou descrição..."
                      value={filtros.busca}
                      onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro de Tipo */}
                <div className="w-full sm:w-48">
                  <Select 
                    value={filtros.tipo} 
                    onValueChange={(value: 'todos' | 'receita' | 'despesa') => 
                      setFiltros(prev => ({ ...prev, tipo: value }))
                    }
                  >
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

                {/* Filtro de Data */}
                <div className="relative filter-container">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 ${temFiltrosAtivos() && filtros.data !== 'este-mes' ? 'border-rose-500 text-rose-600' : ''}`}
                  >
                    <Calendar className="w-4 h-4" />
                    {filtros.data === 'hoje' && 'Hoje'}
                    {filtros.data === 'ultimos-7' && 'Últimos 7 dias'}
                    {filtros.data === 'ultimos-15' && 'Últimos 15 dias'}
                    {filtros.data === 'ultimos-30' && 'Últimos 30 dias'}
                    {filtros.data === 'este-mes' && 'Este mês'}
                    {filtros.data === 'personalizado' && 'Período personalizado'}
                    {temFiltrosAtivos() && filtros.data !== 'este-mes' && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    )}
                  </Button>
                  {isFilterOpen && <FiltroDataModal />}
                </div>

                {/* Botão para limpar filtros */}
                {temFiltrosAtivos() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltros({
                      busca: '',
                      tipo: 'todos',
                      data: 'este-mes',
                      dataInicio: undefined,
                      dataFim: undefined
                    })}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>


      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {relatorioAtual.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {relatorioAtual.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${relatorioAtual.lucro >= 0 ? "text-blue-600" : "text-red-600"}`}>
              R$ {relatorioAtual.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Margem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {relatorioAtual.receitas > 0
                ? ((relatorioAtual.lucro / relatorioAtual.receitas) * 100).toFixed(1)
                : "0.0"}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transações</span>
            {temFiltrosAtivos() && (
              <span className="text-sm font-normal text-slate-500">
                ({relatorioAtual.transacoes.length} resultado{relatorioAtual.transacoes.length !== 1 ? 's' : ''} filtrado{relatorioAtual.transacoes.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {!temFiltrosAtivos() 
              ? `${relatorioAtual.transacoes.length} transação(ões) encontrada(s)` 
              : `Mostrando resultados filtrados`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatorioAtual.transacoes
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-xl text-xs font-medium ${
                          transacao.tipo === "receita" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transacao.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                      <span className="text-sm text-slate-600">{transacao.categoria}</span>
                    </div>
                    <p className="font-medium text-slate-800 mt-1">{transacao.descricao}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transacao.tipo === "receita" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {transacao.tipo === "receita" ? "+" : "-"} R$ {transacao.valor.toFixed(2)}
                      </p>
                    </div>
                    {/* Menu de ações */}
                    <div className="relative">
                      <button
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActionMenuFor(actionMenuFor === transacao.id ? null : transacao.id)
                        }}
                        aria-label="Ações"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </button>
                      {actionMenuFor === transacao.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                          <button
                            className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTransacao(transacao)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTransacao(transacao.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {relatorioAtual.transacoes.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {temFiltrosAtivos() 
                  ? "Nenhuma transação encontrada com os filtros aplicados" 
                  : "Nenhuma transação encontrada para este período"
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              onClick={confirmarExclusao}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar transação */}
      {isEditOpen && transacaoParaEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Editar Transação</h2>
            <EditarTransacaoForm />
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
