/**
 * Utility functions for formatting and sanitizing questions
 */

/**
 * Sanitize question text to prevent XSS attacks
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Format question text for display
 * - Preserve code blocks with proper formatting
 * - Handle special characters
 * - Format line breaks
 */
export const formatQuestionText = (text: string): string => {
  if (!text) return '';

  // Detect and preserve code blocks (text between backticks or specific patterns)
  const codeBlockRegex = /`([^`]+)`/g;
  const parts: Array<{ type: 'text' | 'code'; content: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    // Add code block
    parts.push({
      type: 'code',
      content: match[1],
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // If no code blocks found, treat entire text as regular text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  // Format each part
  const formatted = parts.map((part) => {
    if (part.type === 'code') {
      return `<code class="question-code">${sanitizeText(part.content)}</code>`;
    } else {
      // Regular text formatting
      return part.content
        .replace(/\n\n+/g, '</p><p>') // Paragraph breaks
        .replace(/\n/g, '<br>') // Line breaks
        .trim();
    }
  });

  return `<p>${formatted.join('')}</p>`;
};

/**
 * Format options array for display
 */
export const formatOptions = (options: string[]): string[] => {
  return options.map((option) => {
    // Check if option contains code
    if (option.includes('`') || option.match(/<.*>/) || option.match(/\(.*\)/)) {
      return formatQuestionText(option).replace(/<\/?p>/g, '').trim();
    }
    return sanitizeText(option);
  });
};

/**
 * Shuffle array (for randomizing option order)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Format question for display with optional option shuffling
 */
export const formatQuestionForDisplay = (
  question: any,
  shuffleOptions: boolean = false
): any => {
  const formattedQuestion = {
    ...question,
    question: question.question,
    options: question.options,
  };

  if (shuffleOptions) {
    // Keep track of correct answer after shuffling
    const correctIndex = formattedQuestion.options.indexOf(question.correctAnswer);
    formattedQuestion.options = shuffleArray(formattedQuestion.options);
    formattedQuestion.correctAnswer = formattedQuestion.options[correctIndex];
  }

  return formattedQuestion;
};

/**
 * Validate question structure
 */
export const validateQuestionStructure = (question: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!question.question || typeof question.question !== 'string') {
    errors.push('Question text is required and must be a string');
  }

  if (!Array.isArray(question.options) || question.options.length < 2) {
    errors.push('Options must be an array with at least 2 items');
  }

  if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
    errors.push('Correct answer is required and must be a string');
  }

  if (question.options && !question.options.includes(question.correctAnswer)) {
    errors.push('Correct answer must be one of the provided options');
  }

  const validCategories = ['backend', 'frontend'];
  if (question.category && !validCategories.includes(question.category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate percentage score
 */
export const calculateScore = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Get grade based on score
 */
export const getGrade = (score: number): { grade: string; description: string; color: string } => {
  if (score >= 90) {
    return { grade: 'A', description: 'Excellent', color: '#10b981' };
  } else if (score >= 80) {
    return { grade: 'B', description: 'Very Good', color: '#3b82f6' };
  } else if (score >= 70) {
    return { grade: 'C', description: 'Good', color: '#f59e0b' };
  } else if (score >= 60) {
    return { grade: 'D', description: 'Fair', color: '#f97316' };
  } else {
    return { grade: 'F', description: 'Needs Improvement', color: '#ef4444' };
  }
};
