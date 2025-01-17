import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function leaveGame(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { playerId } = req.body;

  if (!playerId || !Number.isInteger(playerId)) {
    return res.status(400).json({ error: "El ID del jugador es inválido" });
  }

  try {
    // Eliminar al jugador de la tabla players
    const { rowCount } = await sql`
      DELETE FROM players
      WHERE id = ${playerId};
    `;

    if (rowCount === 0) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    res.status(200).json({ message: `Jugador con ID ${playerId} eliminado exitosamente` });
  } catch (error) {
    console.error("Error al eliminar jugador:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
