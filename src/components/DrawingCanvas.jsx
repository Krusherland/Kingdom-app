import { useRef, useEffect, useState, useCallback } from 'react'
import './DrawingCanvas.css'

const CANVAS_W = 700
const CANVAS_H = 400
const DRAW_TIME = 60

const COLORS = [
  '#1a1a1a', '#c0392b', '#e67e22', '#f1c40f',
  '#27ae60', '#2980b9', '#8e44ad', '#ffffff',
]
const SIZES = [3, 6, 12, 20]

// Draw a stroke received from WebSocket onto the canvas context
function applyStroke(ctx, stroke, pathState) {
  const cw = ctx.canvas.width
  const ch = ctx.canvas.height
  const x = stroke.x * cw
  const y = stroke.y * ch

  ctx.strokeStyle = stroke.color ?? '#1a1a1a'
  ctx.lineWidth = stroke.brushSize ?? 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (stroke.strokeType) {
    case 'START':
      pathState.drawing = true
      pathState.lastX = x
      pathState.lastY = y
      break
    case 'MOVE':
      if (pathState.drawing) {
        ctx.beginPath()
        ctx.moveTo(pathState.lastX, pathState.lastY)
        ctx.lineTo(x, y)
        ctx.stroke()
        pathState.lastX = x
        pathState.lastY = y
      }
      break
    case 'END':
      pathState.drawing = false
      break
    case 'CLEAR':
      ctx.clearRect(0, 0, cw, ch)
      pathState.drawing = false
      break
    default: break
  }
}

export default function DrawingCanvas({ isDrawer, lastStroke, onStroke, onDone }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const pathRef = useRef({ drawing: false, lastX: 0, lastY: 0 })
  const isPointerDownRef = useRef(false)

  const [color, setColor] = useState('#1a1a1a')
  const [brushSize, setBrushSize] = useState(6)
  const [tool, setTool] = useState('pen')   // 'pen' | 'eraser'
  const [timer, setTimer] = useState(DRAW_TIME)

  // Init canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ctxRef.current = canvas.getContext('2d')
  }, [])

  // Countdown timer — only runs for the drawer
  useEffect(() => {
    if (!isDrawer) return
    setTimer(DRAW_TIME)
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(id); onDone?.(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isDrawer, onDone])

  // Apply incoming strokes for observers
  useEffect(() => {
    if (!lastStroke || !ctxRef.current || isDrawer) return
    applyStroke(ctxRef.current, lastStroke, pathRef.current)
  }, [lastStroke, isDrawer])

  // Pointer event handlers for the active drawer
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    }
  }, [])

  const sendAndDraw = useCallback((strokeType, x, y) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const effectiveColor = tool === 'eraser' ? '#ffffff' : color
    const effectiveSize  = tool === 'eraser' ? brushSize * 2.5 : brushSize
    const stroke = { strokeType, x, y, color: effectiveColor, brushSize: effectiveSize }
    onStroke?.(stroke)
    applyStroke(ctx, stroke, pathRef.current)
  }, [tool, color, brushSize, onStroke])

  useEffect(() => {
    if (!isDrawer) return
    const canvas = canvasRef.current
    if (!canvas) return

    const onDown = (e) => {
      e.preventDefault()
      isPointerDownRef.current = true
      const { x, y } = getCanvasPos(e)
      sendAndDraw('START', x, y)
    }
    const onMove = (e) => {
      e.preventDefault()
      if (!isPointerDownRef.current) return
      const { x, y } = getCanvasPos(e)
      sendAndDraw('MOVE', x, y)
    }
    const onUp = () => {
      if (!isPointerDownRef.current) return
      isPointerDownRef.current = false
      const { lastX, lastY } = pathRef.current
      sendAndDraw('END', lastX / CANVAS_W, lastY / CANVAS_H)
    }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onUp)
    canvas.addEventListener('touchstart', onDown, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onUp)

    return () => {
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onUp)
      canvas.removeEventListener('touchstart', onDown)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onUp)
    }
  }, [isDrawer, getCanvasPos, sendAndDraw])

  const handleClear = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    onStroke?.({ strokeType: 'CLEAR', x: 0, y: 0, color, brushSize })
  }, [color, brushSize, onStroke])

  const timerPct = timer / DRAW_TIME
  const timerColor = timerPct > 0.4 ? 'var(--gold)' : timerPct > 0.2 ? 'var(--warning, #c9a227)' : 'var(--danger)'

  return (
    <div className="dc">
      <div className="dc__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={`dc__canvas ${isDrawer ? 'dc__canvas--active' : ''}`}
        />
      </div>

      {isDrawer && (
        <div className="dc__toolbar">
          {/* Timer */}
          <div className="dc__timer" style={{ '--tc': timerColor }}>
            <div
              className="dc__timer-bar"
              style={{ width: `${timerPct * 100}%`, background: timerColor }}
            />
            <span className="dc__timer-text">{timer}s</span>
          </div>

          <div className="dc__controls">
            {/* Color swatches */}
            <div className="dc__colors">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`dc__color-swatch ${color === c && tool === 'pen' ? 'dc__color-swatch--active' : ''}`}
                  style={{ background: c, border: c === '#ffffff' ? '1px solid #aaa' : 'none' }}
                  onClick={() => { setColor(c); setTool('pen') }}
                  title={c}
                />
              ))}
            </div>

            {/* Brush sizes */}
            <div className="dc__sizes">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={`dc__size-btn ${brushSize === s ? 'dc__size-btn--active' : ''}`}
                  onClick={() => setBrushSize(s)}
                  title={`Tamaño ${s}`}
                >
                  <span style={{ width: s, height: s, borderRadius: '50%', background: 'currentColor', display: 'block' }} />
                </button>
              ))}
            </div>

            <div className="dc__tools">
              <button
                className={`btn btn-sm ${tool === 'eraser' ? 'btn-outline' : 'btn-ghost'}`}
                onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
                title="Borrador"
              >
                ✕ Borrar
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleClear} title="Limpiar todo">
                🗑 Limpiar
              </button>
              <button className="btn btn-sm btn-gold" onClick={onDone}>
                ✓ Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {!isDrawer && (
        <div className="dc__observe-hint text-muted">
          Observando el dibujo en tiempo real…
        </div>
      )}
    </div>
  )
}
