import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

type Player = {
  id: number;
  name: string;
  answer: boolean;
  game_id: number; 
  answer_text: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ players: Player[] } | { error: string }>
) {
  try {
    const { game_id } = req.query; // Obtenemos el game_id de la query

    if (!game_id) {
      return res.status(400).json({ error: "game_id is required" });
    }

    const gameId = parseInt(game_id as string, 10);

    // Consulta para traer los jugadores de un game_id específico
    const result = await sql<Player>`
      SELECT id, name, answer, game_id, answer_text
      FROM players 
      WHERE game_id = ${gameId};
    `;

    res.status(200).json({ players: result.rows });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Error fetching players" });
  }
}
