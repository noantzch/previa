// pages/api/game.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

type Game = {
  id: number;
  started: boolean;
  answered: boolean; // Añadir la columna answered
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const game_id = req.query.game_id as string; // Obtener el game_id del query
      console.log("GET request received. Game ID:", game_id);

      const result = await sql<Game>`
        SELECT id, started, answered 
        FROM games
        WHERE id = ${game_id}
      `;
      
      console.log("Query result:", result);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      res.status(200).json({ game: result.rows[0] });
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ error: 'Error fetching game' });
    }
  }

  if (method === 'POST') {
    try {
      const { game_id } = req.body; // Obtener el game_id del body
      console.log("POST request received. Game ID:", game_id);

      const result = await sql<Game>`
        UPDATE games
        SET started = NOT started
        WHERE id = ${game_id}
        RETURNING id, started
      `;

      console.log("Update result:", result);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      res.status(200).json({ game: result.rows[0] });
    } catch (error) {
      console.error('Error updating game state:', error);
      res.status(500).json({ error: 'Error updating game state' });
    }
  }
}
