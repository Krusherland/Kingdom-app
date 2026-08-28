import { useState, useCallback, useEffect } from 'react'
import { api } from './api'
import { usePolling } from './hooks/usePolling'
import { useWebSocket } from './hooks/useWebSocket'
import LandingPage from './components/LandingPage'
import GameLobby from './components/GameLobby'
import DrawingPhase from './components/DrawingPhase'
import NightPhase from './components/NightPhase'
import WordGuessPhase from './components/WordGuessPhase'
import GameFinished from './components/GameFinished'
import StatsPanel from './components/StatsPanel'
import './App.css'

const SESSION_KEY = 'kingdom_session'

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) ?? null }
  catch { return null }
}

export default function App() {
  const [session, setSession] = useState(loadSession)
  const [view, setView] = useState('landing')
  const [gameState, setGameState] = useState(null)
  const [myState, setMyState] = useState(null)
  const [nightResult, setNightResult] = useState(null)
  const [lastStroke, setLastStroke] = useState(null)
  const [roleCardDismissed, setRoleCardDismissed] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const inGame = view === 'game' && !!session?.gameCode

  // ── State fetchers ──────────────────────────────────────────────
  const fetchGameState = useCallback(async () => {
    if (!session?.gameCode) return
    try {
      const s = await api.getState(session.gameCode)
      setGameState(s)
    } catch (_) {}
  }, [session?.gameCode])

  const fetchMyState = useCallback(async () => {
    if (!session?.gameCode || !session?.token) return
    try {
      const s = await api.getMyState(session.gameCode, session.token)
      setMyState(s)
    } catch (_) {}
  }, [session?.gameCode, session?.token])

  // ── Polling ─────────────────────────────────────────────────────
  usePolling(fetchGameState, 4000, inGame)
  usePolling(fetchMyState, 3000, inGame)

  // ── WebSocket event handler ──────────────────────────────────────
  const handleGameEvent = useCallback((event) => {
    const { type, payload } = event
    switch (type) {
      case 'GAME_STARTED':
        setGameState(payload)
        setRoleCardDismissed(false)
        fetchMyState()
        break
      case 'PLAYER_JOINED':
      case 'PLAYER_LEFT':
        fetchGameState()
        break
      case 'DRAWER_CHANGED':
        // payload is just the new drawer's nickname string
        setGameState(prev => prev ? { ...prev, currentDrawerNickname: payload } : null)
        setLastStroke(null)
        break
      case 'NIGHT_STARTED':
        setGameState(payload)
        setNightResult(null)
        fetchMyState()
        break
      case 'NIGHT_ACTOR_CHANGED':
        setGameState(payload)
        break
      case 'NIGHT_RESULT':
        setNightResult(payload)
        fetchMyState()
        break
      case 'WORD_GUESS_PHASE':
        setGameState(payload)
        setNightResult(null)
        fetchMyState()
        break
      case 'GAME_FINISHED':
        setGameState(payload)
        fetchMyState()
        break
      default: break
    }
  }, [fetchGameState, fetchMyState])

  const { connected, sendStroke, sendDoneDrawing } = useWebSocket({
    gameCode: session?.gameCode,
    sessionToken: session?.token,
    onGameEvent: handleGameEvent,
    onDrawingStroke: setLastStroke,
    enabled: inGame,
  })

  // ── Actions ──────────────────────────────────────────────────────
  const handleAuth = useCallback((authResponse) => {
    const sess = {
      token: authResponse.sessionToken,
      nickname: authResponse.nickname,
      gameCode: authResponse.gameCode,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
    setSession(sess)
    setGameState(null)
    setMyState(null)
    setNightResult(null)
    setLastStroke(null)
    setRoleCardDismissed(false)
    setView('game')
  }, [])

  const handleStart = useCallback(async (opts) => {
    try { await api.startGame(session.gameCode, session.token, opts) }
    catch (e) { alert(e.message) }
  }, [session])

  const handleAction = useCallback(async (actionType, targetNickname) => {
    try {
      await api.submitAction(session.gameCode, session.token, actionType, targetNickname)
      fetchMyState()
    } catch (e) { alert(e.message) }
  }, [session, fetchMyState])

  const handleGuess = useCallback(async (word) => {
    try {
      const result = await api.submitGuess(session.gameCode, session.token, word)
      fetchMyState()
      return result.correct
    } catch (e) {
      alert(e.message)
      return false
    }
  }, [session, fetchMyState])

  const handleLeaveGame = useCallback(async () => {
    if (session?.gameCode && session?.token) {
      try { await api.leaveGame(session.gameCode, session.token) } catch (_) {}
    }
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setGameState(null)
    setMyState(null)
    setNightResult(null)
    setView('landing')
  }, [session])

  // ── Resume a stored game on first load ───────────────────────────
  useEffect(() => {
    if (session?.gameCode && view === 'landing') {
      fetchGameState().then(() => setView('game'))
    }
  // only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ───────────────────────────────────────────────────────
  if (view === 'stats') {
    return <StatsPanel session={session} onBack={() => setView('landing')} />
  }

  if (view === 'landing') {
    return (
      <LandingPage
        session={session}
        onAuth={handleAuth}
        onShowStats={() => setView('stats')}
      />
    )
  }

  const status = gameState?.status

  return (
    <div>
      {nightResult && (
        <NightResultOverlay result={nightResult} onDismiss={() => setNightResult(null)} />
      )}

      {!status && (
        <div className="app-loading">
          <span>Entering the Kingdom…</span>
          <div className="app-loading__dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {status === 'LOBBY' && (
        <GameLobby
          session={session}
          gameState={gameState}
          onStart={handleStart}
          onLeave={handleLeaveGame}
        />
      )}
      {(status === 'DRAWING' || status === 'NIGHT' || status === 'WORD_GUESS') && (
        <button
          className="btn btn-ghost exit-game-btn"
          onClick={() => setShowExitModal(true)}
        >
          🚪 Salir
        </button>
      )}

      {showExitModal && (
        <div className="exit-modal-backdrop" onClick={() => setShowExitModal(false)}>
          <div className="exit-modal" onClick={e => e.stopPropagation()}>
            <h3 className="exit-modal__title">¿Abandonar la partida?</h3>
            <p className="exit-modal__body">Serás expulsado del reino. La partida continuará sin ti.</p>
            <div className="exit-modal__actions">
              <button className="btn btn-ghost" onClick={() => setShowExitModal(false)}>Quedarse</button>
              <button className="btn btn-danger" onClick={() => { setShowExitModal(false); handleLeaveGame() }}>Abandonar</button>
            </div>
          </div>
        </div>
      )}

      {status === 'DRAWING' && (
        <DrawingPhase
          session={session}
          gameState={gameState}
          myState={myState}
          lastStroke={lastStroke}
          sendStroke={sendStroke}
          sendDoneDrawing={sendDoneDrawing}
          showRoleCard={!roleCardDismissed}
          onRoleCardDismiss={() => setRoleCardDismissed(true)}
        />
      )}
      {status === 'NIGHT' && (
        <NightPhase
          session={session}
          gameState={gameState}
          myState={myState}
          onAction={handleAction}
        />
      )}
      {status === 'WORD_GUESS' && (
        <WordGuessPhase
          session={session}
          gameState={gameState}
          myState={myState}
          onGuess={handleGuess}
        />
      )}
      {status === 'FINISHED' && (
        <GameFinished
          gameState={gameState}
          myState={myState}
          onPlayAgain={handleLeaveGame}
        />
      )}

      <div className={`ws-indicator ${connected ? 'ws-indicator--connected' : ''}`}>
        <div className="ws-indicator__dot" />
        {connected ? 'Connected' : 'Reconnecting…'}
      </div>
    </div>
  )
}

function NightResultOverlay({ result, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="overlay-backdrop" onClick={onDismiss}>
      <div className="card night-result-card" onClick={(e) => e.stopPropagation()}>
        <h2>🌑 La Noche Termina</h2>
        <div className="divider" />
        {result.eliminated.length === 0 ? (
          <p>Nadie fue eliminado esta noche.</p>
        ) : (
          <>
            <p className="text-muted">Han caído esta noche:</p>
            <ul>
              {result.eliminated.map((n) => (
                <li key={n} className="eliminated">⚔ {n}</li>
              ))}
            </ul>
          </>
        )}
        {result.shieldUsed && (
          <p className="shield-msg">⚗ Un alquimista protegió a alguien del peligro.</p>
        )}
        <p className="next-phase">Siguiente fase: {result.nextPhase}</p>
        <button className="btn btn-gold" onClick={onDismiss}>Continuar</button>
      </div>
    </div>
  )
}

