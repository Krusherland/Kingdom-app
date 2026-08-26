import './GameFinished.css'

const ROLE_LABEL = {
  PLEBEIAN:   'Plebeyo',
  ALCHEMIST:  'Alquimista',
  ROYAL_GUARD:'Guardia Real',
  OUTSIDER:   'Forastero',
}

export default function GameFinished({ gameState, myState, onPlayAgain }) {
  const winner = gameState?.winner
  const players = gameState?.players ?? []
  const myNickname = myState?.nickname

  const iWon =
    (winner === 'INNOCENTS' && myState?.role !== 'OUTSIDER') ||
    (winner === 'OUTSIDERS' && myState?.role === 'OUTSIDER')

  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="gf">
      <div className="gf__banner">
        <div className="gf__trophy">{winner === 'INNOCENTS' ? '👑' : '🗡'}</div>
        <h1 className="gf__winner-title">
          {winner === 'INNOCENTS' ? 'Los Inocentes Triunfan' : 'Los Forasteros Conquistan'}
        </h1>
        <p className={`gf__personal ${iWon ? 'text-success' : 'text-danger'}`}>
          {iWon ? '✨ ¡Has ganado!' : '✗ Has perdido esta partida'}
        </p>
      </div>

      <div className="gf__body">
        <section className="gf__scores card">
          <div className="section-title">Puntuaciones Finales</div>
          <ul className="gf__score-list">
            {sorted.map((p, i) => (
              <li key={p.nickname} className={`gf__score-row ${p.nickname === myNickname ? 'gf__score-row--me' : ''}`}>
                <span className="gf__rank">
                  {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="gf__pname">
                  {p.nickname}
                  {p.nickname === myNickname && <span className="text-dim"> (tú)</span>}
                </span>
                {!p.alive && <span className="text-dim gf__dead">✝</span>}
                <span className="gf__pts text-gold">{p.score} pts</span>
              </li>
            ))}
          </ul>
        </section>

        {myState && (
          <section className="gf__my-info card">
            <div className="section-title">Tu partida</div>
            <div className="gf__info-row">
              <span className="text-muted">Rol</span>
              <span className={`badge badge-${myState.role?.toLowerCase()?.replace('_', '')}`}>
                {ROLE_LABEL[myState.role] ?? myState.role}
              </span>
            </div>
            <div className="gf__info-row">
              <span className="text-muted">Tu palabra</span>
              <span className="text-gold">{myState.word ?? '—'}</span>
            </div>
            <div className="gf__info-row">
              <span className="text-muted">Puntuación</span>
              <span className="text-gold">{myState.score} pts</span>
            </div>
            <div className="gf__info-row">
              <span className="text-muted">Adivinó la palabra</span>
              <span>{myState.guessedCorrectly ? '✓ Sí' : '✗ No'}</span>
            </div>
          </section>
        )}
      </div>

      <div className="gf__actions">
        <button className="btn btn-gold btn-lg" onClick={onPlayAgain}>
          ⚔ Jugar de nuevo
        </button>
      </div>
    </div>
  )
}
