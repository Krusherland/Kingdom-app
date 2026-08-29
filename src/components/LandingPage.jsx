import { useState } from 'react'
import { api } from '../api'
import logo from '../assets/Kingdom-logo-no-bg.png'
import plebeianImg from '../assets/Plebeian.png'
import alchemistImg from '../assets/Alchemist.png'
import guardImg from '../assets/Royal-Guard.png'
import outsiderImg from '../assets/Outsider.png'
import './LandingPage.css'

const ROLES = [
  {
    key: 'plebeian',
    label: 'Plebeyo',
    badgeClass: 'badge-plebeian',
    img: plebeianImg,
    ability: 'Vota cada noche para eliminar a un sospechoso.',
    desc: 'Un ciudadano leal del reino. Trabaja junto a los inocentes para descubrir al Forastero antes de que sea demasiado tarde.',
    color: 'var(--role-plebeian)',
  },
  {
    key: 'alchemist',
    label: 'Alquimista',
    badgeClass: 'badge-alchemist',
    img: alchemistImg,
    ability: 'Protege a un jugador del peligro cada noche.',
    desc: 'Sabio de las artes arcanas. Cada noche puede ungir a un jugador con su elixir protector, salvándolo de la eliminación.',
    color: 'var(--role-alchemist)',
  },
  {
    key: 'guard',
    label: 'Guardia Real',
    badgeClass: 'badge-guard',
    img: guardImg,
    ability: 'Revela en secreto la identidad de un jugador.',
    desc: 'Protector de la corona. En las sombras puede revelar el verdadero rol de cualquier sospechoso del reino.',
    color: 'var(--role-guard)',
  },
  {
    key: 'outsider',
    label: 'Forastero',
    badgeClass: 'badge-outsider',
    img: outsiderImg,
    ability: 'Elimina inocentes y mantén tu disfraz oculto.',
    desc: 'Un infiltrado sin nombre ni pasado. Su objetivo: eliminar a los inocentes en la oscuridad sin ser descubierto.',
    color: 'var(--role-outsider)',
  },
]

export default function LandingPage({ session, onAuth, onShowStats }) {
  const [mode, setMode] = useState('home')   // 'home' | 'create' | 'join'
  const [nickname, setNickname] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.createGame(nickname.trim())
      onAuth(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!nickname.trim() || !joinCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.joinGame(joinCode.trim().toUpperCase(), nickname.trim())
      onAuth(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      <header className="landing__header">
        <img src={logo} alt="Kingdom" className="landing__logo" />
        <p className="landing__subtitle">El juego de las identidades ocultas</p>
      </header>

      <main className="landing__main">
        {mode === 'home' && (
          <div className="landing__home">
            <div className="landing__actions">
              <button className="btn btn-gold btn-lg" onClick={() => setMode('create')}>
                ✦ Crear Partida
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => setMode('join')}>
                ✦ Unirse a Partida
              </button>
              <button className="btn btn-ghost" onClick={onShowStats}>
                ✦ Ver Estadísticas
              </button>
            </div>

            {session?.nickname && (
              <p className="landing__returning text-muted">
                Bienvenido de vuelta, <span className="text-gold">{session.nickname}</span>
              </p>
            )}

            <div className="landing__content">
              <div className="landing__rules card">
                <h3>¿Cómo se juega?</h3>
                <div className="divider" />

                <div className="landing__phases">
                  <div className="landing__phase">
                    <span className="landing__phase-icon">🎨</span>
                    <div className="landing__phase-body">
                      <h4 className="landing__phase-title">Ronda de Dibujo</h4>
                      <p className="landing__phase-desc">
                        Cada jugador dibuja su palabra asignada. Los inocentes comparten la misma; el Forastero tiene una diferente.
                      </p>
                    </div>
                  </div>

                  <div className="landing__phase">
                    <span className="landing__phase-icon">🌑</span>
                    <div className="landing__phase-body">
                      <h4 className="landing__phase-title">La Noche</h4>
                      <p className="landing__phase-desc">
                        Los roles actúan en secreto. El Forastero elimina, el Alquimista protege y vota, la Guardia revela y vota, y los Plebeyos votan para expulsar al sospechoso.
                      </p>
                    </div>
                  </div>

                  <div className="landing__phase landing__phase--final">
                    <span className="landing__phase-icon">⚖</span>
                    <div className="landing__phase-body">
                      <h4 className="landing__phase-title">
                        Fase Final
                        <span className="landing__phase-timer">30s</span>
                      </h4>
                      <p className="landing__phase-desc">
                        Los <strong>Inocentes</strong> votan para eliminar al sospechoso.
                        El <strong>Forastero</strong> intenta adivinar la palabra inocente para escapar.
                        Quien actúe mejor, gana el Reino.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="landing__roles-panel card">
                <h3 className="landing__roles-title">Los Roles</h3>
                <div className="divider" />

                <div className="landing__role-grid">
                  {ROLES.map(role => (
                    <div
                      key={role.key}
                      className="landing__role-card"
                      style={{ '--rc': role.color }}
                      title={role.desc}
                    >
                      <img src={role.img} alt={role.label} className="landing__role-card-img" />
                      <span className={`badge ${role.badgeClass} landing__role-card-badge`}>
                        {role.label}
                      </span>
                      <p className="landing__role-card-ability">{role.ability}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="landing__form-wrap">
            <h2>Nueva Partida</h2>
            <p className="text-muted">Se requieren entre 6 y 8 jugadores para comenzar.</p>
            <form className="landing__form card" onSubmit={handleCreate}>
              <label className="landing__label">Tu nombre en el reino</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Lord Arturo"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoFocus
              />
              {error && <p className="landing__error text-danger">{error}</p>}
              <div className="landing__form-btns">
                <button className="btn btn-ghost" type="button" onClick={() => { setMode('home'); setError('') }}>
                  ← Volver
                </button>
                <button className="btn btn-gold" type="submit" disabled={!nickname.trim() || loading}>
                  {loading ? 'Creando…' : 'Crear Sala'}
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === 'join' && (
          <div className="landing__form-wrap">
            <h2>Unirse al Reino</h2>
            <form className="landing__form card" onSubmit={handleJoin}>
              <label className="landing__label">Código de partida</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: ABCD1234"
                maxLength={8}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                autoFocus
              />
              <label className="landing__label" style={{ marginTop: '1rem' }}>Tu nombre en el reino</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Ser Lancelot"
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              {error && <p className="landing__error text-danger">{error}</p>}
              <div className="landing__form-btns">
                <button className="btn btn-ghost" type="button" onClick={() => { setMode('home'); setError('') }}>
                  ← Volver
                </button>
                <button
                  className="btn btn-gold"
                  type="submit"
                  disabled={!nickname.trim() || !joinCode.trim() || loading}
                >
                  {loading ? 'Entrando…' : 'Entrar al Reino'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="landing__footer text-dim">
        Kingdom · 6–8 jugadores · 3 rondas
      </footer>
    </div>
  )
}
