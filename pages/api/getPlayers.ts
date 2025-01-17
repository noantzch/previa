import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

type Player = {
  id: number;
  name: string;
  admin: boolean;
  answer: boolean | null;
};

export default async function getPlayers(
  req: NextApiRequest,
  res: NextApiResponse<{ players: Player[] } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Consulta para obtener todos los jugadores registrados
    const result = await sql<Player>`
      SELECT id, name, admin, answer
      FROM players;
    `;

    res.status(200).json({ players: result.rows });
  } catch (error) {
    console.error("Error obteniendo jugadores:", error);
    res.status(500).json({ error: "Error al obtener jugadores" });
  }
}
