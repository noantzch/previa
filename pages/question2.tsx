import React, { useEffect, useState } from 'react';
import ChooseAnswer from './comp/ChooseAnswer';
import PlayersAnswered from './comp/PlayersAnswered';

interface Question {
  id: number;
  question_text: string;
  gamed: boolean;
}

export default function QuestionComponent() {
  const [question, setQuestion] = useState<string | null>(null);

  useEffect(() => {
    // Cargar preguntas desde el localStorage
    const storedQuestions: Question[] = JSON.parse(localStorage.getItem('Questions') || '[]');
    
    // Filtrar la primera pregunta cuyo valor "gamed" sea false
    const unansweredQuestion = storedQuestions.find((q) => q.gamed === false);
    
    if (unansweredQuestion) {
      // Actualizamos el estado con la pregunta
      setQuestion(unansweredQuestion.question_text);
      
      // Marcar la pregunta como "gamed" = true
      unansweredQuestion.gamed = true;

      // Actualizar el localStorage con las preguntas modificadas
      const updatedQuestions = storedQuestions.map((q) =>
        q.id === unansweredQuestion.id ? unansweredQuestion : q
      );
      localStorage.setItem('Questions', JSON.stringify(updatedQuestions));
    }
  }, []);

  return (
    <div>
      {question ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          <h1>{question}</h1>
        </div>
      ) : (
        <p>No hay preguntas pendientes.</p>
      )}
      <ChooseAnswer />
      <PlayersAnswered />
    </div>
  );
}
