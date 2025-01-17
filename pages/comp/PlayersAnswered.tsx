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
  const [gameId, setGameId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Solo ejecuta esto en el cliente
    if (typeof window !== 'undefined') {
      const playerData = localStorage.getItem('Player');
      if (playerData) {
        const player = JSON.parse(playerData);
        setGameId(player.game_id);
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
          const answered = players.filter((player) => player.answer !== null);
          const unanswered = players.filter((player) => player.answer === null);

          setAnsweredPlayers(answered);
          setUnansweredPlayers(unanswered);

          if (unanswered.length === players.length) {
            await updateGameAnsweredStatus(gameId);
          }

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

    if (gameId) {
      fetchPlayers();
      const interval = setInterval(fetchPlayers, 2000);
      return () => clearInterval(interval);
    }
  }, [router, gameId]);

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
