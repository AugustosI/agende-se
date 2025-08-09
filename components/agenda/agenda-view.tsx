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
import { Calendar, Clock, Plus, List, Grid, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: number
  clienteId: number
  clienteNome: string
  servicoId: number
  servicoNome: string
  data: string
  horario: string
  duracao: number
  preco: number
  status: "agendado" | "concluido" | "cancelado"
  observacoes?: string
}

interface Cliente {
  id: number
  nome: string
  telefone: string
}

interface Servico {
  id: number
  nome: string
  duracao: number
  preco: number
}

export function AgendaView() {
  const [viewType, setViewType] = useState<"calendar" | "list">("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Dados de exemplo
  useEffect(() => {
    setClientes([
      { id: 1, nome: "Maria Silva", telefone: "(11) 99999-9999" },
      { id: 2, nome: "João Santos", telefone: "(11) 88888-8888" },
      { id: 3, nome: "Ana Costa", telefone: "(11) 77777-7777" },
    ])

    setServicos([
      { id: 1, nome: "Corte + Escova", duracao: 60, preco: 50.0 },
      { id: 2, nome: "Barba", duracao: 30, preco: 25.0 },
      { id: 3, nome: "Manicure", duracao: 45, preco: 30.0 },
    ])

    setAgendamentos([
      {
        id: 1,
        clienteId: 1,
        clienteNome: "Maria Silva",
        servicoId: 1,
        servicoNome: "Corte + Escova",
        data: format(new Date(), "yyyy-MM-dd"),
        horario: "14:00",
        duracao: 60,
        preco: 50.0,
        status: "agendado",
      },
      {
        id: 2,
        clienteId: 2,
        clienteNome: "João Santos",
        servicoId: 2,
        servicoNome: "Barba",
        data: format(new Date(), "yyyy-MM-dd"),
        horario: "15:30",
        duracao: 30,
        preco: 25.0,
        status: "agendado",
      },
    ])
  }, [])

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getAgendamentosForDay = (date: Date) => {
    return agendamentos.filter((ag) => isSameDay(parseISO(ag.data), date))
  }

  const NovoAgendamentoForm = () => {
    const [formData, setFormData] = useState({
      clienteId: "",
      servicoId: "",
      data: format(new Date(), "yyyy-MM-dd"),
      horario: "",
      observacoes: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      const cliente = clientes.find((c) => c.id === Number.parseInt(formData.clienteId))
      const servico = servicos.find((s) => s.id === Number.parseInt(formData.servicoId))

      if (!cliente || !servico) return

      const novoAgendamento: Agendamento = {
        id: Date.now(),
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        servicoId: servico.id,
        servicoNome: servico.nome,
        data: formData.data,
        horario: formData.horario,
        duracao: servico.duracao,
        preco: servico.preco,
        status: "agendado",
        observacoes: formData.observacoes,
      }

      setAgendamentos([...agendamentos, novoAgendamento])
      setIsDialogOpen(false)
      setFormData({
        clienteId: "",
        servicoId: "",
        data: format(new Date(), "yyyy-MM-dd"),
        horario: "",
        observacoes: "",
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id.toString()}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="servico">Serviço</Label>
          <Select value={formData.servicoId} onValueChange={(value) => setFormData({ ...formData, servicoId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {servicos.map((servico) => (
                <SelectItem key={servico.id} value={servico.id.toString()}>
                  {servico.nome} - R$ {servico.preco.toFixed(2)} ({servico.duracao}min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Input
              id="horario"
              type="time"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            placeholder="Observações adicionais"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600">
          Agendar
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
          <p className="text-slate-600">Gerencie seus agendamentos</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-2xl border p-1">
            <Button
              variant={viewType === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("calendar")}
              className={viewType === "calendar" ? "bg-rose-500 hover:bg-rose-600" : ""}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className={viewType === "list" ? "bg-rose-500 hover:bg-rose-600" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-500 hover:bg-rose-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>Preencha os dados para criar um novo agendamento</DialogDescription>
              </DialogHeader>
              <NovoAgendamentoForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navegação da Semana */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <CardTitle className="text-lg">
              {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
            </CardTitle>

            <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Vista de Calendário */}
      {viewType === "calendar" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAgendamentos = getAgendamentosForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <Card key={day.toISOString()} className={`${isToday ? "ring-2 ring-rose-200" : ""} min-h-[200px]`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center font-medium">
                    {format(day, "EEE", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription className="text-center text-xs">
                    {format(day, "dd/MM", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayAgendamentos.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="p-2 bg-rose-100 rounded-xl text-xs hover:bg-rose-200 transition-colors cursor-pointer"
                    >
                      <div className="font-medium text-slate-800">{agendamento.horario}</div>
                      <div className="text-slate-600 truncate" title={agendamento.clienteNome}>
                        {agendamento.clienteNome}
                      </div>
                      <div className="text-slate-500 truncate" title={agendamento.servicoNome}>
                        {agendamento.servicoNome}
                      </div>
                    </div>
                  ))}
                  {dayAgendamentos.length === 0 && (
                    <div className="text-center text-slate-400 text-xs py-8">Sem agendamentos</div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Vista de Lista */}
      {viewType === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agendamentos
                .filter((ag) => {
                  const agDate = parseISO(ag.data)
                  return agDate >= weekStart && agDate <= weekEnd
                })
                .sort((a, b) => {
                  const dateA = new Date(`${a.data}T${a.horario}`)
                  const dateB = new Date(`${b.data}T${b.horario}`)
                  return dateA.getTime() - dateB.getTime()
                })
                .map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-sm">
                          {format(parseISO(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{agendamento.horario}</span>
                      </div>
                      <p className="text-lg font-medium text-slate-800 mb-1">{agendamento.clienteNome}</p>
                      <p className="text-slate-600 text-sm">{agendamento.servicoNome}</p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="font-medium text-slate-800">R$ {agendamento.preco.toFixed(2)}</p>
                      <p className="text-sm text-slate-600">{agendamento.duracao}min</p>
                    </div>
                  </div>
                ))}

              {agendamentos.length === 0 && (
                <div className="text-center py-8 text-slate-500">Nenhum agendamento encontrado para esta semana</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
