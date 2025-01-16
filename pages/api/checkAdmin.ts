import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function checkAdmin(
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
      SELECT COUNT(*) as admin_count
      FROM players
      WHERE game_id = ${game_id} AND admin = true;
    `;

    const adminExists = result.rows[0].admin_count > 0;
    res.status(200).json({ adminExists });
  } catch (error) {
    console.error("Error verificando administrador:", error);
    res.status(500).json({ error: "Error al verificar administrador" });
  }
}