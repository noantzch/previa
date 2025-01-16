import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Game {
  id: number;
  started: boolean;
}

export default function GamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/listGames')
      .then((response) => response.json())
      .then((data) => setGames(data.games))
      .catch((error) => console.error('Error fetching games:', error));
  }, []);

  const handleJoinClick = (game: Game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  return (
    <div>
      <ul className="space-y-2">
        {games.map((game) => (
          <li key={game.id} className="flex items-center justify-between bg-gray-200 p-3 rounded">
            <span>Juego {game.id} - {game.started ? 'Iniciado' : 'No Iniciado'}</span>
            <button
              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
              onClick={() => handleJoinClick(game)}
            >
              Unirse
            </button>
          </li>
        ))}
      </ul>
      {showModal && selectedGame && (
        <RegisterModal game={selectedGame} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function RegisterModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const [name, setName] = useState('');
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!name) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const response = await fetch(`/api/checkAdmin?game_id=${game.id}`);
      const data = await response.json();

      if (admin && data.adminExists) {
        setError('Ya existe un administrador para este juego');
        return;
      }

      const registerResponse = await fetch('/api/registerPlayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, admin, game_id: game.id }),
      });

      if (registerResponse.ok) {
        router.push(`/sala-de-espera-${game.id}`);
      } else {
        setError('Error al registrar jugador');
      }
    } catch (error) {
      console.error('Error registrando jugador:', error);
      setError('Error al registrar jugador');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Registrar Jugador</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
          Nombre:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full px-3 py-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="admin">
          Admin:
        </label>
        <input
          type="checkbox"
          id="admin"
          checked={admin}
          onChange={(e) => setAdmin(e.target.checked)}
          className="mb-4"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          Ingresar
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-md mt-2 hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}