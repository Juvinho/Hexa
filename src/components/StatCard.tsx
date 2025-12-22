import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ElementType } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ElementType;
  delay?: number;
}

export const StatCard = ({ title, value, change, trend, icon: Icon, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20">
          <Icon className="w-6 h-6" />
        </div>
        <span 
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1
            ${trend === 'up' 
              ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
              : trend === 'down' 
                ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' 
                : 'bg-gray-50 text-gray-700 dark:bg-slate-800 dark:text-slate-400'
            }`}
        >
          {change}
          {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
          {trend === 'neutral' && <Minus className="w-3 h-3" />}
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium tracking-wide">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      </div>
      
      {/* Decorative progress bar */}
      <div className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ duration: 1, delay: delay + 0.5 }}
          className="h-full bg-primary-600 rounded-full"
        />
      </div>
    </motion.div>
  );
};
