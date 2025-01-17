import GamesList from './comp/GamesList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 bg-white text-gray-900 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Bienvenido</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Juegos Disponibles</h2>
        <GamesList />
      </div>
    </div>
  );
}