// api/setAnswered.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { game_id } = req.body;

    if (!game_id) {
      return res.status(400).json({ error: 'game_id is required' });
    }

    try {
      // Actualizar el campo answered en la tabla games
      await sql`
        UPDATE games
        SET answered = true
        WHERE id = ${game_id};
      `;
      return res.status(200).json({ message: 'Game answered status updated' });
    } catch (error) {
      console.error('Error updating answered status:', error);
      return res.status(500).json({ error: 'Error updating answered status' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
