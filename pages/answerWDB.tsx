import React, { useEffect, useState } from 'react';
import LastUsedQuestion from './comp/LastQuestionWDB';
import SiguientePreguntaWDB from './comp/NextWDBQuestion';
import { useRouter } from 'next/router';
import GameFoot from './comp/GameFoot';

const AnswerWDB = () => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [mostVotedAnswer, setMostVotedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const router = useRouter(); // Hook de enrutamiento para redirigir

  const fetchGameStatus = async (gameId: number) => {
    try {
      const response = await fetch(`/api/game?game_id=${gameId}`);
      const data = await response.json();

      if (response.ok) {
        // Verificar si game.started es false
        if (data.game && data.game.started === false) {
          console.log('El juego no ha comenzado. Redirigiendo al inicio...');
          
          // Eliminar el objeto Player del localStorage
          localStorage.removeItem('Player');

          // Redirigir al índice
          router.push('/');
        } else if (data.game && data.game.answered) {
          // Redirigir a /question si answered es true
          router.push('/question2');
        }
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

      // Verificar el estado del juego cada 1 segundo
      const intervalId = setInterval(() => {
        fetchGameStatus(gameId);
      }, 1000); // 1 segundo

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(intervalId);
    }
  }, []); // Solo se ejecuta una vez, ya que no hay dependencias

  useEffect(() => {
    // Verificar si el Player está en localStorage
    if (typeof window !== 'undefined') {
      const playerData = localStorage.getItem('Player');
      console.log('Player data in localStorage:', playerData); // Verifica si el Player está en localStorage

      if (playerData) {
        const player = JSON.parse(playerData);
        console.log('Player object:', player); // Verifica el contenido del objeto Player
        setGameId(player.game_id);
      } else {
        console.log('No player data found in localStorage');
      }
    }
  }, []);

  useEffect(() => {
    // Si ya tenemos el gameId, hacemos la solicitud a la API
    if (gameId !== null) {
      console.log('Fetching most voted answer for game_id:', gameId); // Verifica que el gameId esté disponible
      setLoading(true); // Iniciar la carga antes de hacer la solicitud
      fetch(`/api/getMostVoted?game_id=${gameId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Response from API:', data); // Verifica la respuesta de la API
          setMostVotedAnswer(data.mostFrequentAnswer || 'No se encontró respuesta');
          setLoading(false); // Finalizar la carga cuando se recibe la respuesta
        })
        .catch((error) => {
          console.error('Error al obtener la respuesta más votada:', error);
          setLoading(false); // Finalizar la carga incluso si ocurre un error
        });
    }
  }, [gameId]);

  return (
    <div>
      <LastUsedQuestion />
      
      {loading ? (
        <p>Cargando...</p> // Mensaje de carga mientras se espera la respuesta
      ) : (
        mostVotedAnswer && (
          <div className="mt-4 p-4 rounded text-center">
            <h1 className="mt-4 p-4 rounded text-center font-bold text-3xl" >{mostVotedAnswer}</h1> {/* Mostrar la respuesta más votada */}
          </div>
        )
      )}
      <SiguientePreguntaWDB />
      <GameFoot />
    </div>
  );
}

export default AnswerWDB;
