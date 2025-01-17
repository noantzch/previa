import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import PlayersAnswered from './comp/PlayersAnswered';

type Question = {
  id: number;
  question_text: string;
  question_answer_id: number;
  answer_id: number;
  is_correct: boolean;
  answer_text: string;
  image_url: string | null;
};

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const fetchQuestions = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data.question);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        return false;
      } else {
        setError('An unexpected error occurred');
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const loadQuestions = async () => {
      // Usamos un endpoint relativo que se resuelve automáticamente según el entorno
      const success = await fetchQuestions('/api/getQuestion');
      if (!success) {
        setError('Failed to fetch questions');
      }
    };

    loadQuestions();
  }, []);

  const updateAnswer = async (playerId: number, answer: boolean) => {
    try {
      // Usamos un endpoint relativo que se resuelve automáticamente según el entorno
      const response = await fetch('/api/setAnswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId, answer }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      setMessage('Player answer updated successfully');
    } catch (err) {
      console.error('Error updating player answer:', err);
      setMessage('Error updating player answer');
    }
  };

  const handleAnswerSelection = (isCorrect: boolean) => {
    const storedData = localStorage.getItem('Player');
    if (!storedData) {
      setMessage('Player ID not found in localStorage');
      return;
    }

    const parsedData = JSON.parse(storedData);
    const playerId = parsedData?.id;

    if (!playerId) {
      setMessage('Invalid Player ID');
      return;
    }

    updateAnswer(playerId, isCorrect);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const { question_text } = questions[0];

  return (
    <div className="p-6">
      <p className="mb-6 text-lg">{question_text}</p>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map((question) => (
          <div
            key={question.question_answer_id}
            className="border p-4 flex items-center justify-start space-x-4"
          >
            {question.image_url && (
              <div className="flex-shrink-0">
                <Image
                  src={question.image_url}
                  alt={question.answer_text}
                  width={50}
                  height={50}
                  className="object-cover rounded"
                />
              </div>
            )}
            <button
              onClick={() => handleAnswerSelection(question.is_correct)}
              className="text-left text-blue-500 hover:underline flex-1"
            >
              {question.answer_text}
            </button>
          </div>
        ))}
      </div>

      {message && <p>{message}</p>}
      
      <PlayersAnswered />
    </div>
  );
};

export default Questions;
