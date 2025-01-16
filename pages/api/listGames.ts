import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from "@vercel/postgres";

type Game = {
id: number;
started: boolean;
};

export default async function listGames(
  req: NextApiRequest,
  res: NextApiResponse<{ games: Game[] } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  try {
    const result = await sql<Game>`
        SELECT id, started
        FROM games;
        `;
    res.status(200).json({ games: result.rows });
  }catch (error) {
        console.error("Error obteniendo juegos:", error);
        res.status(500).json({ error: "Error al obtener juegos" });
  }
} 