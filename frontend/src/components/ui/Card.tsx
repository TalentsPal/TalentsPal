import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export default function Card({ children, className = '', delay = 0, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={onClick ? { y: -5, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
