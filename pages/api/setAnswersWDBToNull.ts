// /api/setAnswersToNull.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { game_id } = req.body;

    if (!game_id) {
      return res.status(400).json({ error: 'game_id is required' });
    }

    try {
      // Actualizar las respuestas de todos los jugadores del juego a null
      const result = await sql`
        UPDATE players
        SET answer_text = null
        WHERE game_id = ${game_id};
      `;

      return res.status(200).json({ message: 'Player answers reset to null', result });
    } catch (error) {
      console.error('Error updating player answers:', error);
      return res.status(500).json({ error: 'Error updating player answers' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
