import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { AtendimentoProvider, useAtendimento } from '../context/AtendimentoContext'
import { api } from '../services/api'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { SymptomCard } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { GeometricBackground } from '../components/GeometricBackground'
import { VLibrasPlayer } from '../components/VLibrasPlayer'
import { CameraSign } from '../components/CameraSign'

// ── Modos de resposta ─────────────────────────────────────────────────────
const MODOS = {
  AGUARDANDO: 'aguardando',
  CAMERA: 'camera',
  BIBLIOTECA: 'biblioteca',
  SIM_NAO: 'simNao',
}

// ── Biblioteca visual inline ──────────────────────────────────────────────

const LOCAIS_EMOJI = {
  cabeça: '🤕', peito: '💔', barriga: '🤢', costas: '🔙',
  pernas: '🦵', braços: '💪', pescoço: '🦒',
}

function BibliotecaVisual({ onEnviar }) {
  const [biblioteca, setBiblioteca] = useState({ categorias: [], itens: [] })
  const [passo, setPasso] = useState(0)
  const [categoria, setCategoria] = useState(null)
  const [local, setLocal] = useState(null)
  const [enviado, setEnviado] = useState(false)

  const CATEGORIA_META = {
    'dor': { emoji: '😣' }, 'mal-estar': { emoji: '🤒' },
    'enjoo': { emoji: '🤢' }, 'tontura': { emoji: '😵' },
    'falta de ar': { emoji: '😮‍💨' }, 'febre': { emoji: '🌡️' },
    'outro': { emoji: '❓' },
  }

  useEffect(() => {
    api.getBiblioteca().then(setBiblioteca).catch(console.error)
  }, [])

  function locaisDeCategoria(cat) {
    const set = new Set()
    biblioteca.itens.forEach((i) => {
      if (i.categoria === cat && i.local !== null) set.add(i.local)
    })
    return [...set]
  }

  function intensidades(cat, loc) {
    return biblioteca.itens.filter(
      (i) => i.categoria === cat && i.local === loc && i.intensidade !== null
    )
  }

  function confirmarEnvio(texto) {
    onEnviar(texto)
    setEnviado(true)
    setTimeout(() => { setEnviado(false); setPasso(0); setCategoria(null); setLocal(null) }, 2500)
  }

  function handleCategoria(cat) {
    setCategoria(cat)
    const locais = locaisDeCategoria(cat)
    if (locais.length > 0) { setPasso(1); return }
    const item = biblioteca.itens.find(i => i.categoria === cat && !i.local && !i.intensidade)
    if (item) confirmarEnvio(item.texto_gerado)
  }

  function handleLocal(loc) {
    setLocal(loc)
    const ints = intensidades(categoria, loc)
    if (ints.length > 0) { setPasso(2); return }
    const item = biblioteca.itens.find(i => i.categoria === categoria && i.local === loc && !i.intensidade)
    if (item) confirmarEnvio(item.texto_gerado)
  }

  const INT_EMOJI = {
    pouca:'😕', leve:'😕', baixa:'😕', pouco:'😕',
    média:'😣', moderado:'😣',
    muita:'😫', forte:'😫', intenso:'🤢', alto:'🔥', muito:'🤢', vômito:'🤮',
  }

  if (enviado) return (
    <div className="flex flex-col items-center py-8 gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-3xl shadow-lg animate-bounce">✓</div>
      <p className="text-lg font-bold" style={{ color: '#14275E', fontFamily: 'Nunito' }}>Mensagem enviada!</p>
    </div>
  )

  const passos = ['O que sente?', 'Onde?', 'Quanto?']

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {passos.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${i === passo ? 'bg-[#2F6FED] text-white' : i < passo ? 'bg-emerald-400 text-white' : 'bg-[#F1E8D8] text-[#2E2E2E]'}`}>
              {i < passo ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === passo ? 'text-[#14275E]' : 'opacity-40'}`}>{label}</span>
            {i < 2 && <div className="w-5 h-px bg-[#F1E8D8]" />}
          </div>
        ))}
      </div>

      {passo === 0 && (
        <div>
          <p className="text-center text-base font-semibold mb-3" style={{ color: '#14275E' }}>O que você está sentindo?</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {biblioteca.categorias.map(cat => (
              <SymptomCard key={cat} emoji={CATEGORIA_META[cat]?.emoji || '❓'} label={cat.charAt(0).toUpperCase() + cat.slice(1)} onClick={() => handleCategoria(cat)} />
            ))}
          </div>
        </div>
      )}

      {passo === 1 && categoria && (
        <div>
          <button onClick={() => { setPasso(0); setCategoria(null) }} className="text-sm font-medium mb-3 flex items-center gap-1" style={{ color: '#2F6FED' }}>← Voltar</button>
          <p className="text-center text-base font-semibold mb-3" style={{ color: '#14275E' }}>Onde você sente {categoria}?</p>
          <div className="grid grid-cols-3 gap-2">
            {locaisDeCategoria(categoria).map(loc => (
              <SymptomCard key={loc} emoji={LOCAIS_EMOJI[loc] || '📍'} label={loc.charAt(0).toUpperCase() + loc.slice(1)} onClick={() => handleLocal(loc)} />
            ))}
          </div>
        </div>
      )}

      {passo === 2 && (
        <div>
          <button onClick={() => setPasso(1)} className="text-sm font-medium mb-3 flex items-center gap-1" style={{ color: '#2F6FED' }}>← Voltar</button>
          <p className="text-center text-base font-semibold mb-3" style={{ color: '#14275E' }}>Quanto {categoria}?</p>
          <div className="grid grid-cols-3 gap-2">
            {intensidades(categoria, local).map(item => (
              <SymptomCard key={item.id} emoji={INT_EMOJI[item.intensidade?.toLowerCase()] || '❗'} label={item.intensidade?.charAt(0).toUpperCase() + item.intensidade?.slice(1)} onClick={() => confirmarEnvio(item.texto_gerado)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Conteúdo principal ────────────────────────────────────────────────────

function PacienteContent() {
  const { mensagens, status, conectado, enviarMensagemPaciente } = useAtendimento()
  const [modo, setModo] = useState(MODOS.AGUARDANDO)
  const [ultimaMsgMedico, setUltimaMsgMedico] = useState(null)
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)
  const [cameraAtiva, setCameraAtiva] = useState(false)

  // Atualiza última mensagem do médico
  useEffect(() => {
    const msgs = mensagens.filter(m => m.remetente === 'medico')
    if (msgs.length > 0) {
      const ultima = msgs[msgs.length - 1]
      setUltimaMsgMedico(ultima)
      if (modo === MODOS.AGUARDANDO) setModo(MODOS.CAMERA)
    }
  }, [mensagens])

  function handleEnviar(texto, tipo = 'simbolo_estruturado') {
    enviarMensagemPaciente(texto, tipo)
    setFeedbackEnviado(true)
    setModo(MODOS.AGUARDANDO)
    setTimeout(() => setFeedbackEnviado(false), 3000)
  }

  function handleSinalCamera(resultado) {
    handleEnviar(resultado.texto, 'simbolo_estruturado')
  }

  function handleSimNao(resp) {
    handleEnviar(resp === 'sim' ? 'Paciente respondeu: SIM.' : 'Paciente respondeu: NÃO.')
  }

  // Ativa câmera ao entrar no modo câmera
  useEffect(() => {
    setCameraAtiva(modo === MODOS.CAMERA)
  }, [modo])

  if (status === 'finalizado') return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
      <div className="text-7xl">👋</div>
      <h2 className="text-3xl font-extrabold" style={{ color: '#14275E', fontFamily: 'Nunito' }}>Atendimento encerrado</h2>
      <p className="text-lg opacity-60">Obrigado. Cuide-se!</p>
    </main>
  )

  const textoVlibras = ultimaMsgMedico
    ? (ultimaMsgMedico.conteudo_simplificado || ultimaMsgMedico.conteudo_original)
    : ''

  return (
    <main className="flex-1 flex flex-col overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-4 py-5 flex flex-col gap-5">

        {/* ── Área do médico / VLibras ──────────────────────────── */}
        <div className="rounded-[24px] border-2 border-[#F1E8D8] bg-[#0d1b3e] overflow-hidden shadow-xl">
          {/* Balão da mensagem */}
          {ultimaMsgMedico ? (
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-white/40 mb-1">
                O médico perguntou:
              </p>
              <p className="text-xl font-bold text-white leading-snug" style={{ fontFamily: 'Nunito' }}>
                {ultimaMsgMedico.conteudo_simplificado || ultimaMsgMedico.conteudo_original}
              </p>
            </div>
          ) : (
            <div className="px-5 pt-5 pb-2">
              <p className="text-white/50 text-sm">
                {conectado ? 'Aguardando o médico…' : 'Conectando…'}
              </p>
            </div>
          )}

          {/* Player VLibras — sempre montado para pré-carregar o widget */}
          <div className="px-3 pb-4">
            <VLibrasPlayer texto={textoVlibras} autoplay />
          </div>
        </div>

        {/* ── Feedback enviado ──────────────────────────────────── */}
        {feedbackEnviado && (
          <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-xl text-white">✓</div>
            <div>
              <p className="font-bold text-emerald-800 text-sm">Resposta enviada!</p>
              <p className="text-emerald-600 text-xs">O médico recebeu sua mensagem.</p>
            </div>
          </div>
        )}

        {/* ── Área de resposta (só aparece quando há mensagem) ──── */}
        {ultimaMsgMedico && !feedbackEnviado && (
          <div className="space-y-4">
            {/* Seletor de modo de resposta */}
            <div className="grid grid-cols-3 gap-2">
              <ModoBtn
                label="🖐️ Libras"
                sublabel="Câmera"
                ativo={modo === MODOS.CAMERA}
                onClick={() => setModo(MODOS.CAMERA)}
              />
              <ModoBtn
                label="👍 Sim/Não"
                sublabel="Rápido"
                ativo={modo === MODOS.SIM_NAO}
                onClick={() => setModo(MODOS.SIM_NAO)}
              />
              <ModoBtn
                label="🗂️ Sintomas"
                sublabel="Lista"
                ativo={modo === MODOS.BIBLIOTECA}
                onClick={() => setModo(MODOS.BIBLIOTECA)}
              />
            </div>

            {/* ── Modo câmera / Libras ──────────────────────────── */}
            {modo === MODOS.CAMERA && (
              <div className="space-y-3">
                <CameraSign ativo={cameraAtiva} onSinalEnviado={handleSinalCamera} />
              </div>
            )}

            {/* ── Modo Sim/Não ──────────────────────────────────── */}
            {modo === MODOS.SIM_NAO && (
              <div className="grid grid-cols-2 gap-4">
                <SimNaoBtn emoji="👍" label="SIM" cor="emerald" onClick={() => handleSimNao('sim')} />
                <SimNaoBtn emoji="👎" label="NÃO" cor="red" onClick={() => handleSimNao('nao')} />
              </div>
            )}

            {/* ── Modo biblioteca visual ────────────────────────── */}
            {modo === MODOS.BIBLIOTECA && (
              <div className="bg-[#FFFDF8] border-2 border-[#F1E8D8] rounded-2xl p-4">
                <BibliotecaVisual onEnviar={(texto) => handleEnviar(texto)} />
              </div>
            )}
          </div>
        )}

        {/* Estado: sem mensagem e conectado */}
        {!ultimaMsgMedico && conectado && (
          <div className="text-center py-4 opacity-50 space-y-1">
            <p className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              Quando o médico enviar uma mensagem, ela aparecerá aqui.
            </p>
          </div>
        )}

        {/* Estado: desconectado */}
        {!conectado && (
          <div className="flex items-center justify-center gap-2 text-sm opacity-50">
            <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
            <span style={{ color: '#2E2E2E' }}>Conectando ao atendimento…</span>
          </div>
        )}
      </div>
    </main>
  )
}

// ── Componentes auxiliares ────────────────────────────────────────────────

function ModoBtn({ label, sublabel, ativo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-2xl border-2 transition-all text-center',
        ativo
          ? 'bg-[#2F6FED] border-[#2F6FED] text-white shadow-md scale-[1.02]'
          : 'bg-[#FFFDF8] border-[#F1E8D8] text-[#14275E] hover:border-[#2F6FED] hover:bg-blue-50',
      ].join(' ')}
    >
      <span className="text-lg leading-none">{label}</span>
      <span className={`text-xs font-medium ${ativo ? 'text-white/80' : 'opacity-50'}`}>{sublabel}</span>
    </button>
  )
}

function SimNaoBtn({ emoji, label, cor, onClick }) {
  const colors = {
    emerald: 'hover:border-emerald-400 hover:bg-emerald-50 active:bg-emerald-100',
    red: 'hover:border-red-400 hover:bg-red-50 active:bg-red-100',
  }
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[20px] border-2 border-[#F1E8D8] bg-[#FFFDF8] active:scale-95 transition shadow cursor-pointer ${colors[cor]}`}
    >
      <span className="text-5xl">{emoji}</span>
      <span className="text-xl font-bold" style={{ color: '#14275E', fontFamily: 'Nunito' }}>{label}</span>
    </button>
  )
}

// ── Wrapper com Provider ──────────────────────────────────────────────────

export default function MonitorPaciente() {
  const { id } = useParams()

  return (
    <AtendimentoProvider atendimentoId={id} papel="paciente">
      <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
        <GeometricBackground />
        <header className="relative z-10 shrink-0 flex items-center justify-between px-5 py-4 shadow-md" style={{ background: '#14275E' }}>
          <Logo size="sm" light />
          <HeaderStatusPaciente />
        </header>
        <div className="relative z-10 flex-1 flex flex-col">
          <PacienteContent />
        </div>
        <footer className="relative z-10 text-center py-3 border-t border-[#F1E8D8] shrink-0">
          <p className="text-xs opacity-30" style={{ color: '#2E2E2E' }}>
            SINAI · HC-UFPE · Comunicação Inclusiva
          </p>
        </footer>
      </div>
    </AtendimentoProvider>
  )
}

function HeaderStatusPaciente() {
  const { conectado, status } = useAtendimento()
  return <StatusBadge conectado={conectado} status={status} />
}
