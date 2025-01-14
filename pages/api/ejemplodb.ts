// pages/api/composers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

type Composer = {
  id: number;
  name: string;
  wiki_spa: string | null;
  wiki_eng: string | null;
  period_id: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ composers: Composer[] } | { error: string }>,
) {
  try {
    // Consulta a la tabla "composers"
    const result = await sql<Composer>`SELECT * FROM answers`;

    // Devuelve los datos en formato JSON
    res.status(200).json({ composers: result.rows });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Error fetching answers" });
  }
}
