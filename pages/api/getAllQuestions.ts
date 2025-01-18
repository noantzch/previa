import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

type Question = {
  id: number;
  question_text: string;
  game_id: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ questions: Question[] } | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { game_id } = req.query;

  // Validar que game_id esté presente y sea un número
  if (!game_id || isNaN(Number(game_id))) {
    return res.status(400).json({ error: "Invalid or missing game_id parameter" });
  }

  try {
    // Consulta a la tabla "questions" filtrando por game_id
    const result = await sql<Question>`
      SELECT id, question_text, game_id
      FROM questions
      WHERE game_id = ${Number(game_id)};
    `;

    // Devuelve los datos en formato JSON
    res.status(200).json({ questions: result.rows });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Error fetching questions" });
  }
}
