import { useRouter } from 'next/router';
import PlayerList from '../components/PlayerList';
import { useEffect, useState } from 'react';

export default function WaitingRoom() {
  const router = useRouter();
  const { id } = router.query;
  const [gameId, setGameId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const match = (id as string).match(/\d+$/);
      if (match) {
        const parsedId = parseInt(match[0], 10);
        if (!isNaN(parsedId)) {
          setGameId(parsedId);
        } else {
          console.error('ID no es un número válido:', id);
        }
      } else {
        console.error('No se encontró un número en el ID:', id);
      }
    }

    // Obtener el ID del jugador del localStorage
    const playerData = localStorage.getItem('Player');
    if (playerData) {
      const player = JSON.parse(playerData);
      setPlayerId(player.id);
    }
  }, [id]);

  const handleExit = async () => {
    if (playerId && gameId) {
      try {
        const response = await fetch('/api/leaveGame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId, gameId }),
        });

        if (response.ok) {
          // Eliminar los datos del jugador del localStorage
          localStorage.removeItem('Player');
          // Redirigir al jugador a la página principal
          router.push('/');
        } else {
          console.error('Error al salir del juego');
        }
      } catch (error) {
        console.error('Error al hacer la petición:', error);
      }
    }
  };

  if (gameId === null) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white text-gray-900 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Sala de Espera: Juego {gameId}</h1>
      <PlayerList gameId={gameId.toString()} />
      <button
        onClick={handleExit}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Salir
      </button>
    </div>
  );
}

