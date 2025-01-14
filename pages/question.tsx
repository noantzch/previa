import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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
    const localUrl = 'http://localhost:3000/api/getQuestion';
    const productionUrl = 'https://previa-beta.vercel.app/api/getQuestion';

    const loadQuestions = async () => {
      const success = await fetchQuestions(localUrl);
      if (!success) {
        await fetchQuestions(productionUrl);
      }
    };

    loadQuestions();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  // Get the first question to display question_text only once
  const { question_text } = questions[0];

  return (
    <div className="p-6">
      <p className="mb-6 text-lg">{question_text}</p> {/* Display question_text only once */}

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
              onClick={() => alert(`Is correct: ${question.is_correct}`)}
              className="text-left text-blue-500 hover:underline flex-1"
            >
              {question.answer_text}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Questions;
