'use client'

import { useState } from 'react'

export default function PlayerRegistration() {
  const [name, setName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/registerPlayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, admin: isAdmin }),
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Jugador Registrado:', data)
        setName('')
        setIsAdmin(false)
      } else {
        console.error('Error al registrar jugador')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Registrar Jugador</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">
            Nombre:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="mr-2"
            />
            Registrar como ADMIN
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Registrar
        </button>
      </form>
    </div>
  )
}

