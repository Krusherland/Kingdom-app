import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = `${import.meta.env.VITE_API_URL}/ws`

export function useWebSocket({ gameCode, sessionToken, onGameEvent, onDrawingStroke, enabled = true }) {
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const onGameEventRef = useRef(onGameEvent)
  const onDrawingStrokeRef = useRef(onDrawingStroke)
  onGameEventRef.current = onGameEvent
  onDrawingStrokeRef.current = onDrawingStroke

  useEffect(() => {
    if (!enabled || !gameCode) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/game/${gameCode}`, (msg) => {
          try { onGameEventRef.current?.(JSON.parse(msg.body)) } catch (_) { /* ignore malformed */ }
        })
        client.subscribe(`/topic/game/${gameCode}/drawing`, (msg) => {
          try { onDrawingStrokeRef.current?.(JSON.parse(msg.body)) } catch (_) { /* ignore malformed */ }
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [gameCode, enabled])

  const sendStroke = useCallback(
    (stroke) => {
      if (!clientRef.current?.connected) return
      clientRef.current.publish({
        destination: `/app/game/${gameCode}/draw`,
        body: JSON.stringify({ ...stroke, sessionToken }),
      })
    },
    [gameCode, sessionToken]
  )

  const sendDoneDrawing = useCallback(() => {
    if (!clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/game/${gameCode}/done-drawing`,
      body: JSON.stringify({ sessionToken }),
    })
  }, [gameCode, sessionToken])

  return { connected, sendStroke, sendDoneDrawing }
}
