'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Player = {
  id: number;
  name: string;
  admin: boolean;
  answer: boolean | null;
};

interface PlayerListProps {
  gameId: string;
}

interface Question {
  id: number;
  question: string;
  gamed: boolean; // Añadido para tu lógica
}

export default function PlayerList({ gameId }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPlayersAndCheckGame = async () => {
      console.log('Iniciando fetchPlayersAndCheckGame con gameId:', gameId);

      try {
        const gameIdNumber = parseInt(gameId, 10);
        console.log('gameIdNumber:', gameIdNumber);

        if (isNaN(gameIdNumber)) {
          console.error('gameId debe ser un número entero');
          return;
        }

        // Obtener jugadores
        const playersResponse = await fetch(`/api/getPlayersByGame?game_id=${gameIdNumber}`);
        console.log('Respuesta de jugadores:', playersResponse);

        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          console.log('Datos de jugadores obtenidos:', playersData);
          setPlayers(playersData.players);
        } else {
          console.error('No se pudo obtener a los jugadores');
        }

        // Verificar estado del juego
        console.log('Haciendo fetch a /api/game...');
        const gameResponse = await fetch(`/api/game?game_id=${gameIdNumber}`);
        console.log('Respuesta de estado del juego:', gameResponse);

        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          console.log('Estado del juego obtenido:', gameData);

          // Obtener el valor de "without_dbanswers" del localStorage
          const playerData = JSON.parse(localStorage.getItem('Player') || '{}');
          const withoutDbAnswers = playerData?.without_dbanswers;

          // Si el juego ha comenzado, obtener y almacenar las preguntas
          if (gameData.game.started) {
            console.log('El juego ha comenzado. Guardando preguntas en localStorage y redirigiendo...');

            // Obtener preguntas y almacenarlas en localStorage
            const questionsResponse = await fetch(`/api/getAllQuestions?game_id=${gameIdNumber}`);
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              // Mapeamos las preguntas usando el tipo `Question`
              const questionsWithGamed: Question[] = questionsData.questions.map((question: Question) => ({
                ...question,
                gamed: false, // Inicializamos gamed como false
              }));

              // Guardar las preguntas en localStorage
              localStorage.setItem('Questions', JSON.stringify(questionsWithGamed));
              console.log('Preguntas guardadas en localStorage');

              // Redirigir dependiendo del valor de "without_dbanswers"
              if (withoutDbAnswers === false) {
                router.push('/question');
              } else {
                router.push('/question2');
              }
            } else {
              console.error('No se pudieron obtener las preguntas');
            }
          } else {
            console.log('El juego aún no ha comenzado.');
          }
        } else {
          console.error('No se pudo obtener el estado del juego');
        }
      } catch (error) {
        console.error('Error obteniendo datos:', error);
      }
    };

    fetchPlayersAndCheckGame();
    const interval = setInterval(fetchPlayersAndCheckGame, 3000);

    return () => clearInterval(interval);
  }, [gameId, router]);

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
  );
}
