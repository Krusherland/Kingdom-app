import { useState, useEffect } from 'react'
import './WordGuessPhase.css'

const FINAL_TIME = 30

export default function WordGuessPhase({ session, gameState, myState, onGuess, onFinalVote }) {
  const isOutsider = myState?.role === 'OUTSIDER'
  const hasActed = myState?.hasActedFinalPhase ?? false

  const [guess, setGuess] = useState('')
  const [voteTarget, setVoteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [guessResult, setGuessResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(FINAL_TIME)

  const players = gameState?.players ?? []
  const alive = players.filter(p => p.alive)
  const votableTargets = alive.filter(p => p.nickname !== session?.nickname)

  useEffect(() => {
    setTimeLeft(FINAL_TIME)
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const handleGuessSubmit = async (e) => {
    e.preventDefault()
    if (!guess.trim() || submitting) return
    setSubmitting(true)
    const correct = await onGuess(guess.trim())
    setGuessResult(correct)
    setSubmitting(false)
  }

  const handleVoteSubmit = async () => {
    if (!voteTarget || submitting) return
    setSubmitting(true)
    await onFinalVote(voteTarget)
    setSubmitting(false)
  }

  return (
    <div className="wg">
      <header className="wg__header">
        <div className="wg__scroll">📜</div>
        <h2>Fase Final — La Última Decisión</h2>
        <p className="text-muted">
          {isOutsider
            ? 'Adivina la palabra de los inocentes para escapar del Reino.'
            : 'Vota para eliminar al sospechoso antes de que escape.'}
        </p>
        <div className={`wg__timer${timeLeft <= 5 ? ' wg__timer--urgent' : ''}`}>{timeLeft}s</div>
      </header>

      <div className="wg__body">
        <div className="wg__action-panel card">
          {hasActed ? (
            <div className="wg__result">
              {isOutsider ? (
                guessResult ? (
                  <>
                    <div className="wg__result-icon">⚔</div>
                    <h3 className="text-success">¡Correcto! Has escapado.</h3>
                    <p className="text-muted">Revelaste la palabra secreta.</p>
                  </>
                ) : (
                  <>
                    <div className="wg__result-icon">✗</div>
                    <h3 className="text-danger">Incorrecto.</h3>
                    <p className="text-muted">Tu intento de escape ha fallado.</p>
                  </>
                )
              ) : (
                <>
                  <div className="wg__result-icon">⚖</div>
                  <h3 className="text-success">✓ Voto enviado</h3>
                  <p className="text-muted">Tu decisión ha sido registrada.</p>
                </>
              )}
              <p className="wg__wait text-muted">Esperando a que todos actúen…</p>
            </div>
          ) : isOutsider ? (
            <>
              <p className="wg__hint text-muted">
                Eres el Forastero. Si adivinas la palabra inocente, el Reino caerá.
              </p>
              <form className="wg__form" onSubmit={handleGuessSubmit}>
                <input
                  className="input wg__input"
                  type="text"
                  placeholder="Escribe la palabra inocente…"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  maxLength={40}
                  autoFocus
                />
                <button
                  className="btn btn-danger btn-lg"
                  type="submit"
                  disabled={!guess.trim() || submitting}
                >
                  {submitting ? 'Enviando…' : '⚔ Escapar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="wg__hint text-muted">
                ¿Quién crees que es el Forastero? Vota para eliminarlo.
              </p>
              <ul className="wg__vote-list">
                {votableTargets.map(p => (
                  <li key={p.nickname}>
                    <button
                      className={`wg__vote-btn ${voteTarget === p.nickname ? 'wg__vote-btn--selected' : ''}`}
                      onClick={() => setVoteTarget(p.nickname)}
                    >
                      <span className="wg__vote-dot" />
                      {p.nickname}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-gold btn-lg wg__submit-vote"
                disabled={!voteTarget || submitting}
                onClick={handleVoteSubmit}
              >
                {submitting ? 'Enviando…' : '⚖ Votar'}
              </button>
            </>
          )}
        </div>

        <div className="wg__players card">
          <div className="section-title">Puntuaciones actuales</div>
          <ul className="wg__player-list">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <li key={p.nickname} className="wg__player">
                  <span className="wg__rank text-dim">#{i + 1}</span>
                  <span className="wg__pname">
                    {p.nickname}
                    {p.nickname === session?.nickname && (
                      <span className="text-dim"> (tú)</span>
                    )}
                    {!p.alive && <span className="text-dim"> ✝</span>}
                  </span>
                  <span className="wg__score text-gold">{p.score} pts</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
