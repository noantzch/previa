// pages/api/getMostFrequentAnswer.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

type Player = {
  id: number;
  answer_text: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const game_id = req.query.game_id as string; // Obtener el game_id del query
      console.log("GET request received. Game ID:", game_id);

      // Verificar si el game_id es válido
      if (!game_id || isNaN(Number(game_id))) {
        return res.status(400).json({ error: 'Invalid game_id' });
      }

      // Obtener los answer_text de los jugadores relacionados con el game_id
      const result = await sql<Player>`
        SELECT answer_text
        FROM players
        WHERE game_id = ${game_id}
      `;
      
      console.log("Query result:", result);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'No players found for the game' });
      }

      // Extraer los valores de answer_text y contar las repeticiones
      const answerCounts: { [key: string]: number } = {};
      
      result.rows.forEach((player) => {
        const answer = player.answer_text;
        if (answer) {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        }
      });

      // Encontrar el answer_text más repetido
      const mostFrequentAnswer = Object.keys(answerCounts).reduce((a, b) =>
        answerCounts[a] > answerCounts[b] ? a : b
      );

      res.status(200).json({ mostFrequentAnswer, count: answerCounts[mostFrequentAnswer] });
    } catch (error) {
      console.error('Error fetching answers:', error);
      res.status(500).json({ error: 'Error fetching answers' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
