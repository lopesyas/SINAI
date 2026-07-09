/**
 * useHandTracking
 * Hook que gerencia a câmera e o MediaPipe Hands.
 * Entrega landmarks normalizados por frame via callback onResults.
 *
 * Arquitetura:
 *  - Carrega MediaPipe Hands via CDN (evita bundling pesado ~20MB)
 *  - Usa requestAnimationFrame para processar frames
 *  - Limpa todos os recursos ao desmontar
 */
import { useEffect, useRef, useState, useCallback } from 'react'

const HANDS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
const CAMERA_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.crossOrigin = 'anonymous'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export function useHandTracking({ videoRef, canvasRef, onResults, enabled = true }) {
  const [estado, setEstado] = useState('idle') // idle | carregando | ativo | erro
  const [fps, setFps] = useState(0)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  const rafRef = useRef(null)
  const fpsCountRef = useRef({ count: 0, last: performance.now() })

  const iniciar = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    setEstado('carregando')

    try {
      await loadScript(HANDS_CDN)
      await loadScript(CAMERA_CDN)

      const Hands = window.Hands
      const Camera = window.Camera

      if (!Hands || !Camera) {
        setEstado('erro')
        return
      }

      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      })

      hands.onResults((results) => {
        // Calcula FPS
        const now = performance.now()
        fpsCountRef.current.count++
        if (now - fpsCountRef.current.last >= 1000) {
          setFps(fpsCountRef.current.count)
          fpsCountRef.current = { count: 0, last: now }
        }

        // Desenha no canvas
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const video = videoRef.current

        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480

        ctx.save()
        // Espelha horizontalmente (mais natural para o usuário)
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()

        if (results.multiHandLandmarks?.length > 0) {
          const lm = results.multiHandLandmarks[0]

          // Desenha conexões
          drawConnections(ctx, lm, canvas.width, canvas.height)

          // Desenha pontos
          drawLandmarks(ctx, lm, canvas.width, canvas.height)

          // Entrega landmarks para o engine de reconhecimento
          if (onResults) onResults(lm)
        } else {
          if (onResults) onResults(null)
        }
      })

      handsRef.current = hands

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
      })

      await camera.start()
      cameraRef.current = camera
      setEstado('ativo')
    } catch (err) {
      console.error('Erro ao iniciar câmera/MediaPipe:', err)
      setEstado('erro')
    }
  }, [videoRef, canvasRef, onResults])

  const parar = useCallback(() => {
    if (cameraRef.current) {
      try { cameraRef.current.stop() } catch (_) {}
      cameraRef.current = null
    }
    if (handsRef.current) {
      try { handsRef.current.close() } catch (_) {}
      handsRef.current = null
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setEstado('idle')
    setFps(0)
  }, [])

  useEffect(() => {
    if (enabled) {
      iniciar()
    } else {
      parar()
    }
    return parar
  }, [enabled])

  return { estado, fps, parar, reiniciar: iniciar }
}

// ── Helpers de desenho ────────────────────────────────────────────────────

const CONNECTIONS = [
  // Polegar
  [0,1],[1,2],[2,3],[3,4],
  // Indicador
  [0,5],[5,6],[6,7],[7,8],
  // Médio
  [0,9],[9,10],[10,11],[11,12],
  // Anelar
  [0,13],[13,14],[14,15],[15,16],
  // Mínimo
  [0,17],[17,18],[18,19],[19,20],
  // Palma
  [5,9],[9,13],[13,17],
]

function drawConnections(ctx, lm, w, h) {
  ctx.strokeStyle = 'rgba(47,111,237,0.8)'
  ctx.lineWidth = 2.5
  for (const [a, b] of CONNECTIONS) {
    const ax = (1 - lm[a].x) * w
    const ay = lm[a].y * h
    const bx = (1 - lm[b].x) * w
    const by = lm[b].y * h
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.stroke()
  }
}

function drawLandmarks(ctx, lm, w, h) {
  lm.forEach((pt, i) => {
    const x = (1 - pt.x) * w
    const y = pt.y * h
    // Pontas dos dedos maiores
    const isTip = [4, 8, 12, 16, 20].includes(i)
    ctx.beginPath()
    ctx.arc(x, y, isTip ? 7 : 5, 0, Math.PI * 2)
    ctx.fillStyle = isTip ? '#ef4444' : '#ffffff'
    ctx.fill()
    ctx.strokeStyle = isTip ? '#991b1b' : 'rgba(47,111,237,0.9)'
    ctx.lineWidth = 2
    ctx.stroke()
  })
}
