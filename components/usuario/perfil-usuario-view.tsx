"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Phone, MapPin } from "lucide-react"

type PerfilUsuario = {
  nome_completo?: string
  telefone?: string
  endereco?: string
  bio?: string
}

export function PerfilUsuarioView() {
  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nome_completo: "Usuário",
    telefone: "",
    endereco: "",
    bio: ""
  })
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState(perfil)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simular salvamento
    setTimeout(() => {
      setPerfil(formData)
      setEditMode(false)
      setLoading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setFormData(perfil)
    setEditMode(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
          <p className="text-slate-600">Gerencie suas informações pessoais</p>
        </div>

        {!editMode && (
          <Button onClick={() => setEditMode(true)} className="bg-rose-500 hover:bg-rose-600">
            Editar Perfil
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            {editMode ? "Edite suas informações pessoais" : "Suas informações pessoais"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input
                  id="nome_completo"
                  placeholder="Seu nome completo"
                  value={formData.nome_completo || ""}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone || ""}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  placeholder="Seu endereço completo"
                  value={formData.endereco || ""}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você e seu trabalho..."
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-rose-500 hover:bg-rose-600" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    {perfil.nome_completo || "Nome não informado"}
                  </h3>
                  <p className="text-slate-600">Profissional de beleza</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-slate-500 mt-1" />
                    <div>
                      <p className="font-medium text-slate-800">Telefone</p>
                      <p className="text-slate-600">{perfil.telefone || "Não informado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                    <div>
                      <p className="font-medium text-slate-800">Endereço</p>
                      <p className="text-slate-600">{perfil.endereco || "Não informado"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Biografia</h4>
                  <p className="text-slate-600">
                    {perfil.bio || "Nenhuma biografia adicionada ainda."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas do Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Perfil Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">75%</div>
            <p className="text-xs text-slate-500 mt-1">Complete seu perfil</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Membro desde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">2024</div>
            <p className="text-xs text-slate-500 mt-1">Janeiro</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">12</div>
            <p className="text-xs text-slate-500 mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
