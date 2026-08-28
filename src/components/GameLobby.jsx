import { useState } from 'react'
import logo from '../assets/Kingdom-logo-no-bg.png'
import './GameLobby.css'

export default function GameLobby({ session, gameState, onStart, onLeave }) {
  const [starting, setStarting] = useState(false)
  const [drawingTime, setDrawingTime] = useState(40)

  const players = gameState?.players ?? []
  const isHost = players[0]?.nickname === session?.nickname
  // The backend doesn't expose isHost publicly, so we rely on trying to start
  const playerCount = players.length
  const canStart = playerCount >= 6

  const handleStart = async () => {
    setStarting(true)
    await onStart({ drawingTimeSecs: drawingTime })
    setStarting(false)
  }

  return (
    <div className="lobby">
      <header className="lobby__header">
        <div className="lobby__code-row">
          <span className="lobby__code-label text-muted">Código de sala</span>
          <span className="lobby__code">{gameState?.gameCode}</span>
          <button
            className="btn btn-sm btn-ghost lobby__copy"
            title="Copiar código"
            onClick={() => navigator.clipboard?.writeText(gameState?.gameCode ?? '')}
          >
            📋
          </button>
        </div>
      </header>

      <div className="lobby__body">
        <section className="lobby__players card">
          <div className="section-title">
            Jugadores ({playerCount} / 8)
          </div>
          <ul className="lobby__player-list">
            {players.map((p, i) => (
              <li key={p.nickname} className="lobby__player">
                <span className="lobby__player-order">{i + 1}</span>
                <span className="lobby__player-name">
                  {p.nickname}
                  {p.nickname === session?.nickname && (
                    <span className="lobby__you text-muted"> (tú)</span>
                  )}
                </span>
                {i === 0 && <span className="badge badge-guard">Anfitrión</span>}
              </li>
            ))}
            {Array.from({ length: Math.max(0, 6 - playerCount) }).map((_, i) => (
              <li key={`empty-${i}`} className="lobby__player lobby__player--empty">
                <span className="lobby__player-order">{playerCount + i + 1}</span>
                <span className="text-dim">Esperando jugador…</span>
              </li>
            ))}
          </ul>
          {!canStart && (
            <p className="lobby__hint text-muted">
              Se necesitan al menos 6 jugadores para comenzar.
            </p>
          )}
        </section>

        <section className="lobby__start card">
          <div className="lobby__teaser">
            <img src={logo} alt="Kingdom" className="lobby__teaser-logo" />
            <p className="lobby__teaser-text">Estás a punto de vivir una experiencia peligrosa.</p>
          </div>

          {isHost && (
            <div className="lobby__setting">
              <span className="lobby__setting-label">Tiempo de dibujo</span>
              <div className="lobby__time-picker">
                {[20, 40, 60].map(t => (
                  <button
                    key={t}
                    className={`lobby__time-btn${drawingTime === t ? ' lobby__time-btn--active' : ''}`}
                    onClick={() => setDrawingTime(t)}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            className="btn btn-gold btn-lg lobby__start-btn"
            disabled={!canStart || starting}
            onClick={handleStart}
          >
            {starting ? 'Iniciando…' : '⚔ Comenzar Partida'}
          </button>

          <button className="btn btn-ghost lobby__leave-btn" onClick={onLeave}>
            Salir del reino
          </button>
        </section>
      </div>
    </div>
  )
}
