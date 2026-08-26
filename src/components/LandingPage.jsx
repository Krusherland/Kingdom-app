import { useState } from 'react'
import { api } from '../api'
import logo from '../assets/kingdom-logo2.png'
import './LandingPage.css'

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
        <img src={logo} alt="Kingdom" className="landing__crown" />
        <h1 className="landing__title">Kingdom</h1>
        <p className="landing__subtitle">El juego de las identidades ocultas</p>
      </header>

      <main className="landing__main">
        {mode === 'home' && (
          <div className="landing__home">
            <div className="landing__rules card">
              <h3>¿Cómo se juega?</h3>
              <div className="divider" />
              <ul className="landing__rules-list">
                <li>🎨 <strong>Dibuja</strong> tu palabra asignada cada ronda.</li>
                <li>🌑 <strong>Actúa en la noche</strong> según tu rol secreto.</li>
                <li>🔍 Los <strong>Inocentes</strong> deben exponer a los Forasteros.</li>
                <li>🗡 Los <strong>Forasteros</strong> deben eliminar a todos los inocentes.</li>
                <li>📜 Tras 3 rondas, <strong>descifra la palabra</strong> para ganar puntos.</li>
              </ul>
              <div className="divider" />
              <div className="landing__roles">
                <span className="badge badge-plebeian">Plebeyo</span>
                <span className="badge badge-alchemist">Alquimista</span>
                <span className="badge badge-guard">Guardia Real</span>
                <span className="badge badge-outsider">Forastero</span>
              </div>
            </div>

            <div className="landing__actions">
              <button className="btn btn-gold btn-lg" onClick={() => setMode('create')}>
                ⚔ Crear Partida
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => setMode('join')}>
                🚪 Unirse a Partida
              </button>
              <button className="btn btn-ghost" onClick={onShowStats}>
                📜 Ver Estadísticas
              </button>
            </div>

            {session?.nickname && (
              <p className="landing__returning text-muted">
                Bienvenido de vuelta, <span className="text-gold">{session.nickname}</span>
              </p>
            )}
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
