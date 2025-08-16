"use client"

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
  const { user } = useAuth()
  const supabase = createClient()
  const [mesAtual, setMesAtual] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<"receita" | "despesa">("receita")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTransacaoId, setSelectedTransacaoId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null)
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
  }

  // Função para editar transação
  const handleEditTransacao = (transacao: Transacao) => {
    setTransacaoParaEditar(transacao)
    setTipoTransacao(transacao.tipo)
    setIsEditOpen(true)
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
      // Fechar menu de ações ao clicar fora
      if (actionMenuFor) {
        const target = event.target as Element
        if (!target.closest('.relative')) {
          setActionMenuFor(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isFilterOpen, actionMenuFor])

  const NovaTransacaoForm = () => {
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const [nomeEditando, setNomeEditando] = useState("");
  const [confirmarExclusaoCat, setConfirmarExclusaoCat] = useState<{id: string, nome: string, publica: boolean} | null>(null);
    const [formData, setFormData] = useState({
      tipo: tipoTransacao,
      categoria: "",
      descricao: "",
      valor: "",
      data: format(new Date(), "yyyy-MM-dd"),
    })

    const [categorias, setCategorias] = useState<{id: string, nome: string, tipo: string, publica: boolean}[]>([]);
    const [novaCategoria, setNovaCategoria] = useState("");
    const [loadingCategorias, setLoadingCategorias] = useState(false);

    // Funções para gerenciar categorias no Supabase
    const buscarCategorias = async (tipo: "receita" | "despesa") => {
      setLoadingCategorias(true);
      try {
        // Buscar o empresa_id do perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('empresa_id')
          .eq('id', user?.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Buscar categorias públicas e da empresa para o tipo específico
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .eq('tipo', tipo)
          .or(`publica.eq.true,empresa_id.eq.${profileData.empresa_id}`)
          .order('nome');
        
        if (error) throw error;
        setCategorias(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
      setLoadingCategorias(false);
    };

    const criarCategoria = async (nome: string, tipo: "receita" | "despesa") => {
      try {
        // Buscar o empresa_id do perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('empresa_id')
          .eq('id', user?.id)
          .single();
        
        if (profileError) throw profileError;
        
        const { data, error } = await supabase
          .from('categorias')
          .insert([{
            nome: nome.trim(),
            tipo,
            publica: false,
            empresa_id: profileData.empresa_id
          }])
          .select()
          .single();
        
        if (error) throw error;
        await buscarCategorias(tipo);
        return { success: true, data };
      } catch (error) {
        console.error('Erro ao criar categoria:', error);
        return { success: false, error };
      }
    };

    const editarCategoria = async (id: string, novoNome: string) => {
      try {
        const { error } = await supabase
          .from('categorias')
          .update({ nome: novoNome.trim() })
          .eq('id', id)
          .eq('publica', false); // Só permite editar categorias não públicas
        
        if (error) throw error;
        await buscarCategorias(formData.tipo);
        return { success: true };
      } catch (error) {
        console.error('Erro ao editar categoria:', error);
        return { success: false, error };
      }
    };

    const excluirCategoria = async (id: string) => {
      try {
        const { error } = await supabase
          .from('categorias')
          .delete()
          .eq('id', id)
          .eq('publica', false); // Só permite excluir categorias não públicas
        
        if (error) throw error;
        await buscarCategorias(formData.tipo);
        return { success: true };
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        return { success: false, error };
      }
    };

    // Carregar categorias quando o tipo muda
    useEffect(() => {
      buscarCategorias(formData.tipo);
    }, [formData.tipo]);

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
            
            
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <div className="relative">
            <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategorias ? (
                  <div className="px-2 py-4 text-center text-sm text-slate-500">
                    Carregando categorias...
                  </div>
                ) : (
                  <>
                    {categorias.map((cat) => (
                      <div key={cat.id} className="flex items-center group px-2 py-1 rounded hover:bg-slate-100 transition-all">
                        {editandoCategoria === cat.id ? (
                          <div className="flex items-center w-full">
                            <input
                              className="border border-slate-300 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              value={nomeEditando}
                              onChange={e => setNomeEditando(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  editarCategoria(cat.id, nomeEditando);
                                  setEditandoCategoria(null);
                                } else if (e.key === 'Escape') {
                                  setEditandoCategoria(null);
                                }
                              }}
                              autoFocus
                            />
                            <button 
                              type="button" 
                              className="text-emerald-600 ml-2 hover:bg-emerald-50 rounded p-1" 
                              title="Salvar" 
                              onClick={() => {
                                editarCategoria(cat.id, nomeEditando);
                                setEditandoCategoria(null);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <SelectItem value={cat.nome} className="flex-1">{cat.nome}</SelectItem>
                            {!cat.publica && (
                              <>
                                <button 
                                  type="button" 
                                  className="ml-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded p-1" 
                                  title="Editar" 
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditandoCategoria(cat.id);
                                    setNomeEditando(cat.nome);
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  type="button" 
                                  className="ml-1 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded p-1" 
                                  title="Excluir" 
                                  onClick={e => {
                                    e.stopPropagation();
                                    setConfirmarExclusaoCat({id: cat.id, nome: cat.nome, publica: cat.publica});
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    <div className="flex flex-col items-center justify-center px-2 py-2 mt-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center w-full gap-2">
                        <input
                          className="border border-slate-200 rounded-full px-4 py-2 text-xs w-full focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white text-center"
                          placeholder="Nova categoria"
                          value={novaCategoria}
                          onChange={e => setNovaCategoria(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && novaCategoria.trim()) {
                              criarCategoria(novaCategoria, formData.tipo);
                              setNovaCategoria("");
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-semibold transition-colors" 
                          style={{minWidth:'90px'}} 
                          onClick={() => {
                            if (novaCategoria.trim()) {
                              criarCategoria(novaCategoria, formData.tipo);
                              setNovaCategoria("");
                            }
                          }}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </SelectContent>
            </Select>
            {/* Confirmação de exclusão de categoria */}
            {confirmarExclusaoCat && (
              <Dialog open={true} onOpenChange={() => setConfirmarExclusaoCat(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Excluir Categoria</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja excluir a categoria "{confirmarExclusaoCat.nome}"? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      className="bg-rose-600 hover:bg-rose-700"
                      onClick={async () => {
                        await excluirCategoria(confirmarExclusaoCat.id);
                        setConfirmarExclusaoCat(null);
                        if (formData.categoria === confirmarExclusaoCat.nome) {
                          setFormData(f => ({...f, categoria: ""}));
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
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

    const [categorias, setCategorias] = useState<{id: string, nome: string, tipo: string, publica: boolean}[]>([]);
    const [novaCategoria, setNovaCategoria] = useState("");
    const [loadingCategorias, setLoadingCategorias] = useState(false);
    const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
    const [nomeEditando, setNomeEditando] = useState("");
    const [confirmarExclusaoCat, setConfirmarExclusaoCat] = useState<{id: string, nome: string, publica: boolean} | null>(null);

    // Funções para gerenciar categorias no Supabase (mesmas do NovaTransacaoForm)
    const buscarCategorias = async (tipo: "receita" | "despesa") => {
      setLoadingCategorias(true);
      try {
        // Buscar o empresa_id do perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('empresa_id')
          .eq('id', user?.id)
          .single();
        
        if (profileError) throw profileError;
        
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .eq('tipo', tipo)
          .or(`publica.eq.true,empresa_id.eq.${profileData.empresa_id}`)
          .order('nome');
        
        if (error) throw error;
        setCategorias(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
      setLoadingCategorias(false);
    };

    const criarCategoria = async (nome: string, tipo: "receita" | "despesa") => {
      try {
        // Buscar o empresa_id do perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('empresa_id')
          .eq('id', user?.id)
          .single();
        
        if (profileError) throw profileError;
        
        const { data, error } = await supabase
          .from('categorias')
          .insert([{...