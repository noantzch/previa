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
  gamed: boolean;
};

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const fetchQuestions = async (url: string) => {
    try {
      const response = await fetch(url);
      console.log('API Response:', response); // Verifica la respuesta de la API
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Data:', data); // Verifica los datos recibidos
      setQuestions(data.question); // Aseguramos que se guarde el array de preguntas
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
      // Obtener el arreglo de preguntas desde localStorage y asegurar que es un arreglo de objetos tipo Question
      const questions: Question[] = JSON.parse(localStorage.getItem('Questions') || '[]');
  
      if (!questions || questions.length === 0) {
        setError('No questions found in localStorage');
        return;
      }
  
      // Buscar el primer objeto con "gamed: false"
      const question = questions.find((q: Question) => !q.gamed);
  
      if (!question) {
        setError('No question with gamed: false found');
        return;
      }
  
      const questionId = question.id; // Obtener el id del primer objeto con "gamed: false"
  
      // Agregar console.log para ver el id que se va a usar en la API
      console.log(`Using question ID for API request: ${questionId}`);
  
      // Usamos el ID de la pregunta para hacer la solicitud
      const success = await fetchQuestions(`/api/getQuestion?id=${questionId}`);
      if (!success) {
        setError('Failed to fetch questions');
        return;
      }

      // Cambiar el valor de "gamed" a true para la pregunta seleccionada
      const updatedQuestions = questions.map(q => 
        q.id === questionId ? { ...q, gamed: true } : q
      );
      
      // Guardar las preguntas actualizadas en localStorage
      localStorage.setItem('Questions', JSON.stringify(updatedQuestions));
    };
  
    loadQuestions();
  }, []);

  useEffect(() => {
    console.log('Questions state:', questions); // Verifica el estado de las preguntas después de actualizarlo
  }, [questions]);

  const updateAnswer = async (playerId: number, answer: boolean) => {
    try {
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
            key={question.id} // Use question.id as the key
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
