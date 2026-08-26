import { useState, useEffect } from 'react'
import RoleCard from './RoleCard'
import DrawingCanvas from './DrawingCanvas'
import './DrawingPhase.css'

export default function DrawingPhase({
  session,
  gameState,
  myState,
  lastStroke,
  sendStroke,
  sendDoneDrawing,
  showRoleCard,
  onRoleCardDismiss,
}) {
  const currentDrawer = gameState?.currentDrawerNickname
  const isDrawer = currentDrawer === session?.nickname
  const players = gameState?.players ?? []
  const drawingTimeSecs = gameState?.drawingTimeSecs ?? 40

  const [timeLeft, setTimeLeft] = useState(drawingTimeSecs)

  useEffect(() => {
    setTimeLeft(drawingTimeSecs)
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [currentDrawer, drawingTimeSecs])

  const handleDone = () => {
    sendDoneDrawing()
  }

  return (
    <div className="drawing-phase">
      {showRoleCard && myState?.role && (
        <RoleCard
          role={myState.role}
          word={myState.word}
          onDismiss={onRoleCardDismiss}
        />
      )}

      <header className="drawing-phase__header">
        <div className="drawing-phase__round">
          Ronda {gameState?.currentRound} / {gameState?.totalRounds}
        </div>
        <div className={`drawing-phase__timer${timeLeft <= 10 ? ' drawing-phase__timer--urgent' : ''}`}>
          {timeLeft}s
        </div>
        <div className="drawing-phase__status">
          {isDrawer ? (
            <>
              <span className="drawing-phase__your-turn">✏ Tu turno de dibujar</span>
              {myState?.word && (
                <span className="drawing-phase__word">
                  Palabra: <strong>{myState.word}</strong>
                </span>
              )}
            </>
          ) : (
            <span>
              <span className="text-gold">{currentDrawer}</span> está dibujando…
            </span>
          )}
        </div>
      </header>

      <div className="drawing-phase__body">
        <DrawingCanvas
          key={currentDrawer}
          isDrawer={isDrawer}
          lastStroke={lastStroke}
          onStroke={sendStroke}
          onDone={handleDone}
        />

        <aside className="drawing-phase__sidebar">
          <div className="section-title">Jugadores</div>
          <ul className="drawing-phase__player-list">
            {players.map((p) => (
              <li
                key={p.nickname}
                className={`drawing-phase__player ${!p.alive ? 'drawing-phase__player--dead' : ''} ${p.currentDrawer ? 'drawing-phase__player--drawing' : ''}`}
              >
                <span className="drawing-phase__player-dot" />
                <span className="drawing-phase__player-name">
                  {p.nickname}
                  {p.nickname === session?.nickname && (
                    <span className="text-dim"> (tú)</span>
                  )}
                </span>
                {p.currentDrawer && (
                  <span className="drawing-phase__pen" title="Dibujando">✏</span>
                )}
                {!p.alive && <span className="text-dim">✝</span>}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
