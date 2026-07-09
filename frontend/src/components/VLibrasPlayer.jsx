/**
 * VLibrasPlayer — integração real com o widget oficial VLibras (gov.br)
 *
 * Estratégia baseada no código-fonte real do vlibras-plugin.js:
 *
 *   1. Injeta o container [vw] no body (HTML oficial)
 *   2. Carrega vlibras-plugin.js e instancia new window.VLibras.Widget(...)
 *   3. Simula clique no [vw-access-button] para inicializar window.plugin
 *   4. Abre o "translator screen" do widget
 *   5. Preenche a textarea interna (.vp-user-textarea) com o texto
 *   6. Clica no botão .vp-play-gloss-button para acionar a animação do avatar
 *
 * O widget é renderizado INLINE na nossa área (não é flutuante).
 * O botão flutuante padrão é ocultado via CSS.
 */
import { useEffect, useRef, useState, useCallback } from 'react'

// ── Estado global singleton ────────────────────────────────────────────────
// O widget VLibras só pode ser instanciado uma vez por página
let estadoGlobal = {
  fase: 'nao_iniciado', // nao_iniciado | carregando | pronto | erro
  listeners: [],
}

function notificarListeners(fase) {
  estadoGlobal.fase = fase
  estadoGlobal.listeners.forEach((fn) => fn(fase))
}

function assinarEstado(fn) {
  estadoGlobal.listeners.push(fn)
  return () => {
    estadoGlobal.listeners = estadoGlobal.listeners.filter((l) => l !== fn)
  }
}

// ── Inicialização do widget ────────────────────────────────────────────────

function iniciarVLibras() {
  if (estadoGlobal.fase !== 'nao_iniciado') return
  notificarListeners('carregando')

  // 1. Cria container oficial do widget no body
  if (!document.getElementById('vlibras-root')) {
    const div = document.createElement('div')
    div.id = 'vlibras-root'
    div.setAttribute('vw', '')
    div.className = 'enabled'
    div.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `
    // Esconde visualmente mas mantém funcional
    div.style.cssText = 'position:fixed;bottom:-9999px;right:-9999px;opacity:0;pointer-events:none;z-index:-1'
    document.body.appendChild(div)
  }

  // 2. CSS para mover o plugin-wrapper para nossa área personalizada
  const style = document.createElement('style')
  style.id = 'vlibras-sinai-style'
  style.textContent = `
    /* Oculta o container original — usamos nossa área */
    #vlibras-root { display: block !important; }

    /* Quando movido para nossa área, remove o posicionamento fixo */
    .vlibras-sinai-player [vw-plugin-wrapper] {
      position: static !important;
      float: none !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      height: 380px !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      box-shadow: none !important;
    }

    /* Garante que o player ocupa toda a área */
    .vlibras-sinai-player [vw-plugin-wrapper].active {
      min-height: 380px !important;
    }

    /* Oculta elementos que não queremos mostrar */
    .vlibras-sinai-player [vw-access-button] {
      display: none !important;
    }
  `
  document.head.appendChild(style)

  // 3. Carrega o script oficial
  const script = document.createElement('script')
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
  script.async = true

  script.onload = () => {
    if (!window.VLibras || !window.VLibras.Widget) {
      notificarListeners('erro')
      return
    }

    try {
      // Instancia o Widget — registra o window.onload handler
      new window.VLibras.Widget('https://vlibras.gov.br/app')

      // O Widget usa window.onload — disparar manualmente se já carregou
      if (document.readyState === 'complete') {
        // Dispara o onload do widget
        const onloadOriginal = window.onload
        if (typeof onloadOriginal === 'function') {
          onloadOriginal()
        }
        // Agora simula clique no botão para inicializar window.plugin
        aguardarEInicializar()
      } else {
        window.addEventListener('load', () => {
          setTimeout(aguardarEInicializar, 500)
        })
      }
    } catch (e) {
      console.error('VLibras init error:', e)
      notificarListeners('erro')
    }
  }

  script.onerror = () => {
    console.warn('VLibras: script não carregou (sem internet?)')
    notificarListeners('erro')
  }

  document.head.appendChild(script)
}

function aguardarEInicializar(tentativa = 0) {
  const btn = document.querySelector('[vw-access-button]')
  if (!btn) {
    if (tentativa < 30) {
      setTimeout(() => aguardarEInicializar(tentativa + 1), 200)
    } else {
      notificarListeners('erro')
    }
    return
  }

  // Simula clique para inicializar window.plugin e carregar os chunks lazy
  btn.click()

  // Aguarda window.plugin ser criado
  aguardarPlugin()
}

function aguardarPlugin(tentativa = 0) {
  if (window.plugin) {
    notificarListeners('pronto')
    return
  }
  if (tentativa >= 60) {
    // Tentativa alternativa: verificar se o widget foi carregado de outra forma
    if (document.querySelector('[vp-box]') || document.querySelector('[vp-controls]')) {
      notificarListeners('pronto')
    } else {
      notificarListeners('erro')
    }
    return
  }
  setTimeout(() => aguardarPlugin(tentativa + 1), 200)
}

// ── Função de tradução via textarea interna ───────────────────────────────

function acionarTradução(texto) {
  if (!texto) return false

  // Estratégia 1: usar textarea do translator screen
  const textarea = document.querySelector('.vp-user-textarea') ||
    document.querySelector('[vp-translator-screen] textarea') ||
    document.querySelector('[vp-suggestion-screen] textarea')

  if (textarea) {
    // Seta o valor e dispara os eventos React/DOM necessários
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
    if (nativeSetter) {
      nativeSetter.call(textarea, texto)
    } else {
      textarea.value = texto
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new Event('change', { bubbles: true }))

    // Clicar no botão de reproduzir
    setTimeout(() => {
      const playBtn = document.querySelector('.vp-play-gloss-button') ||
        document.querySelector('[vp-translator-screen] .vp-translator-buttons-container button:first-child') ||
        document.querySelector('[vp-suggestion-screen] .vp-suggestion-buttons-container button:first-child')

      if (playBtn && !playBtn.disabled) {
        playBtn.click()
        return true
      }

      // Estratégia 2: usar translator screen diretamente
      abrirTranslatorEPreencher(texto)
    }, 300)

    return true
  }

  // Estratégia 2: abrir o translator screen e preencher
  abrirTranslatorEPreencher(texto)
  return false
}

function abrirTranslatorEPreencher(texto) {
  // Abre o widget se não estiver aberto
  const wrapper = document.querySelector('[vw-plugin-wrapper]')
  const btn = document.querySelector('[vw-access-button]')

  if (wrapper && !wrapper.classList.contains('active')) {
    btn?.click()
  }

  setTimeout(() => {
    // Abre o translator button
    const translatorBtn = document.querySelector('.vp-translator-button') ||
      document.querySelector('[vp-translator-screen]')?.closest('[vp]')

    if (translatorBtn) translatorBtn.click()

    setTimeout(() => {
      const textarea = document.querySelector('.vp-user-textarea') ||
        document.querySelector('textarea[class*="user-textarea"]')

      if (textarea) {
        textarea.focus()
        textarea.value = texto
        textarea.dispatchEvent(new Event('input', { bubbles: true }))

        setTimeout(() => {
          const playBtn = document.querySelector('.vp-play-gloss-button')
          if (playBtn && !playBtn.disabled) {
            playBtn.click()
          }
        }, 200)
      }
    }, 400)
  }, 300)
}

// ── Componente principal ───────────────────────────────────────────────────

export function VLibrasPlayer({ texto, autoplay = true }) {
  const [fase, setFase] = useState(estadoGlobal.fase)
  const [traduzindo, setTraduzindo] = useState(false)
  const [modoFallback, setModoFallback] = useState(false)
  const containerRef = useRef(null)
  const textoAnteriorRef = useRef(null)
  const wrapperMovidoRef = useRef(false)
  const timeoutRef = useRef(null)

  // Assina mudanças de estado do widget global
  useEffect(() => {
    const cancelar = assinarEstado((novaFase) => {
      setFase(novaFase)
      if (novaFase === 'erro') setModoFallback(true)
    })

    // Inicia se ainda não foi iniciado
    if (estadoGlobal.fase === 'nao_iniciado') {
      iniciarVLibras()
    } else if (estadoGlobal.fase === 'erro') {
      setModoFallback(true)
    }

    return cancelar
  }, [])

  // Quando o widget fica pronto, move o [vw-plugin-wrapper] para nossa área
  useEffect(() => {
    if (fase !== 'pronto' || !containerRef.current || wrapperMovidoRef.current) return

    const wrapper = document.querySelector('[vw-plugin-wrapper]')
    if (!wrapper) return

    // Move o wrapper para dentro da nossa div
    containerRef.current.appendChild(wrapper)
    wrapperMovidoRef.current = true

    // Se já temos texto esperando, traduz agora
    if (autoplay && texto && textoAnteriorRef.current !== texto) {
      setTimeout(() => fazerTradução(texto), 500)
    }
  }, [fase])

  // Reage a mudança de texto
  useEffect(() => {
    if (!texto || texto === textoAnteriorRef.current) return
    textoAnteriorRef.current = texto

    if (autoplay && fase === 'pronto') {
      fazerTradução(texto)
    }
  }, [texto, fase, autoplay])

  const fazerTradução = useCallback((t) => {
    if (!t) return
    setTraduzindo(true)
    clearTimeout(timeoutRef.current)

    acionarTradução(t)

    // Estimativa de duração
    const palavras = t.trim().split(/\s+/).length
    const duracao = Math.max(4000, palavras * 600)
    timeoutRef.current = setTimeout(() => setTraduzindo(false), duracao)
  }, [])

  function handleRepetir() {
    if (texto) fazerTradução(texto)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // ── Render modo fallback ──────────────────────────────────────────────
  if (modoFallback) {
    return (
      <FallbackPlayer
        texto={texto}
        traduzindo={traduzindo}
        onRepetir={handleRepetir}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Área do avatar VLibras */}
      <div
        className="vlibras-sinai-player relative w-full rounded-[20px] overflow-hidden bg-[#0d1b3e]"
        style={{ minHeight: '280px' }}
      >
        {/* Onde o [vw-plugin-wrapper] será movido */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Overlay de estado */}
        {fase === 'carregando' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-[#0d1b3e]">
            <AvatarEspera estado="carregando" />
          </div>
        )}

        {fase === 'nao_iniciado' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0d1b3e]">
            <AvatarEspera estado="idle" />
          </div>
        )}

        {/* Badge traduzindo */}
        {traduzindo && fase === 'pronto' && (
          <div className="absolute top-3 left-3 z-30 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-[#2F6FED]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 bg-white rounded-full animate-bounce"
                    style={{ height: '10px', animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </span>
              Traduzindo em Libras…
            </div>
          </div>
        )}

        {/* Quando pronto mas sem texto ainda */}
        {fase === 'pronto' && !texto && !traduzindo && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <AvatarEspera estado="idle" />
          </div>
        )}
      </div>

      {/* Texto legível por baixo */}
      {texto && (
        <div className="px-1 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
          <p className="text-white/80 text-sm leading-snug">{texto}</p>
        </div>
      )}

      {/* Botão repetir */}
      {texto && fase === 'pronto' && (
        <button
          onClick={handleRepetir}
          disabled={traduzindo}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl border-2 border-[#F1E8D8] bg-white font-semibold text-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 hover:border-[#2F6FED]"
          style={{ color: '#14275E' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {traduzindo ? 'Traduzindo…' : 'Repetir em Libras'}
        </button>
      )}
    </div>
  )
}

// ── Fallback player (quando VLibras não carrega) ───────────────────────────

function FallbackPlayer({ texto, traduzindo, onRepetir }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="relative w-full rounded-[20px] overflow-hidden bg-[#0d1b3e] flex flex-col items-center justify-center p-6"
        style={{ minHeight: '260px' }}
      >
        <HandSignSVG animando={traduzindo} />

        {texto ? (
          <div className="mt-4 text-center space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
              Mensagem do médico
            </p>
            <p
              className="text-white text-2xl font-extrabold leading-snug px-2"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {texto}
            </p>
            <p className="text-white/30 text-xs mt-2">
              (VLibras indisponível — mostrando texto)
            </p>
          </div>
        ) : (
          <AvatarEspera estado="idle" />
        )}
      </div>

      {texto && (
        <button
          onClick={onRepetir}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl border-2 border-[#F1E8D8] bg-white font-semibold text-sm transition active:scale-95 hover:bg-blue-50"
          style={{ color: '#14275E' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12M8.464 8.464a5 5 0 000 7.072" />
          </svg>
          Ler em voz alta
        </button>
      )}
    </div>
  )
}

// ── Avatar de espera ──────────────────────────────────────────────────────

export function AvatarEspera({ estado = 'idle' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 px-4 w-full">
      <HandSignSVG animando={estado === 'traduzindo' || estado === 'carregando'} />
      <div className="text-center space-y-1">
        {estado === 'carregando' && (
          <>
            <div className="flex justify-center gap-1 mb-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm font-medium">Carregando VLibras…</p>
            <p className="text-white/30 text-xs">Primeira carga pode levar alguns segundos</p>
          </>
        )}
        {estado === 'idle' && (
          <p className="text-white/40 text-sm">Aguardando mensagem do médico…</p>
        )}
      </div>
    </div>
  )
}

// ── SVG da mão ────────────────────────────────────────────────────────────

function HandSignSVG({ animando = false }) {
  return (
    <div className="relative" style={{ filter: 'drop-shadow(0 0 24px rgba(47,111,237,0.6))' }}>
      <svg
        width="110"
        height="130"
        viewBox="0 0 110 130"
        fill="none"
        className={animando ? 'animate-pulse' : ''}
      >
        <rect x="36" y="94" width="38" height="28" rx="10" fill="#F1E8D8" />
        <rect x="22" y="48" width="66" height="56" rx="16" fill="#F1E8D8" />
        <rect x="22" y="24" width="13" height="36" rx="6.5" fill="#F1E8D8">
          <animateTransform attributeName="transform" type="rotate"
            values="0 28.5 48;-6 28.5 48;0 28.5 48" dur="2.6s" repeatCount="indefinite" />
        </rect>
        <rect x="38" y="16" width="13" height="40" rx="6.5" fill="#F1E8D8">
          <animateTransform attributeName="transform" type="rotate"
            values="0 44.5 48;-9 44.5 48;0 44.5 48" dur="2.0s" repeatCount="indefinite" />
        </rect>
        <rect x="54" y="12" width="13" height="44" rx="6.5" fill="#F1E8D8">
          <animateTransform attributeName="transform" type="rotate"
            values="0 60.5 48;-7 60.5 48;0 60.5 48" dur="1.7s" repeatCount="indefinite" />
        </rect>
        <rect x="70" y="16" width="13" height="40" rx="6.5" fill="#F1E8D8">
          <animateTransform attributeName="transform" type="rotate"
            values="0 76.5 48;-11 76.5 48;0 76.5 48" dur="2.3s" repeatCount="indefinite" />
        </rect>
        <rect x="6" y="56" width="26" height="13" rx="6.5" fill="#F1E8D8"
          transform="rotate(-28 19 62.5)">
          <animateTransform attributeName="transform" type="rotate"
            values="-28 19 62.5;-18 19 62.5;-28 19 62.5" dur="1.9s" repeatCount="indefinite" />
        </rect>
        <circle cx="92" cy="34" r="6" stroke="#2F6FED" strokeWidth="2" fill="none">
          <animate attributeName="r" values="6;14;6" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="92" cy="34" r="12" stroke="#2F6FED" strokeWidth="1.5" fill="none">
          <animate attributeName="r" values="12;20;12" dur="1.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.9s" repeatCount="indefinite" />
        </circle>
      </svg>
      <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d1b3e] animate-pulse" />
    </div>
  )
}
