'use client';

import { useState, useEffect } from 'react';

type Player = {
  id: number;
  name: string;
};

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Obtener el objeto "Player" del localStorage
        const playerData = JSON.parse(localStorage.getItem('Player') || '{}');
        const gameId = playerData?.game_id;

        if (!gameId) {
          console.error('No se encontró gameId en el objeto Player del localStorage');
          return;
        }

        // Obtener los jugadores usando la API
        const playersResponse = await fetch(`/api/getPlayersByGame?game_id=${gameId}`);
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          setPlayers(playersData.players);
        } else {
          console.error('No se pudo obtener a los jugadores');
        }
      } catch (error) {
        console.error('Error obteniendo datos:', error);
      }
    };

    fetchPlayers();
  }, []);

  const handlePlayerClick = async (playerName: string) => {
    try {
      // Obtener el playerId del localStorage
      const playerData = JSON.parse(localStorage.getItem('Player') || '{}');
      const playerId = playerData?.id;

      if (!playerId) {
        console.error('No se encontró playerId en el objeto Player del localStorage');
        return;
      }

      // Enviar la respuesta a la API
      setLoading(true);
      const response = await fetch('/api/setAnswerText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: playerId,
          answer_text: playerName,
        }),
      });

      if (response.ok) {
        console.log('Respuesta guardada exitosamente');
      } else {
        console.error('Error al guardar la respuesta');
      }
    } catch (error) {
      console.error('Error al enviar la respuesta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <tbody>
            {players.map((player) => (
              <tr
                key={player.id}
                className="text-center cursor-pointer"
                onClick={() => handlePlayerClick(player.name)} // Acción al hacer clic en el nombre
              >
                <td className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-md">
                  {player.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="mt-4 text-center text-blue-500">Enviando respuesta...</div>
      )}
    </div>
  );
}
