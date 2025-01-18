'use client';

import React, { useEffect, useState } from 'react';

type Question = {
  id: number;
  question_text: string;
  question_answer_id: number;
  answer_id: number;
  is_correct: boolean;
  answer_text: string;
  image_url: string | null;
  gamed: boolean; // Se agrega este campo
};

export default function GameFoot() {
  const [gameStarted, setGameStarted] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

          // Llamar a la función para obtener preguntas y guardarlas en localStorage
          await fetchAndStoreQuestions(gameId);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching game status:', error);
      }
    };

    fetchGameStatus();
  }, []);

  // Función para obtener preguntas y guardarlas en localStorage con el parámetro "gamed": false
  const fetchAndStoreQuestions = async (gameId: number) => {
    // Verificar si las preguntas ya están almacenadas en localStorage
    const storedQuestions = localStorage.getItem('Questions');
    if (storedQuestions) {
      return; // Si ya están almacenadas, no hacer la solicitud
    }
  
    try {
      const response = await fetch(`/api/getAllQuestions?game_id=${gameId}`);
      const data = await response.json();
  
      if (response.ok) {
        const questionsWithGamed: Question[] = data.questions.map((question: Omit<Question, 'gamed'>) => ({
          ...question,
          gamed: false,
        }));
  
        // Guardar las preguntas en localStorage
        localStorage.setItem('Questions', JSON.stringify(questionsWithGamed));
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };
  

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
          localStorage.removeItem('Questions'); // También eliminar preguntas
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
