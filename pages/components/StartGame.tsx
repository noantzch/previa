'use client'

import { useState } from 'react'

export default function StartGame() {
  const [isStarting, setIsStarting] = useState(false)

  const handleStartGame = async () => {
    setIsStarting(true)
    try {
      const response = await fetch('/api/startGame', {
        method: 'POST',
      })
      if (response.ok) {
        console.log('El Juego inicio Correctamente')
      } else {
        console.error('No se pudo iniciar el juego...')
      }
    } catch (error) {
      console.error('Error al iniciar juego:', error)
    }
    setIsStarting(false)
  }

  return (
    <div className="mt-8">
      <button
        onClick={handleStartGame}
        disabled={isStarting}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {isStarting ? 'Iniciando...' : 'Iniciar Juego'}
      </button>
    </div>
  )
}

