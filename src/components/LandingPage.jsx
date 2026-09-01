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
    ability: 'Cada noche, junto a los demás leales, emites tu voto para expulsar al sospechoso.',
    desc: 'Hombre del pueblo, leal a su reino y a sus vecinos.',
    color: 'var(--role-plebeian)',
  },
  {
    key: 'alchemist',
    label: 'Alquimista',
    badgeClass: 'badge-alchemist',
    img: alchemistImg,
    ability: 'Cada noche unges a un jugador con tu elixir protector, salvándolo de ser eliminado.',
    desc: 'En su taller colmado de redomas y pergaminos cifrados, el Alquimista teje defensas invisibles.',
    color: 'var(--role-alchemist)',
  },
  {
    key: 'guard',
    label: 'Guardia Real',
    badgeClass: 'badge-guard',
    img: guardImg,
    ability: 'Cada noche investigas en secreto la verdadera identidad de un jugador.',
    desc: 'Jura lealtad a la corona y a nadie más. La Guardia Real opera en silencio, infiltrándose entre los sospechosos para arrancarles su secreto.',
    color: 'var(--role-guard)',
  },
  {
    key: 'outsider',
    label: 'Forastero',
    badgeClass: 'badge-outsider',
    img: outsiderImg,
    ability: 'Cada noche eliminas a un inocente. Al final, adivina la palabra correcta para escapar.',
    desc: 'No tiene nombre. No tiene historia. Solo tiene un objetivo: infiltrarse entre los leales y desmantelarlos desde dentro.',
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

            <div className="landing__book">
              {/* Left page — Rules */}
              <div className="landing__book-page landing__book-page--left">
                <div className="landing__book-page-inner">
                  <h3 className="landing__book-heading">¿Cómo se juega?</h3>
                  <p className="landing__book-ornament">— ✦ —</p>
                  <div className="landing__phases">
                    <div className="landing__phase">
                      <div className="landing__phase-body">
                        <h4 className="landing__phase-title">Ronda de Dibujo</h4>
                        <p className="landing__phase-desc">
                          Cada jugador dibuja su palabra asignada. Los inocentes comparten la misma; el Forastero tiene una diferente.
                        </p>
                      </div>
                    </div>
                    <div className="landing__phase">
                      <div className="landing__phase-body">
                        <h4 className="landing__phase-title">La Noche</h4>
                        <p className="landing__phase-desc">
                          Los roles actúan en secreto. El Forastero elimina, el Alquimista protege y vota, la Guardia revela y vota, y los Plebeyos votan para expulsar al sospechoso.
                        </p>
                      </div>
                    </div>
                    <div className="landing__phase landing__phase--final">
                      <div className="landing__phase-body">
                        <h4 className="landing__phase-title">
                          Fase Final
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
                <span className="landing__book-page-num">I</span>
              </div>

              {/* Spine */}
              <div className="landing__book-spine" />

              {/* Right page — Roles */}
              <div className="landing__book-page landing__book-page--right">
                <div className="landing__book-page-inner">
                  <h3 className="landing__book-heading">Los Roles</h3>
                  <p className="landing__book-ornament">— ✦ —</p>
                  <div className="landing__role-grid">
                    {ROLES.map(role => (
                      <div key={role.key} className="landing__role-card" style={{ '--rc': role.color }}>
                        <img src={role.img} alt={role.label} className="landing__role-card-img" />
                        <div className="landing__role-card-overlay">
                          <span className={`badge ${role.badgeClass}`}>{role.label}</span>
                          <p className="landing__role-card-ability">{role.ability}</p>
                          <p className="landing__role-card-desc">{role.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="landing__book-page-num">II</span>
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
