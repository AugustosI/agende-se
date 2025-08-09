"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Users, Settings, Plus, BarChart3, Menu } from "lucide-react"
import { AgendaView } from "@/components/agenda/agenda-view"
import { FinanceiroView } from "@/components/financeiro/financeiro-view"
import { ClientesView } from "@/components/clientes/clientes-view"
import { ServicosView } from "@/components/servicos/servicos-view"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/use-auth"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type ViewType = "dashboard" | "agenda" | "financeiro" | "clientes" | "servicos"

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user) {
    return <LoginForm />
  }

  const renderView = () => {
    switch (currentView) {
      case "agenda":
        return <AgendaView />
      case "financeiro":
        return <FinanceiroView />
      case "clientes":
        return <ClientesView />
      case "servicos":
        return <ServicosView />
      default:
        return <DashboardView />
    }
  }

  const DashboardView = () => {
    const [stats, setStats] = useState({
      agendamentosHoje: 0,
      receitaMes: 0,
      clientesAtivos: 0,
      proximosAgendamentos: [],
    })

    useEffect(() => {
      // Simular carregamento de estatísticas
      setStats({
        agendamentosHoje: 3,
        receitaMes: 2450.0,
        clientesAtivos: 15,
        proximosAgendamentos: [
          { id: 1, cliente: "Maria Silva", servico: "Corte + Escova", horario: "14:00", data: "Hoje" },
          { id: 2, cliente: "João Santos", servico: "Barba", horario: "15:30", data: "Hoje" },
          { id: 3, cliente: "Ana Costa", servico: "Manicure", horario: "09:00", data: "Amanhã" },
        ],
      })
    }, [])

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">Bem-vindo ao Agende-se</p>
          </div>
          <Button onClick={() => setCurrentView("agenda")} className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-rose-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Agendamentos Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.agendamentosHoje}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Receita do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                R$ {stats.receitaMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Clientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.clientesAtivos}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">75%</div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Próximos Agendamentos</CardTitle>
            <CardDescription>Seus compromissos para hoje e amanhã</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.proximosAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{agendamento.cliente}</p>
                    <p className="text-sm text-slate-600">{agendamento.servico}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">{agendamento.horario}</p>
                    <p className="text-sm text-slate-600">{agendamento.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-800">Agende-se</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Menu Mobile */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <div className="flex items-center bg-white rounded-2xl border p-1">
                    <Button variant="outline" size="sm">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>Navegue pelas opções do sistema</SheetDescription>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    {/* Opções completas no mobile, só sair no desktop */}
                    <div className="lg:hidden space-y-1">
                      <Button
                        variant={currentView === "dashboard" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          currentView === "dashboard"
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          setCurrentView("dashboard")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>

                      <Button
                        variant={currentView === "agenda" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          currentView === "agenda"
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          setCurrentView("agenda")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agenda
                      </Button>

                      <Button
                        variant={currentView === "financeiro" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          currentView === "financeiro"
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          setCurrentView("financeiro")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Financeiro
                      </Button>

                      <Button
                        variant={currentView === "clientes" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          currentView === "clientes"
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          setCurrentView("clientes")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Clientes
                      </Button>

                      <Button
                        variant={currentView === "servicos" ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          currentView === "servicos"
                            ? "bg-rose-500 hover:bg-rose-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => {
                          setCurrentView("servicos")
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Serviços
                      </Button>

                      <div className="border-t pt-2 mt-4">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                          onClick={() => {
                            logout()
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          Sair
                        </Button>
                      </div>
                    </div>

                    {/* Apenas sair no desktop */}
                    <div className="hidden lg:block">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        Sair
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Escondido no mobile */}
          <aside className="hidden lg:block w-64 space-y-2">
            <nav className="space-y-1">
              <Button
                variant={currentView === "dashboard" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === "dashboard"
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setCurrentView("dashboard")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              <Button
                variant={currentView === "agenda" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === "agenda"
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setCurrentView("agenda")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agenda
              </Button>

              <Button
                variant={currentView === "financeiro" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === "financeiro"
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setCurrentView("financeiro")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financeiro
              </Button>

              <Button
                variant={currentView === "clientes" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === "clientes"
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setCurrentView("clientes")}
              >
                <Users className="w-4 h-4 mr-2" />
                Clientes
              </Button>

              <Button
                variant={currentView === "servicos" ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentView === "servicos"
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setCurrentView("servicos")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Serviços
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{renderView()}</main>
        </div>
      </div>
    </div>
  )
}
