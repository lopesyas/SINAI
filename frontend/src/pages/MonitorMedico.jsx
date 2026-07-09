import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AtendimentoProvider, useAtendimento } from '../context/AtendimentoContext'
import { api } from '../services/api'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { useTextToSpeech } from '../hooks/useTextToSpeech'

// ── Hook de reconhecimento de voz ─────────────────────────────────────────

function useSpeechRecognition({ onTranscript, onError }) {
  const [ouvindo, setOuvindo] = useState(false)
  const recRef = useRef(null)

  const iniciar = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      onError('Reconhecimento de voz não disponível. Use Chrome ou Edge.')
      return
    }

    // Cancela sessão anterior se existir
    if (recRef.current) {
      try { recRef.current.abort() } catch (_) {}
    }

    const rec = new SR()
    rec.lang = 'pt-BR'
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 1
    recRef.current = rec

    rec.onstart = () => setOuvindo(true)

    rec.onresult = (ev) => {
      const transcript = Array.from(ev.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
      setOuvindo(false)
      if (transcript) onTranscript(transcript)
      else onError('Não foi possível reconhecer a fala. Tente novamente.')
    }

    rec.onerror = (ev) => {
      setOuvindo(false)
      const msgs = {
        'not-allowed': 'Permissão de microfone negada. Verifique as configurações do navegador.',
        'no-speech': 'Nenhuma fala detectada. Tente novamente.',
        'network': 'Erro de rede ao processar a voz.',
        'audio-capture': 'Microfone não encontrado ou indisponível.',
      }
      onError(msgs[ev.error] || `Erro de reconhecimento: ${ev.error}`)
    }

    rec.onend = () => setOuvindo(false)

    try {
      rec.start()
    } catch (e) {
      setOuvindo(false)
      onError('Não foi possível iniciar o microfone.')
    }
  }, [onTranscript, onError])

  const parar = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop() } catch (_) {}
    }
    setOuvindo(false)
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (recRef.current) {
        try { recRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  return { ouvindo, iniciar, parar }
}

// ── Componente principal ──────────────────────────────────────────────────

function MedicoContent({ atendimentoId }) {
  const { mensagens, conectado, enviarMensagemMedico } = useAtendimento()
  const navigate = useNavigate()

  const [texto, setTexto] = useState('')
  const [textoVoz, setTextoVoz] = useState('')
  const [confirmandoVoz, setConfirmandoVoz] = useState(false)
  const [erroVoz, setErroVoz] = useState('')
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)
  const [ttsAtivo, setTtsAtivo] = useState(true)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const ultimaMsgPacienteRef = useRef(null)

  const { falar, falando, disponivel: ttsDisponivel } = useTextToSpeech()

  // Scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // TTS: lê em voz alta quando paciente envia mensagem nova
  useEffect(() => {
    if (!ttsAtivo || !ttsDisponivel) return
    const msgsPaciente = mensagens.filter(m => m.remetente === 'paciente')
    if (msgsPaciente.length === 0) return
    const ultima = msgsPaciente[msgsPaciente.length - 1]
    if (ultima.id === ultimaMsgPacienteRef.current) return
    ultimaMsgPacienteRef.current = ultima.id
    // Pequeno delay para não sobrepor sons
    setTimeout(() => falar(ultima.conteudo_original), 300)
  }, [mensagens, ttsAtivo, ttsDisponivel, falar])

  // Speech recognition
  const { ouvindo, iniciar: iniciarVoz, parar: pararVoz } = useSpeechRecognition({
    onTranscript: (t) => {
      setTextoVoz(t)
      setConfirmandoVoz(true)
      setErroVoz('')
    },
    onError: (msg) => {
      setErroVoz(msg)
      // Limpa o erro após 4 segundos
      setTimeout(() => setErroVoz(''), 4000)
    },
  })

  const linkPaciente = `${window.location.origin}/atendimento/${atendimentoId}/paciente`

  function copiarLink() {
    navigator.clipboard.writeText(linkPaciente).then(() => {
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2500)
    })
  }

  function handleEnviar(e) {
    e?.preventDefault()
    const msg = texto.trim()
    if (!msg || !conectado) return
    enviarMensagemMedico(msg, 'texto')
    setTexto('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function confirmarVoz() {
    enviarMensagemMedico(textoVoz, 'voz_transcrita')
    setTextoVoz('')
    setConfirmandoVoz(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function editarVoz() {
    setTexto(textoVoz)
    setTextoVoz('')
    setConfirmandoVoz(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function cancelarVoz() {
    setTextoVoz('')
    setConfirmandoVoz(false)
  }

  function handleMicrofone() {
    if (ouvindo) {
      pararVoz()
    } else {
      setErroVoz('')
      iniciarVoz()
    }
  }

  async function handleFinalizar() {
    if (!window.confirm('Encerrar o atendimento?')) return
    await api.finalizarAtendimento(atendimentoId)
    setShowFeedback(true)
  }

  async function handleFeedback(e) {
    e.preventDefault()
    await api.enviarFeedback(atendimentoId, { papel: 'medico', nota, comentario })
    setFeedbackEnviado(true)
    setTimeout(() => navigate('/'), 2500)
  }

  function formatHora(iso) {
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  // ── Tela de feedback ───────────────────────────────────────────────────
  if (showFeedback) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#FFFDF8] border-2 border-[#F1E8D8] rounded-[24px] p-8 max-w-md w-full shadow-lg">
          {feedbackEnviado ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <p className="text-2xl font-bold" style={{ color: '#14275E', fontFamily: 'Nunito' }}>
                Obrigado!
              </p>
              <p className="text-sm opacity-60">Redirecionando ao início…</p>
            </div>
          ) : (
            <form onSubmit={handleFeedback} className="space-y-5">
              <h2 className="text-2xl font-bold" style={{ color: '#14275E', fontFamily: 'Nunito' }}>
                Como foi o atendimento?
              </h2>
              <div>
                <p className="text-sm font-medium mb-3">Avaliação geral</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNota(n)}
                      className={`w-12 h-12 rounded-xl text-2xl font-bold transition border-2 ${
                        nota >= n
                          ? 'bg-[#2F6FED] text-white border-[#2F6FED] scale-105'
                          : 'bg-white text-gray-300 border-gray-200 hover:border-[#2F6FED]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comentário (opcional)</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-[#F1E8D8] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#2F6FED]"
                  placeholder="O que funcionou bem? O que pode melhorar?"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={nota === 0}>
                Enviar Feedback
              </Button>
            </form>
          )}
        </div>
      </main>
    )
  }

  // ── Tela principal ─────────────────────────────────────────────────────
  return (
    <main className="flex-1 flex flex-col overflow-hidden">

      {/* Barra superior — link do paciente */}
      <div className="shrink-0 px-5 py-3 bg-[#FFFDF8] border-b border-[#F1E8D8] flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold opacity-40 mb-1 uppercase tracking-wide">
            Link do monitor do paciente
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-[#F1E8D8] rounded-lg px-3 py-2 truncate text-[#2E2E2E]">
              {linkPaciente}
            </code>
            <Button variant="secondary" size="sm" onClick={copiarLink}>
              {linkCopiado ? '✓ Copiado' : '📋 Copiar'}
            </Button>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={handleFinalizar}>
          Encerrar
        </Button>
      </div>

      {/* Toggle TTS */}
      {ttsDisponivel && (
        <div className="shrink-0 px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
          <span className="text-blue-700 text-xs font-semibold flex items-center gap-1.5">
            {falando ? (
              <>
                <span className="flex gap-0.5">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-0.5 bg-blue-500 rounded-full animate-bounce" style={{ height: `${8+i*3}px`, animationDelay: `${i*0.1}s` }} />
                  ))}
                </span>
                Lendo resposta do paciente…
              </>
            ) : (
              <>🔊 Leitura em voz alta das respostas do paciente</>
            )}
          </span>
          <button
            onClick={() => setTtsAtivo(v => !v)}
            className={`ml-auto text-xs font-bold px-3 py-1 rounded-full transition ${ttsAtivo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            {ttsAtivo ? 'Ativo' : 'Desligado'}
          </button>
        </div>
      )}

      {/* Banner de confirmação de voz — aparece sobre o histórico */}
      {confirmandoVoz && (
        <div className="shrink-0 mx-5 mt-4 bg-blue-50 border-2 border-[#2F6FED] rounded-2xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎤</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#14275E] mb-1">
                Texto reconhecido — revise antes de enviar:
              </p>
              <p className="text-base text-[#2E2E2E] font-semibold mb-3 break-words">
                "{textoVoz}"
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={confirmarVoz}>
                  ✓ Confirmar e Enviar
                </Button>
                <Button size="sm" variant="secondary" onClick={editarVoz}>
                  ✏️ Editar texto
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelarVoz}>
                  ✕ Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erro de voz */}
      {erroVoz && (
        <div className="shrink-0 mx-5 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <p className="text-sm text-red-700 font-medium">{erroVoz}</p>
        </div>
      )}

      {/* Histórico de mensagens */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {mensagens.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40 py-16">
            <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-semibold text-base">Nenhuma mensagem ainda</p>
            <p className="text-sm">Digite abaixo ou use o microfone para iniciar</p>
          </div>
        )}

        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.remetente === 'medico' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.remetente === 'medico'
                  ? 'bg-[#2F6FED] text-white rounded-br-none'
                  : 'bg-white border border-[#F1E8D8] text-[#2E2E2E] rounded-bl-none'
              }`}
            >
              {/* Cabeçalho da bolha */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-bold ${msg.remetente === 'medico' ? 'text-white/80' : 'text-[#14275E]'}`}>
                  {msg.remetente === 'medico' ? '👨‍⚕️ Você' : '🧑 Paciente'}
                </span>
                {msg.tipo === 'voz_transcrita' && (
                  <span className="text-xs opacity-60" title="Enviado por voz">🎤</span>
                )}
                {msg.tipo === 'simbolo_estruturado' && (
                  <span className="text-xs opacity-60" title="Biblioteca visual">🖐️</span>
                )}
                <span className={`text-xs ml-auto ${msg.remetente === 'medico' ? 'text-white/50' : 'text-gray-400'}`}>
                  {formatHora(msg.criado_em)}
                </span>
              </div>

              {/* Texto */}
              <p className="text-sm leading-relaxed">{msg.conteudo_original}</p>

              {/* Versão simplificada (só para mensagens do médico que foram alteradas) */}
              {msg.remetente === 'medico' &&
                msg.conteudo_simplificado &&
                msg.conteudo_simplificado !== msg.conteudo_original && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-xs opacity-60 italic">
                      Enviado em Libras: "{msg.conteudo_simplificado}"
                    </p>
                  </div>
                )}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Área de envio */}
      <div className="shrink-0 border-t border-[#F1E8D8] bg-[#FFFDF8] px-5 py-4">
        <div className="flex gap-2 items-end">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleEnviar()
              }
            }}
            rows={2}
            placeholder={
              !conectado
                ? 'Conectando…'
                : ouvindo
                ? 'Ouvindo sua voz…'
                : confirmandoVoz
                ? 'Revise o texto acima antes de enviar'
                : 'Digite a pergunta para o paciente… (Enter envia)'
            }
            disabled={!conectado}
            className="flex-1 border-2 border-[#F1E8D8] rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#2F6FED] transition bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '68px' }}
          />

          {/* Botão microfone */}
          <button
            type="button"
            onClick={handleMicrofone}
            disabled={!conectado || confirmandoVoz}
            aria-label={ouvindo ? 'Parar gravação' : 'Iniciar gravação de voz'}
            title={ouvindo ? 'Clique para parar' : 'Gravar voz (pt-BR)'}
            className={[
              'p-3.5 rounded-2xl border-2 transition-all duration-150 flex-shrink-0',
              ouvindo
                ? 'bg-red-500 border-red-500 text-white scale-110 shadow-lg shadow-red-200'
                : 'bg-white border-[#F1E8D8] text-[#2F6FED] hover:bg-blue-50 hover:border-[#2F6FED] hover:scale-105',
              (!conectado || confirmandoVoz) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            {ouvindo ? (
              /* Ícone de parar (quadrado) quando gravando */
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              /* Ícone de microfone */
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Botão enviar */}
          <Button
            type="button"
            onClick={handleEnviar}
            disabled={!texto.trim() || !conectado}
            size="md"
            className="flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Enviar
          </Button>
        </div>

        {/* Indicador de estado da gravação */}
        {ouvindo && (
          <div className="flex items-center gap-2 mt-2.5">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-bounce"
                  style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </span>
            <span className="text-sm text-red-600 font-semibold">Ouvindo… fale agora</span>
            <button
              type="button"
              onClick={pararVoz}
              className="ml-auto text-xs text-red-500 underline hover:text-red-700"
            >
              cancelar
            </button>
          </div>
        )}

        <p className="text-xs opacity-30 mt-2 text-center">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </main>
  )
}

// ── Wrapper com Provider ──────────────────────────────────────────────────

export default function MonitorMedico() {
  const { id } = useParams()
  const [atendimento, setAtendimento] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!id) return
    api.getAtendimento(id)
      .then(setAtendimento)
      .catch(() => setErro('Atendimento não encontrado.'))
  }, [id])

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-red-500">{erro}</p>
          <a href="/" className="text-[#2F6FED] underline font-medium">Voltar ao início</a>
        </div>
      </div>
    )
  }

  return (
    <AtendimentoProvider atendimentoId={id} papel="medico">
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 flex items-center justify-between px-6 py-4 shadow-md"
          style={{ background: '#14275E' }}
        >
          <Logo size="sm" light />
          <div className="flex items-center gap-4">
            {atendimento && (
              <span className="text-white/70 text-sm hidden sm:inline">
                Paciente:{' '}
                <span className="text-white font-semibold">{atendimento.paciente_ref}</span>
              </span>
            )}
            <HeaderStatus />
          </div>
        </header>

        <MedicoContent atendimentoId={id} />
      </div>
    </AtendimentoProvider>
  )
}

function HeaderStatus() {
  const { conectado, status } = useAtendimento()
  return <StatusBadge conectado={conectado} status={status} />
}
