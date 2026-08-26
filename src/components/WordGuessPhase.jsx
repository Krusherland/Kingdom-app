import { useState } from 'react'
import './WordGuessPhase.css'

export default function WordGuessPhase({ session, gameState, myState, onGuess }) {
  const [guess, setGuess] = useState('')
  const [submitted, setSubmitted] = useState(myState?.guessedCorrectly ?? false)
  const [result, setResult] = useState(myState?.guessedCorrectly ? true : null)
  const [loading, setLoading] = useState(false)

  const players = gameState?.players ?? []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!guess.trim() || loading) return
    setLoading(true)
    const correct = await onGuess(guess.trim())
    setResult(correct)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="wg">
      <header className="wg__header">
        <div className="wg__scroll">📜</div>
        <h2>Fase Final — La Palabra Verdadera</h2>
        <p className="text-muted">
          Tras {gameState?.totalRounds} rondas de dibujo, ha llegado el momento de la verdad.
          ¿Cuál era la palabra inocente?
        </p>
      </header>

      <div className="wg__body">
        <div className="wg__guess-panel card">
          {!submitted ? (
            <>
              <p className="wg__hint text-muted">
                {myState?.role === 'OUTSIDER'
                  ? 'Eres el Forastero. Tu palabra era diferente. ¿Puedes adivinar la de los inocentes?'
                  : 'Escribe la palabra que te fue asignada para ganar puntos.'}
              </p>
              <form className="wg__form" onSubmit={handleSubmit}>
                <input
                  className="input wg__input"
                  type="text"
                  placeholder="Escribe la palabra…"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  maxLength={40}
                  autoFocus
                />
                <button
                  className="btn btn-gold btn-lg"
                  type="submit"
                  disabled={!guess.trim() || loading}
                >
                  {loading ? 'Enviando…' : '📜 Revelar'}
                </button>
              </form>
            </>
          ) : (
            <div className="wg__result">
              {result ? (
                <>
                  <div className="wg__result-icon">✨</div>
                  <h3 className="text-success">¡Correcto! +10 puntos</h3>
                  <p className="text-muted">Tu palabra fue aceptada.</p>
                </>
              ) : (
                <>
                  <div className="wg__result-icon">✗</div>
                  <h3 className="text-danger">Incorrecto</h3>
                  <p className="text-muted">
                    {myState?.role === 'OUTSIDER'
                      ? 'No lograste descifrar la palabra inocente.'
                      : 'Esa no era la palabra asignada.'}
                  </p>
                </>
              )}
              <p className="wg__wait text-muted">Esperando que todos completen la fase…</p>
            </div>
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
