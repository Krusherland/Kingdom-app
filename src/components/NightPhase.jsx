import { useState, useEffect } from 'react'
import plebeianImg from '../assets/Plebeian.png'
import alchemistImg from '../assets/Alchemist.png'
import guardImg from '../assets/Royal-Guard.png'
import outsiderImg from '../assets/Outsider.png'
import logo from '../assets/Kingdom-logo-no-bg.png'
import './NightPhase.css'

const ROLE_INFO = {
  PLEBEIAN: {
    name: 'Plebeyo',
    img: plebeianImg,
    colorClass: 'role-color-plebeian',
    lore: 'Hombre del pueblo, leal a su reino y a sus vecinos. Cada noche emite su voto para expulsar al sospechoso.',
    actionLabel: 'Votar',
    icon: '⚖',
  },
  ALCHEMIST: {
    name: 'Alquimista',
    img: alchemistImg,
    colorClass: 'role-color-alchemist',
    lore: 'En su taller colmado de redomas, el Alquimista teje defensas invisibles. Cada noche protege a un jugador y emite su voto.',
    actionLabel: 'Proteger y Votar',
    icon: '⚗',
  },
  ROYAL_GUARD: {
    name: 'Guardia Real',
    img: guardImg,
    colorClass: 'role-color-royalguard',
    lore: 'Jura lealtad a la corona y a nadie más. Opera en silencio para investigar la verdadera identidad de un jugador y emite su voto.',
    actionLabel: 'Revelar y Votar',
    icon: '🛡',
  },
  OUTSIDER: {
    name: 'Forastero',
    img: outsiderImg,
    colorClass: 'role-color-outsider',
    lore: 'No tiene nombre. No tiene historia. Infiltrado entre los leales, cada noche elimina a un inocente.',
    actionLabel: 'Eliminar',
    icon: '🗡',
  },
}

export default function NightPhase({ session, gameState, myState, onAction }) {
  const [abilityTarget, setAbilityTarget] = useState(null)
  const [voteTarget, setVoteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const players = gameState?.players ?? []
  const alive = players.filter((p) => p.alive)
  const myRole = myState?.role
  const isAlive = myState?.alive !== false
  const hasActed = myState?.hasActedThisNight
  const roleInfo = ROLE_INFO[myRole]

  const nightVotes = gameState?.nightVotes ?? []
  const voteMap = Object.fromEntries(nightVotes.map((v) => [v.targetNickname, v.count]))

  const phaseDuration = gameState?.nightTimeSecs || 40
  const [timeLeft, setTimeLeft] = useState(phaseDuration)

  useEffect(() => {
    setTimeLeft(phaseDuration)
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [gameState?.currentRound, phaseDuration])

  const isTwoStepRole = myRole === 'ALCHEMIST' || myRole === 'ROYAL_GUARD'

  // Ability targets (Alchemist can target self; Guard/Outsider/Plebeian cannot)
  const abilityTargets = alive.filter((p) => {
    if (myRole === 'ALCHEMIST') return true
    return p.nickname !== session?.nickname
  })

  // Vote targets (excluding self)
  const voteTargets = alive.filter((p) => p.nickname !== session?.nickname)

  const handleSubmit = async () => {
    if (isTwoStepRole) {
      if (!abilityTarget || !voteTarget) return
      setSubmitting(true)
      const primaryType = myRole === 'ALCHEMIST' ? 'SHIELD' : 'REVEAL'
      await onAction(primaryType, abilityTarget, voteTarget)
      setSubmitting(false)
    } else if (myRole === 'OUTSIDER') {
      if (!abilityTarget) return
      setSubmitting(true)
      await onAction('KILL', abilityTarget)
      setSubmitting(false)
    } else {
      // PLEBEIAN
      if (!voteTarget) return
      setSubmitting(true)
      await onAction('VOTE', voteTarget)
      setSubmitting(false)
    }
  }

  const isFormValid = isTwoStepRole
    ? !!abilityTarget && !!voteTarget
    : myRole === 'OUTSIDER'
    ? !!abilityTarget
    : !!voteTarget

  return (
    <div className="night">
      <div className="night__bg" />

      <header className="night__header">
        <img src={logo} alt="Kingdom" className="night__logo" />
        <h2>La Noche Cae</h2>
        <p className="text-muted">Ronda {gameState?.currentRound} — Fase nocturna</p>
      </header>

      <div className="night__body">
        {/* Left Page: Role Info & Lore */}
        <section className="night__role-panel" aria-label="Información de tu rol">
          {myRole && roleInfo && (
            <div className="night__role-banner">
              <div className="night__role-banner-frame">
                <img src={roleInfo.img} alt={roleInfo.name} className="night__role-banner-img" />
              </div>
              <div className={`night__role-title ${roleInfo.colorClass}`}>
                {roleInfo.name}
              </div>
            </div>
          )}

          <div className="night__role-details card">
            <p className="night__role-lore">{roleInfo?.lore}</p>

            {myState?.word && (
              <div className="night__role-word">
                <span className="text-muted">Tu palabra secreta: </span>
                <span className="text-gold font-bold">{myState.word}</span>
              </div>
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
        </section>

        {/* Right Page: Actions & Player List */}
        <section className="night__actions-panel" aria-label="Acciones y jugadores">
          <div className="night__timer-bar card">
            <div className="section-title">Tiempo de la noche</div>
            <div className={`night__timer${timeLeft <= 5 ? ' night__timer--urgent' : ''}`}>
              {timeLeft}s
            </div>
          </div>

          <div className="night__actions-container card">
            {!isAlive && (
              <div className="night__dead">
                <p className="text-dim">Has sido eliminado.</p>
                <p className="text-muted">Observas en silencio.</p>
              </div>
            )}

            {isAlive && hasActed && (
              <div className="night__waited">
                <p className="text-success">✓ Acción y voto enviados</p>
                <p className="text-muted">Esperando a que todos completen la noche…</p>
              </div>
            )}

            {isAlive && !hasActed && (
              <div className="night__form">
                {/* Two-step roles: Ability section */}
                {isTwoStepRole && (
                  <div className="night__section">
                    <label className="night__section-title text-gold">
                      {myRole === 'ALCHEMIST' ? '⚗ Proteger a un jugador:' : '🛡 Revelar identidad:'}
                    </label>
                    <ul className="night__targets">
                      {abilityTargets.map((p) => (
                        <li key={`ability-${p.nickname}`}>
                          <button
                            type="button"
                            className={`night__target-btn ${abilityTarget === p.nickname ? 'night__target-btn--selected' : ''}`}
                            onClick={() => setAbilityTarget(p.nickname)}
                          >
                            <span className="night__target-dot" />
                            {p.nickname}
                            {p.nickname === session?.nickname && <span className="text-dim"> (tú)</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Single or Two-step roles: Primary action / Vote section */}
                {myRole === 'OUTSIDER' ? (
                  <div className="night__section">
                    <label className="night__section-title text-danger">🗡 Eliminar a un inocente:</label>
                    <ul className="night__targets">
                      {abilityTargets.map((p) => (
                        <li key={`kill-${p.nickname}`}>
                          <button
                            type="button"
                            className={`night__target-btn ${abilityTarget === p.nickname ? 'night__target-btn--selected' : ''}`}
                            onClick={() => setAbilityTarget(p.nickname)}
                          >
                            <span className="night__target-dot" />
                            {p.nickname}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="night__section">
                    <label className="night__section-title text-gold">⚖ Votar para eliminar a un sospechoso:</label>
                    <ul className="night__targets">
                      {voteTargets.map((p) => (
                        <li key={`vote-${p.nickname}`}>
                          <button
                            type="button"
                            className={`night__target-btn ${voteTarget === p.nickname ? 'night__target-btn--selected' : ''}`}
                            onClick={() => setVoteTarget(p.nickname)}
                          >
                            <span className="night__target-dot" />
                            {p.nickname}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  className={`btn btn-lg night__submit-btn ${myRole === 'OUTSIDER' ? 'btn-danger' : 'btn-gold'}`}
                  disabled={!isFormValid || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Enviando…' : `${roleInfo?.icon} ${roleInfo?.actionLabel}`}
                </button>
              </div>
            )}
          </div>

          {/* Player status & votes cast */}
          <div className="night__players card">
            <div className="section-title">Jugadores del Reino</div>
            <ul className="night__player-list">
              {players.map((p) => (
                <li key={p.nickname} className={`night__player ${!p.alive ? 'night__player--dead' : ''}`}>
                  <span className={`night__player-status ${p.alive ? 'night__player-status--alive' : ''}`} />
                  <span className="night__player-name">
                    {p.nickname}
                    {p.nickname === session?.nickname && <span className="text-dim"> (tú)</span>}
                  </span>
                  <span className="night__player-score text-dim">{p.score} pts</span>
                  {p.hasActedThisNight && p.alive && (
                    <span className="night__voted-badge text-success">✓ Listo</span>
                  )}
                  {voteMap[p.nickname] > 0 && (
                    <span className="night__vote-badge">⚖ {voteMap[p.nickname]}</span>
                  )}
                  {!p.alive && <span className="text-dim">✝</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
