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
  res: NextApiResponse<{ question: Question[] } | { error: string }>,
) {
  try {
    // Consulta a la tabla "questions" con su respuestas 
    const result = await sql<Question>`WITH random_question AS (
    SELECT id, question_text
    FROM questions
    ORDER BY RANDOM()
    LIMIT 1
)
SELECT 
    q.id AS question_id,
    q.question_text,
    qa.id AS question_answer_id,
    qa.answer_id,
    qa.is_correct,
    a.answer_text,
    a.image_url
FROM random_question q
LEFT JOIN question_answers qa ON q.id = qa.question_id
LEFT JOIN answers a ON qa.answer_id = a.id;

`;

    // Devuelve los datos en formato JSON
    res.status(200).json({ question: result.rows });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Error fetching questions" });
  }
}
