// Placeholder for AI services
// In a real app, this would call OpenAI or similar APIs

export const analyzeCV = async (cvText: string) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    score: Math.floor(Math.random() * 30) + 70, // Random score between 70 and 100
    summary: "The candidate shows strong potential in full-stack development.",
    strengths: ["TypeScript", "Node.js", "React"],
    weaknesses: ["Lack of cloud deployment experience", "Could improve testing coverage"],
    suggestions: ["Add more details about specific projects", "Highlight soft skills"]
  };
};

export const simulateInterviewQuestion = async (topic: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const questions: Record<string, string[]> = {
    "javascript": [
      "Explain the event loop in JavaScript.",
      "What is the difference between let, const, and var?",
      "How does prototypal inheritance work?"
    ],
    "react": [
      "What are hooks in React?",
      "Explain the Virtual DOM.",
      "What is the difference between state and props?"
    ],
    "general": [
      "Tell me about yourself.",
      "What is your greatest strength?",
      "Where do you see yourself in 5 years?"
    ]
  };

  const topicQuestions = questions[topic.toLowerCase()] || questions["general"];
  const randomQuestion = topicQuestions[Math.floor(Math.random() * topicQuestions.length)];

  return {
    question: randomQuestion,
    topic: topic
  };
};

export const evaluateInterviewAnswer = async (question: string, answer: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    score: Math.floor(Math.random() * 5) + 6, // 6 to 10
    feedback: "Good answer, but try to be more specific with examples.",
    improvedAnswer: "A better answer would include..."
  };
};
