import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
}

export const ChartWrapper = ({ title, subtitle, children, delay = 0 }: ChartWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="h-80 w-full">
        {children}
      </div>
    </motion.div>
  );
};
