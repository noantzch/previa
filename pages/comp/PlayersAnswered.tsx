import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Player = {
  id: number;
  name: string;
  answer: boolean | null;
  answer_text?: string; // Agregado para el caso sin respuesta en DB
};

export default function PlayersAnswered() {
  const [answeredPlayers, setAnsweredPlayers] = useState<Player[]>([]);
  const [unansweredPlayers, setUnansweredPlayers] = useState<Player[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [withoutDbanswers, setWithoutDbanswers] = useState<boolean>(false); // Nuevo estado
  const router = useRouter();

  useEffect(() => {
    // Solo ejecuta esto en el cliente
    if (typeof window !== 'undefined') {
      const playerData = localStorage.getItem('Player');
      if (playerData) {
        const player = JSON.parse(playerData);
        setGameId(player.game_id);
        setWithoutDbanswers(player.without_dbanswers); // Obtener withoutDbanswers
      } else {
        console.error('No se encontró ningún jugador en localStorage.');
      }
    }
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!gameId) {
        console.error('game_id is missing');
        return;
      }

      try {
        const response = await fetch(`/api/getPlayersAnswered?game_id=${gameId}`);
        const data = await response.json();

        if (response.ok) {
          const players: Player[] = data.players;

          // Si withoutDbanswers es true, usamos answer_text en vez de answer
          const answered = players.filter((player) =>
            withoutDbanswers ? player.answer_text : player.answer !== null
          );
          const unanswered = players.filter((player) =>
            withoutDbanswers ? !player.answer_text : player.answer === null
          );

          setAnsweredPlayers(answered);
          setUnansweredPlayers(unanswered);

          if (unanswered.length === players.length) {
            await updateGameAnsweredStatus(gameId);
          }

          // Redirección condicional
          if (unanswered.length === 0) {
            if (withoutDbanswers) {
              router.push('/answerWDB'); // Redirigir a "/answerWDB" si withoutDbanswers es true
            } else {
              router.push('/answer'); // Redirigir a "/answer" si withoutDbanswers es false
            }
          }
        } else {
          console.error('Error fetching players:', data.error);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    if (gameId) {
      fetchPlayers();
      const interval = setInterval(fetchPlayers, 2000);
      return () => clearInterval(interval);
    }
  }, [router, gameId, withoutDbanswers]); // Agregado withoutDbanswers como dependencia

  const updateGameAnsweredStatus = async (gameId: string) => {
    try {
      const response = await fetch('/api/setAnsweredFalse', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error updating game answered status:', data.error);
      }
    } catch (error) {
      console.error('Error calling setAnsweredFalse API:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4">
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
