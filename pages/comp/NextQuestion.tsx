'use client';

import React, { useEffect, useState } from 'react';

export default function SiguientePregunta() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Obtener el jugador desde localStorage
    const player = JSON.parse(localStorage.getItem('Player') || '{}');

    // Verificar si el jugador es admin
    if (player?.admin) {
      setIsAdmin(true);
    }
  }, []);

  const handleSiguientePregunta = async () => {
    // Obtener el game_id desde el localStorage
    const player = JSON.parse(localStorage.getItem('Player') || '{}');
    const gameId = player?.game_id;

    if (!gameId) {
      console.error("No game_id found in localStorage");
      return;
    }

    try {
      // Llamar a la API para poner las respuestas a null
      const resetResponse = await fetch('/api/setAnswersToNull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId }),
      });

      const resetData = await resetResponse.json();

      if (resetResponse.ok) {
        console.log(resetData.message);

        // Llamar a la API para marcar el juego como respondido (answered = true)
        const answeredResponse = await fetch('/api/setAnswered', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ game_id: gameId }),
        });

        const answeredData = await answeredResponse.json();

        if (answeredResponse.ok) {
          console.log(answeredData.message);
        } else {
          console.error(answeredData.error);
        }
      } else {
        console.error(resetData.error);
      }
    } catch (error) {
      console.error('Error resetting player answers:', error);
    }
  };

  if (!isAdmin) {
    // Si no es admin, no renderizamos el componente
    return null;
  }

  return (
    <div className="flex justify-center items-center py-4">
      <button
        onClick={handleSiguientePregunta}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Siguiente Pregunta
      </button>
    </div>
  );
}
