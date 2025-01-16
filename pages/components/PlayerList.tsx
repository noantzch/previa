'use client'

import { useState, useEffect } from 'react'

type Player = {
  id: number
  name: string
  admin: boolean
  answer: boolean | null
}

export default function PlayerList({ gameId }: { gameId: string }) {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const gameIdNumber = parseInt(gameId, 10);
        if (isNaN(gameIdNumber)) {
          console.error('gameId debe ser un número entero');
          return;
        }

        const response = await fetch(`/api/getPlayersByGame?game_id=${gameIdNumber}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Datos obtenidos:', data)
          setPlayers(data.players)
        } else {
          console.error('No se pudo obtener a los jugadores')
        }
      } catch (error) {
        console.error('Error obteniendo jugadores:', error)
      }
    }

    fetchPlayers()
    const interval = setInterval(fetchPlayers, 5000)
    return () => clearInterval(interval)
  }, [gameId])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Jugadores</h2>
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between bg-gray-100 p-3 rounded"
          >
            <span>{player.name}</span>
            {player.admin && (
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                Admin
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}