// Archivo: pages/api/registerPlayer.ts
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

  if (!name || typeof admin !== "boolean" || !game_id) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    // Inserción en la tabla players
    const result = await sql`
      INSERT INTO players (name, admin, game_id)
      VALUES (${name}, ${admin}, ${game_id})
      RETURNING id;
    `;

    // Notificar a los clientes conectados (simplificado)
    // Aquí puedes usar websockets u otro método para actualizar la lista de jugadores

    res.status(201).json({ playerId: result.rows[0].id });
  } catch (error) {
    console.error("Error registrando jugador:", error);
    res.status(500).json({ error: "Error al registrar jugador" });
  }
}




