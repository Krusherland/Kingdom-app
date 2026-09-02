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
        <div className="landing__book-wrap">
          {/* Bookmark tabs */}
          <div className="landing__book-tabs">
            <button
              className={`landing__book-tab landing__book-tab--create${mode === 'create' ? ' is-active' : ''}`}
              onClick={() => { setMode(mode === 'create' ? 'home' : 'create'); setError('') }}
            >
              ✦ Crear Partida
            </button>
            <button
              className={`landing__book-tab landing__book-tab--join${mode === 'join' ? ' is-active' : ''}`}
              onClick={() => { setMode(mode === 'join' ? 'home' : 'join'); setError('') }}
            >
              ✦ Unirse
            </button>
            <button className="landing__book-tab landing__book-tab--stats" onClick={onShowStats}>
              ✦ Estadísticas
            </button>
          </div>

          <div className="landing__book">
            {/* Left page — content changes with active tab */}
            <div className="landing__book-page landing__book-page--left">
              <div className="landing__book-page-inner">
                {mode === 'home' && (
                  <>
                    {session?.nickname && (
                      <p className="landing__book-welcome">
                        Bienvenido de vuelta, <span>"{session.nickname}"</span>
                      </p>
                    )}
                    <p className="landing__book-ornament">— ✦ —</p>
                    <div className="landing__proclamation">
                      <p className="landing__proclamation-text">
                        Las calles del reino están siendo asechadas por un forastero con intenciones poco cordiales.
                      </p>
                      <p className="landing__proclamation-text">
                        Se te ha procurado una palabra. <span className="landing__proclamation-shout">NO LA DIFUNDAS;</span> en su lugar, sé lo más ambiguo que puedas al conversar con la gente, porque las calles también escuchan.
                      </p>
                    </div>
                  </>
                )}

                {mode === 'create' && (
                  <>
                    <h3 className="landing__book-heading">Nueva Partida</h3>
                    <p className="landing__book-ornament">— ✦ —</p>
                    <p className="landing__book-form-hint">Se requieren entre 6 y 8 jugadores para comenzar.</p>
                    <form className="landing__book-form" onSubmit={handleCreate}>
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
                      <button className="btn btn-gold" type="submit" disabled={!nickname.trim() || loading}>
                        {loading ? 'Creando…' : 'Crear Sala'}
                      </button>
                    </form>
                  </>
                )}

                {mode === 'join' && (
                  <>
                    <h3 className="landing__book-heading">Unirse al Reino</h3>
                    <p className="landing__book-ornament">— ✦ —</p>
                    <form className="landing__book-form" onSubmit={handleJoin}>
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
                      <label className="landing__label">Tu nombre en el reino</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="Ej: Ser Lancelot"
                        maxLength={20}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                      />
                      {error && <p className="landing__error text-danger">{error}</p>}
                      <button
                        className="btn btn-gold"
                        type="submit"
                        disabled={!nickname.trim() || !joinCode.trim() || loading}
                      >
                        {loading ? 'Entrando…' : 'Entrar al Reino'}
                      </button>
                    </form>
                  </>
                )}
              </div>
              <span className="landing__book-page-num">I</span>
            </div>

            {/* Spine */}
            <div className="landing__book-spine" />

            {/* Right page — Roles (always visible) */}
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
      </main>

      <footer className="landing__footer text-dim">
          Kingdom · 4–8 jugadores · 3 rondas
      </footer>
    </div>
  )
}
