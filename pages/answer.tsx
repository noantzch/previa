'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Importamos useRouter para hacer la redirección
import SiguientePregunta from './components/NextQuestion';

type Player = {
  id: number;
  name: string;
  answer: boolean | null;
};

export default function Answers() {
  const [correctPlayers, setCorrectPlayers] = useState<Player[]>([]);
  const [incorrectPlayers, setIncorrectPlayers] = useState<Player[]>([]);
  const router = useRouter(); // Hook de enrutamiento para redirigir

  const fetchPlayers = async (gameId: number) => {
    try {
      const response = await fetch(`/api/getPlayersAnswered?game_id=${gameId}`);
      const data = await response.json();

      if (response.ok) {
        const players: Player[] = data.players;

        // Dividir jugadores según la respuesta
        const correct = players.filter((player) => player.answer === true);
        const incorrect = players.filter((player) => player.answer === false);

        setCorrectPlayers(correct);
        setIncorrectPlayers(incorrect);
      } else {
        console.error('Error fetching players:', data.error);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchGameStatus = async (gameId: number) => {
    try {
      const response = await fetch(`/api/game?game_id=${gameId}`);
      const data = await response.json();

      if (response.ok && data.game.answered) {
        // Redirigir a /question si answered es true
        router.push('/question');
      }
    } catch (error) {
      console.error('Error fetching game status:', error);
    }
  };

  useEffect(() => {
    const playerData = localStorage.getItem('Player');
    let gameId = null;

    if (playerData) {
      const player = JSON.parse(playerData);
      gameId = player.game_id;
    } else {
      console.error("No se encontró ningún jugador en localStorage.");
    }

    if (gameId) {
      fetchPlayers(gameId);

      // Verificar el estado del juego cada 2 segundos
      const intervalId = setInterval(() => {
        fetchGameStatus(gameId);
      }, 2000);

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(intervalId);
    }
  }, []); // Solo se ejecuta una vez, ya que no hay dependencias

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Respuestas de los Jugadores</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-red-100">❌ Toma un Trago</th>
            <th className="border border-gray-300 p-2 bg-green-100">✔️ Regala un Trago</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 align-top">
              {incorrectPlayers.length > 0 ? (
                <ul>
                  {incorrectPlayers.map((player) => (
                    <li key={player.id} className="border-b py-2">
                      ❌ {player.name} +1🍺
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay jugadores con respuestas incorrectas.</p>
              )}
            </td>
            <td className="border border-gray-300 p-2 align-top">
              {correctPlayers.length > 0 ? (
                <ul>
                  {correctPlayers.map((player) => (
                    <li key={player.id} className="border-b py-2">
                      ✔️ {player.name} 🎁
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay jugadores con respuestas correctas.</p>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <SiguientePregunta />
    </div>
  );
}
