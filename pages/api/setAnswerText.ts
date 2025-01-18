import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message?: string } | { error: string }>
) {
  try {
    if (req.method === "POST") {
      const { playerId, answer_text } = req.body;

      if (playerId == null) {
        return res.status(400).json({ error: "playerId is required" });
      }

      if (answer_text == null || typeof answer_text !== 'string') {
        return res.status(400).json({ error: "answer_text is required and must be a string" });
      }

      await sql`UPDATE players SET answer_text = ${answer_text} WHERE id = ${playerId}`;

      res.status(200).json({ message: "Player answer_text updated successfully" });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Error updating player answer_text" });
  }
}
