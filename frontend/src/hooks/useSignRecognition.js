/**
 * Engine de reconhecimento de sinais médicos — baseado em geometria de landmarks.
 *
 * Referência de índices MediaPipe Hands:
 *   0 = pulso
 *   1-4  = polegar  (MCP, IP, ponta)
 *   5-8  = indicador
 *   9-12 = médio
 *   13-16= anelar
 *   17-20= mínimo
 *
 * Cada sinal é definido por um conjunto de predicados sobre:
 *   - quais dedos estão ESTENDIDOS (ponta acima do nó proximal)
 *   - ângulos entre vetores
 *   - distâncias relativas entre pontos-chave
 *
 * Sinais reconhecidos (conjunto fechado para MVP):
 *   SIM       — polegar para cima (thumbs up)
 *   NÃO       — polegar para baixo (thumbs down)
 *   DOR       — mão fechada com indicador tocando a palma
 *   CABEÇA    — indicador apontado para cima
 *   BARRIGA   — palma aberta para frente
 *   PEITO     — mão no centro, dedos juntos apontados para cima
 *   COSTAS    — punho fechado
 *   POUCO     — polegar e indicador quase se tocando (pinch)
 *   MUITO     — mão aberta, dedos bem separados e estendidos
 *   FEBRE     — palma plana, dedos unidos e estendidos
 *
 * Cada sinal precisa ser mantido por HOLD_FRAMES frames consecutivos
 * antes de ser confirmado — evita disparos acidentais.
 */

import { useRef, useState, useCallback } from 'react'

// Quantos frames consecutivos um sinal precisa se manter para confirmar
const HOLD_FRAMES = 18

// Confiança mínima para considerar um sinal detectado
const MIN_CONFIDENCE = 0.72

// ── Utilitários geométricos ───────────────────────────────────────────────

/** Distância euclidiana 2D entre dois landmarks */
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/** Distância euclidiana 3D entre dois landmarks */
function dist3(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/**
 * Retorna true se o dedo está estendido.
 * Compara a posição y da ponta com o nó MCP (base):
 *   - y menor = mais alto na imagem (MediaPipe usa y crescente para baixo)
 */
function dedoEstendido(lm, tipIdx, mcpIdx) {
  return lm[tipIdx].y < lm[mcpIdx].y
}

/**
 * Verifica se a ponta está acima do nó PIP (middle joint).
 * Critério mais rigoroso que dedoEstendido.
 */
function dedoEstendidoRigido(lm, tipIdx, pipIdx) {
  return lm[tipIdx].y < lm[pipIdx].y - 0.02
}

/**
 * Verifica se o dedo está dobrado (ponta abaixo do nó MCP).
 */
function dedoDobrado(lm, tipIdx, mcpIdx) {
  return lm[tipIdx].y > lm[mcpIdx].y
}

/** Calcula o vetor normalizado entre dois pontos */
function vetor(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy)
  return len > 0 ? { x: dx / len, y: dy / len } : { x: 0, y: 0 }
}

/** Produto escalar entre dois vetores */
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y
}

/** Tamanho de referência da mão (dist pulso→meio da palma) para normalizar */
function handScale(lm) {
  return dist(lm[0], lm[9]) || 0.1
}

// ── Reconhecedores individuais ────────────────────────────────────────────

/**
 * SIM — polegar para cima, demais dedos dobrados
 * Landmark 4 (ponta polegar) bem acima de 3, 2, 1
 * Indicador, médio, anelar, mínimo dobrados
 */
function reconhecerSim(lm) {
  const scale = handScale(lm)

  // Polegar apontando para cima: ponta do polegar bem acima do nó MCP
  const polegarCima = lm[4].y < lm[2].y - 0.05
  // Polegar não apontando para baixo
  const polegarNaoBaixo = lm[4].y < lm[0].y

  // Demais dedos dobrados
  const indicadorDobrado = lm[8].y > lm[6].y
  const medioDobrado     = lm[12].y > lm[10].y
  const anelarDobrado    = lm[16].y > lm[14].y
  const minimoDobrado    = lm[20].y > lm[18].y

  if (polegarCima && polegarNaoBaixo && indicadorDobrado && medioDobrado && anelarDobrado && minimoDobrado) {
    return { sinal: 'sim', confianca: 0.88, texto: 'Paciente respondeu: SIM.' }
  }
  return null
}

/**
 * NÃO — polegar para baixo, demais dedos dobrados
 */
function reconhecerNao(lm) {
  // Polegar apontando para baixo: ponta bem abaixo do nó MCP
  const polegarBaixo  = lm[4].y > lm[2].y + 0.05
  // E abaixo do pulso
  const abaixoPulso   = lm[4].y > lm[0].y

  const indicadorDobrado = lm[8].y > lm[6].y
  const medioDobrado     = lm[12].y > lm[10].y
  const anelarDobrado    = lm[16].y > lm[14].y
  const minimoDobrado    = lm[20].y > lm[18].y

  if (polegarBaixo && abaixoPulso && indicadorDobrado && medioDobrado && anelarDobrado && minimoDobrado) {
    return { sinal: 'nao', confianca: 0.85, texto: 'Paciente respondeu: NÃO.' }
  }
  return null
}

/**
 * DOR — mão fechada em punho (todos os dedos dobrados, incluindo polegar lateral)
 */
function reconhecerDor(lm) {
  const scale = handScale(lm)

  const indicadorDobrado = lm[8].y > lm[5].y
  const medioDobrado     = lm[12].y > lm[9].y
  const anelarDobrado    = lm[16].y > lm[13].y
  const minimoDobrado    = lm[20].y > lm[17].y
  // Polegar dobrado sobre os dedos (ponta próxima do indicador)
  const polegarLateral   = dist(lm[4], lm[5]) < scale * 0.5

  if (indicadorDobrado && medioDobrado && anelarDobrado && minimoDobrado && polegarLateral) {
    return { sinal: 'dor', confianca: 0.82, texto: 'Paciente relata dor.' }
  }
  return null
}

/**
 * CABEÇA — indicador apontado para cima, demais dedos dobrados
 * (gesto "número 1" / "apontar para cima")
 */
function reconhecerCabeca(lm) {
  const indicadorCima = lm[8].y < lm[6].y - 0.03 && lm[6].y < lm[5].y
  const medioDobrado  = lm[12].y > lm[10].y
  const anelarDobrado = lm[16].y > lm[14].y
  const minimoDobrado = lm[20].y > lm[18].y

  // Indicador vertical: a ponta deve estar aproximadamente na mesma coluna x
  const indicadorVertical = Math.abs(lm[8].x - lm[5].x) < 0.08

  if (indicadorCima && medioDobrado && anelarDobrado && minimoDobrado && indicadorVertical) {
    return { sinal: 'cabeca', confianca: 0.84, texto: 'Paciente relata dor na cabeça.' }
  }
  return null
}

/**
 * BARRIGA — palma aberta (todos os 5 dedos estendidos), voltada para frente
 * Detectado por todos os dedos estendidos e mão relativamente plana (z similar)
 */
function reconhecerBarriga(lm) {
  const indicadorAberto = lm[8].y  < lm[6].y
  const medioAberto     = lm[12].y < lm[10].y
  const anelarAberto    = lm[16].y < lm[14].y
  const minimoAberto    = lm[20].y < lm[18].y
  const polegarAberto   = lm[4].x  > lm[3].x  // polegar abduzido (mão direita espelhada)

  // Dedos juntos (não muito separados) — distingue de MUITO
  const scale = handScale(lm)
  const indicadorMedioDist = dist(lm[8], lm[12])
  const dedicosJuntos = indicadorMedioDist < scale * 0.6

  if (indicadorAberto && medioAberto && anelarAberto && minimoAberto && dedicosJuntos) {
    return { sinal: 'barriga', confianca: 0.80, texto: 'Paciente relata dor na barriga.' }
  }
  return null
}

/**
 * PEITO — todos os dedos estendidos juntos e apontando para cima
 * Parecido com barriga mas a mão está mais vertical
 */
function reconhecerPeito(lm) {
  const indicadorCima = lm[8].y < lm[5].y
  const medioCima     = lm[12].y < lm[9].y
  const anelarCima    = lm[16].y < lm[13].y
  const minimoCima    = lm[20].y < lm[17].y

  const scale = handScale(lm)
  const indicadorMedioDist = dist(lm[8], lm[12])
  const dedicosJuntos = indicadorMedioDist < scale * 0.5

  // Palma bem vertical: pulso abaixo dos nós MCP
  const palmaVertical = lm[0].y > lm[9].y

  if (indicadorCima && medioCima && anelarCima && minimoCima && dedicosJuntos && palmaVertical) {
    return { sinal: 'peito', confianca: 0.78, texto: 'Paciente relata dor no peito.' }
  }
  return null
}

/**
 * COSTAS — punho fechado com polegar sobre os dedos (similar a DOR mas polegar em cima)
 */
function reconhecerCostas(lm) {
  const scale = handScale(lm)

  const indicadorDobrado = lm[8].y > lm[6].y
  const medioDobrado     = lm[12].y > lm[10].y
  const anelarDobrado    = lm[16].y > lm[14].y
  const minimoDobrado    = lm[20].y > lm[18].y

  // Polegar em cima dos dedos (não lateral como em DOR)
  const polegarEmCima = lm[4].y < lm[3].y && lm[4].x < lm[8].x

  if (indicadorDobrado && medioDobrado && anelarDobrado && minimoDobrado && polegarEmCima) {
    return { sinal: 'costas', confianca: 0.76, texto: 'Paciente relata dor nas costas.' }
  }
  return null
}

/**
 * POUCO — pinch: polegar e indicador quase se tocando, demais dobrados
 * ("OK" shape ou pinch)
 */
function reconhecerPouco(lm) {
  const scale = handScale(lm)
  const pinchDist = dist(lm[4], lm[8])

  const pincando     = pinchDist < scale * 0.35
  const medioDobrado = lm[12].y > lm[10].y
  const anelarDobrado= lm[16].y > lm[14].y
  const minimoDobrado= lm[20].y > lm[18].y

  if (pincando && medioDobrado && anelarDobrado && minimoDobrado) {
    return { sinal: 'pouco', confianca: 0.83, texto: 'Paciente relata pouca dor.' }
  }
  return null
}

/**
 * MUITO — mão aberta com dedos bem separados e estendidos
 * Distingue-se de BARRIGA pela separação entre os dedos
 */
function reconhecerMuito(lm) {
  const scale = handScale(lm)

  const indicadorAberto = lm[8].y < lm[6].y
  const medioAberto     = lm[12].y < lm[10].y
  const anelarAberto    = lm[16].y < lm[14].y
  const minimoAberto    = lm[20].y < lm[18].y

  // Dedos bem separados
  const sepIndicadorMedio = dist(lm[8], lm[12])
  const sepMedioAnelar    = dist(lm[12], lm[16])
  const sepAnelarMinimo   = dist(lm[16], lm[20])
  const bemSeparados      = sepIndicadorMedio > scale * 0.55 &&
                            sepMedioAnelar    > scale * 0.45 &&
                            sepAnelarMinimo   > scale * 0.45

  if (indicadorAberto && medioAberto && anelarAberto && minimoAberto && bemSeparados) {
    return { sinal: 'muito', confianca: 0.82, texto: 'Paciente relata muita dor.' }
  }
  return null
}

/**
 * FEBRE — palma plana horizontal (mão deitada), todos os dedos estendidos
 */
function reconhecerFebre(lm) {
  const todosEstendidos =
    lm[8].y  < lm[6].y &&
    lm[12].y < lm[10].y &&
    lm[16].y < lm[14].y &&
    lm[20].y < lm[18].y

  // Palma horizontal: pulso e MCPs em y similar (mão deitada)
  const yMCP5 = lm[5].y
  const yMCP17 = lm[17].y
  const yPulso = lm[0].y
  const palmaHorizontal = Math.abs(yMCP5 - yPulso) < 0.12 && Math.abs(yMCP5 - yMCP17) < 0.08

  if (todosEstendidos && palmaHorizontal) {
    return { sinal: 'febre', confianca: 0.77, texto: 'Paciente relata febre.' }
  }
  return null
}

// ── Pipeline de reconhecimento (prioridade: mais específico → mais genérico) ──

const RECONHECEDORES = [
  reconhecerSim,
  reconhecerNao,
  reconhecerPouco,       // antes de DOR (punho)
  reconhecerCabeca,      // antes de peito
  reconhecerPeito,       // antes de barriga
  reconhecerBarriga,
  reconhecerMuito,       // antes de barriga (palma aberta)
  reconhecerFebre,
  reconhecerCostas,
  reconhecerDor,
]

function reconhecer(landmarks) {
  if (!landmarks || landmarks.length < 21) return null
  for (const fn of RECONHECEDORES) {
    const resultado = fn(landmarks)
    if (resultado && resultado.confianca >= MIN_CONFIDENCE) {
      return resultado
    }
  }
  return null
}

// ── Hook principal ────────────────────────────────────────────────────────

/**
 * useSignRecognition
 *
 * Recebe landmarks por frame e retorna o sinal confirmado
 * (mantido por HOLD_FRAMES frames consecutivos).
 *
 * Retorna:
 *   - candidato: sinal sendo segurado no momento (não confirmado)
 *   - sinalConfirmado: sinal após HOLD_FRAMES frames
 *   - progressoHold: 0–1 para barra de progresso
 *   - limpar: função para resetar
 */
export function useSignRecognition({ onSinalConfirmado } = {}) {
  const [candidato, setCandidato] = useState(null)
  const [progressoHold, setProgressoHold] = useState(0)

  const holdRef  = useRef({ sinal: null, count: 0 })
  const cooldownRef = useRef(false) // evita re-disparar o mesmo sinal imediatamente

  const processarFrame = useCallback((landmarks) => {
    if (cooldownRef.current) return

    const resultado = reconhecer(landmarks)

    if (!resultado) {
      // Nenhum sinal — reseta
      holdRef.current = { sinal: null, count: 0 }
      setCandidato(null)
      setProgressoHold(0)
      return
    }

    const { sinal } = resultado

    if (holdRef.current.sinal === sinal) {
      // Mesmo sinal — incrementa contador
      holdRef.current.count++
      setProgressoHold(Math.min(holdRef.current.count / HOLD_FRAMES, 1))
      setCandidato(resultado)

      if (holdRef.current.count >= HOLD_FRAMES) {
        // Confirmado!
        holdRef.current = { sinal: null, count: 0 }
        setProgressoHold(0)
        setCandidato(null)
        cooldownRef.current = true

        if (onSinalConfirmado) onSinalConfirmado(resultado)

        // Cooldown de 2 segundos antes de reconhecer de novo
        setTimeout(() => { cooldownRef.current = false }, 2000)
      }
    } else {
      // Sinal diferente — reinicia contagem
      holdRef.current = { sinal, count: 1 }
      setCandidato(resultado)
      setProgressoHold(1 / HOLD_FRAMES)
    }
  }, [onSinalConfirmado])

  const limpar = useCallback(() => {
    holdRef.current = { sinal: null, count: 0 }
    setCandidato(null)
    setProgressoHold(0)
    cooldownRef.current = false
  }, [])

  return { candidato, progressoHold, processarFrame, limpar }
}

// ── Metadados dos sinais para UI ──────────────────────────────────────────

export const SINAIS_META = {
  sim:     { emoji: '👍', label: 'SIM',     cor: '#10b981' },
  nao:     { emoji: '👎', label: 'NÃO',     cor: '#ef4444' },
  dor:     { emoji: '😣', label: 'DOR',     cor: '#f97316' },
  cabeca:  { emoji: '🤕', label: 'CABEÇA',  cor: '#8b5cf6' },
  barriga: { emoji: '🤢', label: 'BARRIGA', cor: '#06b6d4' },
  peito:   { emoji: '💔', label: 'PEITO',   cor: '#ec4899' },
  costas:  { emoji: '🔙', label: 'COSTAS',  cor: '#64748b' },
  pouco:   { emoji: '🤏', label: 'POUCO',   cor: '#84cc16' },
  muito:   { emoji: '🖐️', label: 'MUITO',   cor: '#f59e0b' },
  febre:   { emoji: '🌡️', label: 'FEBRE',   cor: '#ef4444' },
}

export const GUIA_SINAIS = [
  { sinal: 'sim',     descricao: 'Polegar para cima',            emoji: '👍' },
  { sinal: 'nao',     descricao: 'Polegar para baixo',           emoji: '👎' },
  { sinal: 'dor',     descricao: 'Punho fechado',                emoji: '✊' },
  { sinal: 'cabeca',  descricao: 'Indicador para cima',          emoji: '☝️' },
  { sinal: 'barriga', descricao: 'Palma aberta, dedos juntos',   emoji: '🤚' },
  { sinal: 'peito',   descricao: 'Mão vertical, dedos juntos',   emoji: '✋' },
  { sinal: 'costas',  descricao: 'Punho com polegar por cima',   emoji: '✊' },
  { sinal: 'pouco',   descricao: 'Polegar e indicador pinçando', emoji: '🤏' },
  { sinal: 'muito',   descricao: 'Palma aberta, dedos separados',emoji: '🖐️' },
  { sinal: 'febre',   descricao: 'Mão deitada (palma plana)',    emoji: '🌡️' },
]
