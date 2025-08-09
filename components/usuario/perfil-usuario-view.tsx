"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsuarioEmpresa } from "@/hooks/use-usuario-empresa"
import { Building2, User, Plus, Save } from "lucide-react"

export function PerfilUsuarioView() {
  const { 
    usuario, 
    empresas, 
    loading, 
    error, 
    criarUsuario,
    atualizarUsuario,
    criarEmpresa,
    associarEmpresa 
  } = useUsuarioEmpresa()

  const [nomeUsuario, setNomeUsuario] = useState("")
  const [novaEmpresa, setNovaEmpresa] = useState("")
  const [empresaSelecionada, setEmpresaSelecionada] = useState("")
  const [editando, setEditando] = useState(false)

  const handleSalvarUsuario = async () => {
    if (!usuario && nomeUsuario) {
      const result = await criarUsuario(nomeUsuario, empresaSelecionada || undefined)
      if (result.success) {
        setNomeUsuario("")
        setEmpresaSelecionada("")
      }
    } else if (usuario && nomeUsuario) {
      const result = await atualizarUsuario({ 
        nome: nomeUsuario,
        empresa_id: empresaSelecionada || null
      })
      if (result.success) {
        setEditando(false)
      }
    }
  }

  const handleCriarEmpresa = async () => {
    if (novaEmpresa) {
      const result = await criarEmpresa(novaEmpresa)
      if (result.success) {
        setNovaEmpresa("")
        setEmpresaSelecionada(result.data.id)
      }
    }
  }

  const iniciarEdicao = () => {
    setNomeUsuario(usuario?.nome || "")
    setEmpresaSelecionada(usuario?.empresa_id || "")
    setEditando(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-600">Erro: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Perfil do Usuário</h2>
          <p className="text-slate-600">Gerencie seus dados pessoais e empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Usuário
            </CardTitle>
            <CardDescription>
              {usuario ? "Suas informações pessoais" : "Complete seu cadastro"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usuario && !editando ? (
              <>
                <div>
                  <Label>Nome</Label>
                  <p className="text-lg font-medium">{usuario.nome}</p>
                </div>
                <div>
                  <Label>Empresa</Label>
                  <p className="text-lg">{usuario.empresa?.nome || 'Nenhuma empresa associada'}</p>
                </div>
                <Button onClick={iniciarEdicao} variant="outline" className="w-full">
                  Editar Informações
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>
                
                <div>
                  <Label>Empresa</Label>
                  <Select value={empresaSelecionada} onValueChange={setEmpresaSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma empresa</SelectItem>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSalvarUsuario} 
                    disabled={!nomeUsuario}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {usuario ? 'Atualizar' : 'Salvar'}
                  </Button>
                  {editando && (
                    <Button 
                      onClick={() => setEditando(false)} 
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card de Gerenciamento de Empresas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas
            </CardTitle>
            <CardDescription>
              Crie ou gerencie empresas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nova-empresa">Nova Empresa</Label>
              <div className="flex gap-2">
                <Input
                  id="nova-empresa"
                  value={novaEmpresa}
                  onChange={(e) => setNovaEmpresa(e.target.value)}
                  placeholder="Nome da empresa"
                />
                <Button 
                  onClick={handleCriarEmpresa}
                  disabled={!novaEmpresa}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Empresas Disponíveis</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {empresas.map((empresa) => (
                  <div 
                    key={empresa.id} 
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm">{empresa.nome}</span>
                    {usuario && usuario.empresa_id !== empresa.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => associarEmpresa(empresa.id)}
                      >
                        Associar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
