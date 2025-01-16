import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function registerPlayer(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, admin, game_id } = req.body;

  if (!name || game_id === undefined || admin === undefined) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const result = await sql`
      INSERT INTO players (name, admin, game_id)
      VALUES (${name}, ${admin}, ${game_id})
      RETURNING id, admin, game_id, answer;
    `;
    const newPlayer = result.rows[0];

    res.status(201).json(newPlayer);
  } catch (error) {
    console.error("Error al registrar jugador:", error);
    res.status(500).json({ error: "Error al registrar jugador" });
  }
}

