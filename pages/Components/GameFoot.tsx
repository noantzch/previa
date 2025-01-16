'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GameFoot() {
  const [gameStarted, setGameStarted] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Obtener el objeto player del localStorage
    const player = JSON.parse(localStorage.getItem('Player') || '{}');
    const gameId = player?.game_id;
    const admin = player?.admin;

    // Verificar si hay un game_id y si el jugador es admin
    if (!gameId || admin !== true) {
      return; // No mostrar el componente si no hay game_id o si no es admin
    }

    // Establecer el estado de admin
    setIsAdmin(admin);

    const fetchGameStatus = async () => {
      try {
        const response = await fetch(`/api/game?game_id=${gameId}`);
        const data = await response.json();

        if (response.ok) {
          setGameStarted(data.game.started);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
  }, []);

  const toggleGameStatus = async () => {
    const player = JSON.parse(localStorage.getItem('Player') || '{}');
    const gameId = player?.game_id;

    if (!gameId) {
      console.error("No game_id found in localStorage for toggle");
      return;
    }

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId }),
      });
      const data = await response.json();

      if (response.ok) {
        setGameStarted(data.game.started);

        // Redirigir dependiendo del estado del juego
        if (!data.game.started) {
          // Finalizar el juego
          await fetch('/api/endGame', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ game_id: gameId }),
          });

          // Eliminar Player del localStorage al finalizar el juego
          localStorage.removeItem('Player');

          router.push('/'); // Redirigir al índice al finalizar el juego
        } else {
          router.push('/question'); // Redirigir a /question al iniciar el juego
        }
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error toggling game status:', error);
    }
  };

  // Si no hay game_id o no es admin, no mostrar el componente
  if (!isAdmin || gameStarted === null) return null;

  return (
    <div className="flex justify-center items-center py-4">
      {gameStarted ? (
        <button
          onClick={toggleGameStatus}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          FINALIZAR JUEGO
        </button>
      ) : (
        <button
          onClick={toggleGameStatus}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          INICIAR JUEGO
        </button>
      )}
    </div>
  );
}
