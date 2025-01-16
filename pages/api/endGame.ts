// pages/api/endGame.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { game_id } = req.body;
      console.log("End game request received. Game ID:", game_id);

      // Eliminar todos los jugadores con el game_id
      await sql`
        DELETE FROM players
        WHERE game_id = ${game_id}
      `;
      console.log("Players deleted for game ID:", game_id);

      // Cambiar el estado del juego a "no iniciado"
      const result = await sql`
        UPDATE games
        SET started = false
        WHERE id = ${game_id}
        RETURNING id, started
      `;
      console.log("Game state updated:", result);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      res.status(200).json({ game: result.rows[0] });
    } catch (error) {
      console.error('Error ending game:', error);
      res.status(500).json({ error: 'Error ending game' });
    }
  }
}
