import React, { useEffect, useState } from 'react';

interface Question {
  id: number;
  question_text: string;
  gamed: boolean;
}

export default function LastUsedQuestion() {
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);

  useEffect(() => {
    // Cargar preguntas desde el localStorage
    const storedQuestions: Question[] = JSON.parse(localStorage.getItem('Questions') || '[]');
    
    // Filtrar las preguntas cuyo valor "gamed" sea true
    const answeredQuestions = storedQuestions.filter((q) => q.gamed === true);
    
    if (answeredQuestions.length > 0) {
      // Obtener la pregunta con el mayor ID
      const lastUsedQuestion = answeredQuestions.reduce((max, q) => (q.id > max.id ? q : max));
      
      // Actualizamos el estado con la última pregunta utilizada
      setLastQuestion(lastUsedQuestion.question_text);
    }
  }, []);

  return (
    <div>
      {lastQuestion ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          <h3>{lastQuestion}</h3>
        </div>
      ) : (
        <p>No hay preguntas utilizadas.</p>
      )}
    </div>
  );
}
