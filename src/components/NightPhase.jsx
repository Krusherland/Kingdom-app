import { useState, useEffect } from 'react'
import './NightPhase.css'

const ACTION_CONFIG = {
  PLEBEIAN:   { type: 'VOTE',   label: 'Votar',    icon: '⚖', prompt: 'Vota para eliminar a un sospechoso.' },
  ALCHEMIST:  { type: 'SHIELD', label: 'Proteger', icon: '⚗', prompt: 'Escoge a quién proteger esta noche.' },
  ROYAL_GUARD:{ type: 'REVEAL', label: 'Revelar',  icon: '🛡', prompt: 'Descubre la identidad de un jugador.' },
  OUTSIDER:   { type: 'KILL',   label: 'Eliminar', icon: '🗡', prompt: 'Escoge a quién eliminar esta noche.' },
}

export default function NightPhase({ session, gameState, myState, onAction }) {
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const players = gameState?.players ?? []
  const alive = players.filter((p) => p.alive)
  const myRole = myState?.role
  const isAlive = myState?.alive !== false
  const hasActed = myState?.hasActedThisNight

  const cfg = ACTION_CONFIG[myRole]

  const nightActorNick = gameState?.currentNightActorNickname
  const isMyTurn = isAlive && nightActorNick === session?.nickname
  const nightVotes = gameState?.nightVotes ?? []
  const voteMap = Object.fromEntries(nightVotes.map(v => [v.targetNickname, v.count]))

  const [timeLeft, setTimeLeft] = useState(15)
  useEffect(() => {
    setTimeLeft(15)
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [nightActorNick])

  // Targets: alive players, excluding self (except Alchemist who can self-shield)
  const targets = alive.filter((p) => {
    if (p.nickname === session?.nickname) return myRole === 'ALCHEMIST'
    return true
  })

  const handleSubmit = async () => {
    if (!target || !cfg) return
    setSubmitting(true)
    await onAction(cfg.type, target)
    setSubmitting(false)
  }

  return (
    <div className="night">
      <div className="night__bg" />

      <header className="night__header">
        <div className="night__moon">🌑</div>
        <h2>La Noche Cae</h2>
        <p className="text-muted">Ronda {gameState?.currentRound} — Fase nocturna</p>
      </header>

      <div className="night__body">
        {/* Left: role panel */}
        <div className="night__role-panel card">
          {myRole && cfg && (
            <>
              <div className="night__role-icon">{cfg.icon}</div>
              <div className={`night__role-name badge badge-${myRole.toLowerCase().replace('_', '')}`}>
                {myRole === 'ROYAL_GUARD' ? 'Guardia Real' :
                 myRole === 'PLEBEIAN' ? 'Plebeyo' :
                 myRole === 'ALCHEMIST' ? 'Alquimista' : 'Forastero'}
              </div>
            </>
          )}

          {!isAlive && (
            <div className="night__dead">
              <p className="text-dim">Has sido eliminado.</p>
              <p className="text-muted">Observas en silencio.</p>
            </div>
          )}

          {isAlive && hasActed && (
            <div className="night__waited">
              <p className="text-success">✓ Acción enviada</p>
              <p className="text-muted">Esperando a los demás…</p>
            </div>
          )}

          {isAlive && !hasActed && nightActorNick && !isMyTurn && (
            <div className="night__waiting-turn">
              <p className="text-muted">Turno de</p>
              <span className="night__current-actor text-gold">{nightActorNick}</span>
              <div className={`night__timer${timeLeft <= 5 ? ' night__timer--urgent' : ''}`}>{timeLeft}s</div>
            </div>
          )}

          {isAlive && !hasActed && cfg && isMyTurn && (
            <>
              <p className="night__prompt">{cfg.prompt}</p>
              <div className={`night__timer night__timer--myturn${timeLeft <= 5 ? ' night__timer--urgent' : ''}`}>{timeLeft}s</div>

              <ul className="night__targets">
                {targets.map((p) => (
                  <li key={p.nickname}>
                    <button
                      className={`night__target-btn ${target === p.nickname ? 'night__target-btn--selected' : ''}`}
                      onClick={() => setTarget(p.nickname)}
                    >
                      <span className="night__target-dot" />
                      {p.nickname}
                      {p.nickname === session?.nickname && (
                        <span className="text-dim"> (tú)</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                className={`btn btn-lg night__submit-btn ${myRole === 'OUTSIDER' ? 'btn-danger' : 'btn-gold'}`}
                disabled={!target || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Enviando…' : `${cfg.icon} ${cfg.label}`}
              </button>
            </>
          )}

          {/* Royal Guard reveal history */}
          {myRole === 'ROYAL_GUARD' && myState?.revealResults?.length > 0 && (
            <div className="night__reveals">
              <div className="section-title">Revelaciones</div>
              {myState.revealResults.map((r, i) => (
                <div key={i} className="night__reveal-entry">
                  <span className="text-gold">{r.targetNickname}</span>
                  <span className="text-muted"> → </span>
                  <span className={`badge badge-${r.revealedRole?.toLowerCase()?.replace('_', '')}`}>
                    {r.revealedRole}
                  </span>
                  <span className="text-dim"> R{r.roundNumber}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: all players */}
        <div className="night__players card">
          <div className="section-title">Jugadores</div>
          <ul className="night__player-list">
            {players.map((p) => (
              <li key={p.nickname} className={`night__player ${!p.alive ? 'night__player--dead' : ''}`}>
                <span className={`night__player-status ${p.alive ? 'night__player-status--alive' : ''}`} />
                <span className="night__player-name">
                  {p.nickname}
                  {p.nickname === session?.nickname && (
                    <span className="text-dim"> (tú)</span>
                  )}
                </span>
                <span className="night__player-score text-dim">{p.score} pts</span>                {voteMap[p.nickname] > 0 && (
                  <span className="night__vote-badge">⚖ {voteMap[p.nickname]}</span>
                )}
                {p.nickname === nightActorNick && p.alive && (
                  <span className="night__acting-dot" title="Actuando ahora" />
                )}                {!p.alive && <span className="text-dim">✝</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
