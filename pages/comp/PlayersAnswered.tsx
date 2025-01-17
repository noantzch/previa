'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Player = {
  id: number;
  name: string;
  answer: boolean | null;
};

export default function PlayersAnswered() {
  const [answeredPlayers, setAnsweredPlayers] = useState<Player[]>([]);
  const [unansweredPlayers, setUnansweredPlayers] = useState<Player[]>([]);
  const router = useRouter();
  
  // Obtener el game_id desde localStorage
  const playerData = localStorage.getItem('Player');
  let gameId = null;
  
  if (playerData) {
    const player = JSON.parse(playerData);
    gameId = player.game_id;
  } else {
    console.error("No se encontró ningún jugador en localStorage.");
    // Manejar el caso donde playerData es null
  }
  
  
  // Verificamos si game_id está disponible
  useEffect(() => {
    console.log('game_id from localStorage:', gameId); // Log para verificar el valor de game_id
  }, [gameId]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!gameId) {
        console.error('game_id is missing from localStorage');
        return;
      }

      try {
        console.log('Fetching players with game_id:', gameId); // Log para verificar la solicitud
        const response = await fetch(`/api/getPlayersAnswered?game_id=${gameId}`);
        const data = await response.json();

        if (response.ok) {
          console.log('Players fetched:', data.players); // Log para ver los jugadores obtenidos
          const players: Player[] = data.players;

          // Separar jugadores según si respondieron o no
          const answered = players.filter((player) => player.answer !== null);
          const unanswered = players.filter((player) => player.answer === null);

          setAnsweredPlayers(answered);
          setUnansweredPlayers(unanswered);

          // Si todos los jugadores no han respondido, hacer la solicitud a la API para actualizar el estado de la partida
          if (unanswered.length === players.length) {
            console.log('All players have not answered, updating game status...');
            await updateGameAnsweredStatus(gameId);
          }

          // Si todos los jugadores respondieron, redirigir a "/answer"
          if (unanswered.length === 0) {
            router.push('/answer');
          }
        } else {
          console.error('Error fetching players:', data.error);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    // Llamar a la API inicialmente y cada 2 segundos
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, [router, gameId]);

  // Función para actualizar el estado de la partida a 'answered = false'
  const updateGameAnsweredStatus = async (gameId: string) => {
    try {
      console.log('Sending request to set answered false for game_id:', gameId); // Log para verificar la solicitud
      const response = await fetch('/api/setAnsweredFalse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message); // Mensaje de éxito
      } else {
        console.error('Error updating game answered status:', data.error);
      }
    } catch (error) {
      console.error('Error calling setAnsweredFalse API:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4">
      {/* Lista de jugadores que respondieron */}
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-4">Jugadores que respondieron</h2>
        <ul className="border p-4 rounded bg-green-100">
          {answeredPlayers.length > 0 ? (
            answeredPlayers.map((player) => (
              <li key={player.id} className="py-2 border-b last:border-none">
                {player.name}
              </li>
            ))
          ) : (
            <p>No hay jugadores que hayan respondido todavía.</p>
          )}
        </ul>
      </div>

      {/* Lista de jugadores que no han respondido */}
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-4">Jugadores que no han respondido</h2>
        <ul className="border p-4 rounded bg-red-100">
          {unansweredPlayers.length > 0 ? (
            unansweredPlayers.map((player) => (
              <li key={player.id} className="py-2 border-b last:border-none">
                {player.name}
              </li>
            ))
          ) : (
            <p>Todos los jugadores han respondido.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
