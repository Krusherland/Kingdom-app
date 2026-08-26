import { useState, useEffect } from 'react'
import { api } from '../api'
import './StatsPanel.css'

const ROLE_LABEL = {
  PLEBEIAN:    'Plebeyo',
  ALCHEMIST:   'Alquimista',
  ROYAL_GUARD: 'Guardia Real',
  OUTSIDER:    'Forastero',
}

export default function StatsPanel({ session, onBack }) {
  const [myStats, setMyStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [tab, setTab] = useState('personal')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const lb = await api.getLeaderboard(20)
        setLeaderboard(lb)
      } catch (_) {}

      if (session?.token) {
        try {
          const s = await api.getMyStats(session.token)
          setMyStats(s)
        } catch (_) {}
      }
      setLoading(false)
    }
    load()
  }, [session?.token])

  return (
    <div className="stats">
      <header className="stats__header">
        <button className="btn btn-ghost btn-sm stats__back" onClick={onBack}>
          ← Volver
        </button>
        <div className="stats__crown">📜</div>
        <h2>Crónicas del Reino</h2>
      </header>

      <div className="stats__tabs">
        {session?.token && (
          <button
            className={`stats__tab ${tab === 'personal' ? 'stats__tab--active' : ''}`}
            onClick={() => setTab('personal')}
          >
            Mi Historia
          </button>
        )}
        <button
          className={`stats__tab ${tab === 'leaderboard' ? 'stats__tab--active' : ''}`}
          onClick={() => setTab('leaderboard')}
        >
          Tabla de Honor
        </button>
      </div>

      <div className="stats__body">
        {loading && (
          <p className="text-muted stats__loading">Consultando los registros del reino…</p>
        )}

        {!loading && tab === 'personal' && (
          <>
            {!myStats && (
              <div className="stats__no-data card">
                <p className="text-muted">
                  No hay estadísticas disponibles. Juega una partida para comenzar tu legado.
                </p>
              </div>
            )}
            {myStats && (
              <div className="stats__personal">
                <div className="card stats__overview">
                  <div className="section-title">Resumen de {myStats.nickname}</div>
                  <div className="stats__grid">
                    <div className="stats__stat">
                      <span className="stats__val text-gold">{myStats.gamesPlayed}</span>
                      <span className="stats__label">Partidas</span>
                    </div>
                    <div className="stats__stat">
                      <span className="stats__val text-gold">{myStats.gamesWon}</span>
                      <span className="stats__label">Victorias</span>
                    </div>
                    <div className="stats__stat">
                      <span className="stats__val text-gold">{(myStats.winRate * 100).toFixed(0)}%</span>
                      <span className="stats__label">Win Rate</span>
                    </div>
                  </div>
                </div>

                <div className="card stats__roles">
                  <div className="section-title">Veces por Rol</div>
                  {[
                    { key: 'timesAsPlebeian',   role: 'PLEBEIAN' },
                    { key: 'timesAsAlchemist',  role: 'ALCHEMIST' },
                    { key: 'timesAsRoyalGuard', role: 'ROYAL_GUARD' },
                    { key: 'timesAsOutsider',   role: 'OUTSIDER' },
                  ].map(({ key, role }) => {
                    const count = myStats[key] ?? 0
                    const pct = myStats.gamesPlayed > 0 ? count / myStats.gamesPlayed : 0
                    const badgeClass = `badge-${role.toLowerCase().replace('_', '')}`
                    return (
                      <div key={role} className="stats__role-row">
                        <span className={`badge ${badgeClass}`}>{ROLE_LABEL[role]}</span>
                        <div className="stats__role-bar-wrap">
                          <div
                            className="stats__role-bar"
                            style={{ width: `${pct * 100}%` }}
                            data-role={role.toLowerCase()}
                          />
                        </div>
                        <span className="stats__role-count text-muted">{count}x</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && tab === 'leaderboard' && (
          <div className="card stats__leaderboard">
            <div className="section-title">Los más honorables</div>
            {leaderboard.length === 0 ? (
              <p className="text-muted">Aún no hay registros en la tabla de honor.</p>
            ) : (
              <table className="stats__lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Victorias</th>
                    <th>Partidas</th>
                    <th>Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((e) => (
                    <tr
                      key={e.nickname}
                      className={e.nickname === session?.nickname ? 'stats__lb-me' : ''}
                    >
                      <td className="text-dim">
                        {e.rank === 1 ? '🏆' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : e.rank}
                      </td>
                      <td>{e.nickname}</td>
                      <td className="text-gold">{e.gamesWon}</td>
                      <td className="text-muted">{e.gamesPlayed}</td>
                      <td className="text-muted">{(e.winRate * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
