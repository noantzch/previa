import { useRouter } from 'next/router';
import PlayerList from '../Components/PlayerList';
import { useEffect, useState } from 'react';
import GameFoot from '../Components/GameFoot';

export default function WaitingRoom() {
  const router = useRouter();
  const { id } = router.query;
  const [gameId, setGameId] = useState<number | null>(null);

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
  }, [id]);

  if (gameId === null) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white text-gray-900 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Sala de Espera: Juego {gameId}</h1>
      <PlayerList gameId={gameId.toString()} />
      <GameFoot />
    </div>
  );
}
