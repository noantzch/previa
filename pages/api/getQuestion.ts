import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

type Question = {
  id: number;
  question_text: string;
  question_answer_id: number;
  answer_id: number;
  is_correct: boolean;
  answer_text: string;
  image_url: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ question: Question[] } | { error: string }>
) {
  try {
    // Verifica si el método es GET
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Obtén   el ID de la pregunta desde los parámetros de la query
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing or invalid question ID" });
    }

    // Consulta a la tabla "questions" con el ID recibido
    const result = await sql<Question>`
      SELECT 
        q.id AS question_id,
        q.question_text,
        qa.id AS question_answer_id,
        qa.answer_id,
        qa.is_correct,
        a.answer_text,
        a.image_url
      FROM questions q
      LEFT JOIN question_answers qa ON q.id = qa.question_id
      LEFT JOIN answers a ON qa.answer_id = a.id
      WHERE q.id = ${id};
    `;

    // Si no se encuentra la pregunta, devolver un error
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Devuelve los datos en formato JSON
    res.status(200).json({ question: result.rows });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Error fetching question" });
  }
}
