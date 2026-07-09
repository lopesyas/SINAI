/**
 * useTextToSpeech
 * Wrapper para a Web Speech Synthesis API.
 * Lê textos em voz alta (pt-BR) no monitor do médico quando o paciente envia mensagem.
 */
import { useCallback, useRef, useState } from 'react'

export function useTextToSpeech() {
  const [falando, setFalando] = useState(false)
  const utteranceRef = useRef(null)

  const falar = useCallback((texto, opcoes = {}) => {
    if (!window.speechSynthesis || !texto) return

    // Cancela fala anterior
    window.speechSynthesis.cancel()

    const utter = new SpeechSynthesisUtterance(texto)
    utter.lang = 'pt-BR'
    utter.rate = opcoes.rate ?? 0.95
    utter.pitch = opcoes.pitch ?? 1.0
    utter.volume = opcoes.volume ?? 1.0

    // Tenta usar voz pt-BR disponível
    const vozes = window.speechSynthesis.getVoices()
    const vozBR = vozes.find(
      (v) => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt')
    )
    if (vozBR) utter.voice = vozBR

    utter.onstart = () => setFalando(true)
    utter.onend = () => setFalando(false)
    utter.onerror = () => setFalando(false)

    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [])

  const parar = useCallback(() => {
    window.speechSynthesis?.cancel()
    setFalando(false)
  }, [])

  const disponivel = typeof window !== 'undefined' && 'speechSynthesis' in window

  return { falar, parar, falando, disponivel }
}
