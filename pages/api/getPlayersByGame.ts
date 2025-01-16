import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function getPlayersByGame(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  let { game_id } = req.query;

  if (!game_id) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  if (Array.isArray(game_id)) {
    game_id = game_id[0];
  }

  try {
    const result = await sql`
      SELECT id, name, admin, answer
      FROM players
      WHERE game_id = ${game_id};
    `;

    res.status(200).json({ players: result.rows });
  } catch (error) {
    console.error("Error obteniendo jugadores:", error);
    res.status(500).json({ error: "Error al obtener jugadores" });
  }
}