/**
 * Camada de comunicação com a API SINAI.
 *
 * Em desenvolvimento: usa o proxy do Vite (/api → localhost:8000)
 * Em produção (Vercel): VITE_API_URL aponta para o Railway, ex:
 *   VITE_API_URL=https://sinai-backend.up.railway.app
 *
 * Configurar na Vercel: Settings → Environment Variables → VITE_API_URL
 */

// Base URL para requisições HTTP
const HTTP_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api'

// Base URL para WebSocket (troca https→wss, http→ws)
const WS_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://')
  : '' // vazio = mesmo host (proxy do Vite resolve /ws)

export function getWsUrl(atendimentoId, papel) {
  const path = `/ws/atendimentos/${atendimentoId}/${papel}`
  return WS_BASE ? `${WS_BASE}${path}` : path
}

async function req(method, path, body) {
  const res = await fetch(`${HTTP_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Erro na requisição')
  }
  return res.json()
}

export const api = {
  // Profissionais
  listarProfissionais: () => req('GET', '/atendimentos/profissionais'),
  criarProfissional: (data) => req('POST', '/atendimentos/profissionais', data),

  // Atendimentos
  criarAtendimento: (data) => req('POST', '/atendimentos', data),
  getAtendimento: (id) => req('GET', `/atendimentos/${id}`),
  getMensagens: (id) => req('GET', `/atendimentos/${id}/mensagens`),
  finalizarAtendimento: (id) => req('PATCH', `/atendimentos/${id}/finalizar`),

  // Feedback
  enviarFeedback: (id, data) => req('POST', `/atendimentos/${id}/feedback`, data),

  // Biblioteca visual
  getBiblioteca: () => req('GET', '/biblioteca-visual'),
}
