/**
 * CameraSign — componente de câmera com detecção de landmarks e reconhecimento de sinais.
 *
 * Layout:
 *   ┌─────────────────────────────────────┐
 *   │  [canvas com feed da câmera +       │
 *   │   overlay de landmarks]             │
 *   │                          FPS: 24    │
 *   ├─────────────────────────────────────┤
 *   │  Sinal detectado: DOR 😣            │
 *   │  [████████░░] segure...             │
 *   └─────────────────────────────────────┘
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import { useHandTracking } from '../hooks/useHandTracking'
import { useSignRecognition, SINAIS_META, GUIA_SINAIS } from '../hooks/useSignRecognition'

export function CameraSign({ onSinalEnviado, ativo = true }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [mostrarGuia, setMostrarGuia] = useState(false)
  const [ultimoSinalEnviado, setUltimoSinalEnviado] = useState(null)

  // Callback quando um sinal é confirmado
  const handleSinalConfirmado = useCallback((resultado) => {
    setUltimoSinalEnviado(resultado)
    if (onSinalEnviado) onSinalEnviado(resultado)
    // Limpa o feedback após 3s
    setTimeout(() => setUltimoSinalEnviado(null), 3000)
  }, [onSinalEnviado])

  const { candidato, progressoHold, processarFrame } = useSignRecognition({
    onSinalConfirmado: handleSinalConfirmado,
  })

  const { estado, fps } = useHandTracking({
    videoRef,
    canvasRef,
    onResults: processarFrame,
    enabled: ativo,
  })

  const metaCandidato = candidato ? SINAIS_META[candidato.sinal] : null

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Container da câmera */}
      <div className="relative rounded-[20px] overflow-hidden bg-[#0f172a] border-2 border-[#14275E]"
           style={{ aspectRatio: '4/3', maxHeight: '320px' }}>

        {/* Vídeo oculto (fonte para MediaPipe) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
          playsInline
          muted
          autoPlay
        />

        {/* Canvas com feed + landmarks desenhados */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Estado da câmera */}
        {estado === 'carregando' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0f172a]/90">
            <div className="w-12 h-12 border-4 border-[#2F6FED]/30 border-t-[#2F6FED] rounded-full animate-spin" />
            <p className="text-white/70 text-sm font-medium">Iniciando câmera…</p>
            <p className="text-white/40 text-xs">Permita o acesso ao microfone</p>
          </div>
        )}

        {estado === 'erro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0f172a]/95 p-4">
            <span className="text-4xl">📷</span>
            <p className="text-red-400 text-sm font-semibold text-center">
              Câmera não disponível
            </p>
            <p className="text-white/40 text-xs text-center">
              Verifique as permissões do navegador e recarregue a página.
            </p>
          </div>
        )}

        {/* Overlay: sinal confirmado */}
        {ultimoSinalEnviado && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-emerald-500/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex flex-col items-center gap-1 shadow-xl animate-bounce">
              <span className="text-4xl">{SINAIS_META[ultimoSinalEnviado.sinal]?.emoji}</span>
              <span className="text-white font-bold text-lg">
                {SINAIS_META[ultimoSinalEnviado.sinal]?.label}
              </span>
              <span className="text-white/80 text-xs">Enviado!</span>
            </div>
          </div>
        )}

        {/* Overlay: candidato em progresso */}
        {candidato && !ultimoSinalEnviado && progressoHold > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-[#14275E]/80 backdrop-blur-sm rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{metaCandidato?.emoji}</span>
                  <span className="text-white font-bold text-sm">{metaCandidato?.label}</span>
                </div>
                <span className="text-white/60 text-xs">
                  {Math.round(progressoHold * 100)}%
                </span>
              </div>
              {/* Barra de progresso */}
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progressoHold * 100}%`,
                    background: metaCandidato?.cor || '#2F6FED',
                  }}
                />
              </div>
              <p className="text-white/50 text-xs mt-1 text-center">Mantenha o sinal…</p>
            </div>
          </div>
        )}

        {/* Badge FPS */}
        {estado === 'ativo' && fps > 0 && (
          <div className="absolute top-2 right-2 bg-black/40 text-white/70 text-xs px-2 py-1 rounded-lg font-mono">
            {fps} fps
          </div>
        )}

        {/* Badge status câmera */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 text-xs px-2 py-1 rounded-lg">
          <span className={`w-2 h-2 rounded-full ${
            estado === 'ativo' ? 'bg-emerald-400 animate-pulse' :
            estado === 'carregando' ? 'bg-yellow-400 animate-ping' :
            'bg-red-400'
          }`} />
          <span className="text-white/70">
            {estado === 'ativo' ? 'Câmera ativa' : estado === 'carregando' ? 'Iniciando…' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Instrução principal */}
      {estado === 'ativo' && !candidato && !ultimoSinalEnviado && (
        <div className="flex items-center gap-3 bg-[#FFFDF8] border-2 border-[#F1E8D8] rounded-2xl px-4 py-3">
          <span className="text-2xl">🤟</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#14275E' }}>
              Mostre seu sinal para a câmera
            </p>
            <p className="text-xs opacity-60">Mantenha por 1 segundo para confirmar</p>
          </div>
          <button
            onClick={() => setMostrarGuia(v => !v)}
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#F1E8D8] hover:bg-blue-50 transition"
            style={{ color: '#2F6FED' }}
          >
            {mostrarGuia ? 'Fechar' : 'Ver sinais'}
          </button>
        </div>
      )}

      {/* Guia de sinais */}
      {mostrarGuia && (
        <GuiaSinais onFechar={() => setMostrarGuia(false)} />
      )}
    </div>
  )
}

// ── Guia visual dos sinais ────────────────────────────────────────────────

function GuiaSinais({ onFechar }) {
  return (
    <div className="bg-[#FFFDF8] border-2 border-[#F1E8D8] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm" style={{ color: '#14275E', fontFamily: 'Nunito' }}>
          Guia de Sinais
        </h3>
        <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {GUIA_SINAIS.map(({ sinal, descricao, emoji }) => {
          const meta = SINAIS_META[sinal]
          return (
            <div
              key={sinal}
              className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-[#F1E8D8]"
            >
              <span className="text-xl flex-shrink-0">{emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold" style={{ color: meta?.cor }}>
                  {meta?.label}
                </p>
                <p className="text-xs opacity-60 truncate">{descricao}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
