import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { api, getWsUrl } from '../services/api'

const AtendimentoContext = createContext(null)

export function AtendimentoProvider({ children, atendimentoId, papel }) {
  const [mensagens, setMensagens] = useState([])
  const [status, setStatus] = useState('aguardando')
  const [conectado, setConectado] = useState(false)
  const [participantes, setParticipantes] = useState(0)
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const mountedRef = useRef(true)

  // Carrega histórico via REST ao entrar
  useEffect(() => {
    if (!atendimentoId) return
    api.getMensagens(atendimentoId)
      .then((msgs) => {
        if (mountedRef.current) setMensagens(msgs)
      })
      .catch(console.error)
  }, [atendimentoId])

  const connect = useCallback(() => {
    if (!atendimentoId || !papel) return

    const url = getWsUrl(atendimentoId, papel)
    // Em dev sem VITE_API_URL, getWsUrl retorna só o path (/ws/...).
    // O Vite proxy resolve. Em produção retorna wss://... completo.
    const wsUrl = url.startsWith('ws')
      ? url
      : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${url}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (mountedRef.current) setConectado(true)
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConectado(false)
      // Reconecta após 2 segundos
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, 2000)
    }

    ws.onerror = () => ws.close()

    ws.onmessage = (ev) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse(ev.data)
        handleEvento(data)
      } catch (_) {}
    }
  }, [atendimentoId, papel])

  function handleEvento(data) {
    const { evento } = data

    if (evento === 'mensagem_para_paciente' || evento === 'mensagem_para_medico') {
      const nova = {
        id: data.mensagemId,
        atendimento_id: atendimentoId,
        remetente: data.remetente,
        tipo: data.tipo || 'texto',
        conteudo_original: data.conteudoOriginal,
        conteudo_simplificado: data.conteudoSimplificado || null,
        criado_em: data.criadoEm,
      }
      setMensagens((prev) => {
        // Evita duplicata (pode vir do histórico REST + WS)
        if (prev.find((m) => m.id === nova.id)) return prev
        return [...prev, nova]
      })
    }

    if (evento === 'status_atendimento') {
      if (data.status) setStatus(data.status)
      if (data.participantes !== undefined) setParticipantes(data.participantes)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect])

  function enviar(payload) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }

  function enviarMensagemMedico(conteudoOriginal, tipo = 'texto') {
    enviar({ evento: 'mensagem_medico', tipo, conteudoOriginal })
  }

  function enviarMensagemPaciente(conteudoOriginal, tipo = 'simbolo_estruturado') {
    enviar({ evento: 'mensagem_paciente', tipo, conteudoOriginal })
  }

  return (
    <AtendimentoContext.Provider
      value={{
        mensagens,
        status,
        conectado,
        participantes,
        enviarMensagemMedico,
        enviarMensagemPaciente,
      }}
    >
      {children}
    </AtendimentoContext.Provider>
  )
}

export function useAtendimento() {
  const ctx = useContext(AtendimentoContext)
  if (!ctx) throw new Error('useAtendimento deve ser usado dentro de AtendimentoProvider')
  return ctx
}
