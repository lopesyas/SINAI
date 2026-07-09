import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { GeometricBackground } from '../components/GeometricBackground'

export default function NovoAtendimento() {
  const navigate = useNavigate()
  const [profissionais, setProfissionais] = useState([])
  const [profissionalId, setProfissionalId] = useState('')
  const [pacienteRef, setPacienteRef] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [novoCargo, setNovoCargo] = useState('Médico')
  const [mostraCadastro, setMostraCadastro] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.listarProfissionais()
      .then((list) => {
        setProfissionais(list)
        if (list.length > 0) setProfissionalId(list[0].id)
        else setMostraCadastro(true)
      })
      .catch(() => setMostraCadastro(true))
  }, [])

  async function handleCriarProfissional(e) {
    e.preventDefault()
    if (!novoNome.trim()) return
    setLoading(true)
    try {
      const prof = await api.criarProfissional({
        nome: novoNome,
        cargo: novoCargo,
        hospital_nome: 'HC-UFPE',
      })
      setProfissionais((prev) => [...prev, prof])
      setProfissionalId(prof.id)
      setMostraCadastro(false)
      setNovoNome('')
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleIniciar(e) {
    e.preventDefault()
    if (!profissionalId || !pacienteRef.trim()) {
      setErro('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const atend = await api.criarAtendimento({
        profissional_id: profissionalId,
        paciente_ref: pacienteRef.trim(),
      })
      navigate(`/atendimento/${atend.id}/medico`)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      <GeometricBackground />

      {/* Header */}
      <header className="relative z-10 px-8 py-6">
        <Logo size="md" />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Título */}
          <div className="text-center mb-10">
            <h1
              className="text-4xl font-extrabold mb-3"
              style={{ color: '#14275E', fontFamily: 'Nunito, sans-serif' }}
            >
              Novo Atendimento
            </h1>
            <p className="text-lg" style={{ color: '#2E2E2E' }}>
              Preencha os dados para iniciar a sessão de comunicação.
            </p>
          </div>

          {/* Card formulário */}
          <div
            className="rounded-[24px] border-2 border-[#F1E8D8] bg-[#FFFDF8] p-8 shadow-lg"
          >
            {/* Cadastro de profissional */}
            {mostraCadastro ? (
              <form onSubmit={handleCriarProfissional} className="space-y-4 mb-6">
                <p className="text-sm font-semibold" style={{ color: '#14275E' }}>
                  Cadastrar profissional
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E2E2E' }}>
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Dr. João Silva"
                    className="w-full border-2 border-[#F1E8D8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#2F6FED] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2E2E2E' }}>
                    Cargo
                  </label>
                  <select
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    className="w-full border-2 border-[#F1E8D8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#2F6FED] transition bg-white"
                  >
                    <option>Médico</option>
                    <option>Enfermeiro</option>
                    <option>Técnico de Enfermagem</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Salvando…' : 'Salvar'}
                  </Button>
                  {profissionais.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => setMostraCadastro(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            ) : null}

            {/* Formulário principal */}
            <form onSubmit={handleIniciar} className="space-y-5">
              {/* Seleção de profissional */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
                    Profissional de saúde
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostraCadastro(true)}
                    className="text-xs font-semibold"
                    style={{ color: '#2F6FED' }}
                  >
                    + Novo
                  </button>
                </div>
                <select
                  value={profissionalId}
                  onChange={(e) => setProfissionalId(e.target.value)}
                  className="w-full border-2 border-[#F1E8D8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#2F6FED] transition bg-white"
                  required
                >
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {p.cargo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referência do paciente */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2E2E2E' }}>
                  Referência do paciente
                  <span className="ml-1 text-xs font-normal opacity-60">(sem nome/CPF)</span>
                </label>
                <input
                  type="text"
                  value={pacienteRef}
                  onChange={(e) => setPacienteRef(e.target.value)}
                  placeholder="Ex: Prontuário #4892"
                  className="w-full border-2 border-[#F1E8D8] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#2F6FED] transition bg-white"
                  required
                />
              </div>

              {erro && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{erro}</p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Iniciando…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Iniciar Atendimento
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Rodapé informativo */}
          <p className="text-center text-xs mt-6 opacity-50" style={{ color: '#2E2E2E' }}>
            SINAI — Sistema Inteligente de Navegação e Atendimento Inclusivo · HC-UFPE
          </p>
        </div>
      </main>
    </div>
  )
}
