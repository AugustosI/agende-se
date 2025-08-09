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
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Transacao {
  id: number
  tipo: "receita" | "despesa"
  categoria: string
  descricao: string
  valor: number
  data: string
  agendamentoId?: number
}

interface RelatorioMensal {
  mes: string
  receitas: number
  despesas: number
  lucro: number
  transacoes: Transacao[]
}

export function FinanceiroView() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<"receita" | "despesa">("receita")

  // Dados de exemplo
  useEffect(() => {
    const hoje = new Date()
    const transacoesExemplo: Transacao[] = [
      {
        id: 1,
        tipo: "receita",
        categoria: "Serviços",
        descricao: "Corte + Escova - Maria Silva",
        valor: 50.0,
        data: format(hoje, "yyyy-MM-dd"),
        agendamentoId: 1,
      },
      {
        id: 2,
        tipo: "receita",
        categoria: "Serviços",
        descricao: "Barba - João Santos",
        valor: 25.0,
        data: format(hoje, "yyyy-MM-dd"),
        agendamentoId: 2,
      },
      {
        id: 3,
        tipo: "despesa",
        categoria: "Produtos",
        descricao: "Shampoo e Condicionador",
        valor: 45.0,
        data: format(hoje, "yyyy-MM-dd"),
      },
      {
        id: 4,
        tipo: "despesa",
        categoria: "Fixas",
        descricao: "Aluguel do Salão",
        valor: 800.0,
        data: format(startOfMonth(hoje), "yyyy-MM-dd"),
      },
    ]
    setTransacoes(transacoesExemplo)
  }, [])

  const getRelatorioMensal = (mes: Date): RelatorioMensal => {
    const inicioMes = startOfMonth(mes)
    const fimMes = endOfMonth(mes)

    const transacoesMes = transacoes.filter((t) => {
      const dataTransacao = new Date(t.data)
      return dataTransacao >= inicioMes && dataTransacao <= fimMes
    })

    const receitas = transacoesMes.filter((t) => t.tipo === "receita").reduce((sum, t) => sum + t.valor, 0)

    const despesas = transacoesMes.filter((t) => t.tipo === "despesa").reduce((sum, t) => sum + t.valor, 0)

    return {
      mes: format(mes, "MMMM yyyy", { locale: ptBR }),
      receitas,
      despesas,
      lucro: receitas - despesas,
      transacoes: transacoesMes,
    }
  }

  const relatorioAtual = getRelatorioMensal(mesAtual)

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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      const novaTransacao: Transacao = {
        id: Date.now(),
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

  return (
    <div className="space-y-6">
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
              <Tabs value={tipoTransacao} onValueChange={(value: "receita" | "despesa") => setTipoTransacao(value)}>
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

      {/* Seletor de Mês */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setMesAtual(subMonths(mesAtual, 1))}>
              Mês Anterior
            </Button>

            <CardTitle className="text-lg capitalize">{relatorioAtual.mes}</CardTitle>

            <Button variant="outline" onClick={() => setMesAtual(new Date())}>
              Mês Atual
            </Button>
          </div>
        </CardHeader>
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
          <CardTitle>Transações do Mês</CardTitle>
          <CardDescription>{relatorioAtual.transacoes.length} transação(ões) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatorioAtual.transacoes
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transacao.tipo === "receita" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {transacao.tipo === "receita" ? "+" : "-"} R$ {transacao.valor.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

            {relatorioAtual.transacoes.length === 0 && (
              <div className="text-center py-8 text-slate-500">Nenhuma transação encontrada para este mês</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
