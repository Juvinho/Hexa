import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Database, BarChart2 } from 'lucide-react';

interface DashboardEmptyStateProps {
  accountAgeDays: number;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ accountAgeDays }) => {
  const daysRemaining = 3 - accountAgeDays;
  const progress = ((accountAgeDays + 1) / 3) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
        <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-indigo-100 dark:border-slate-700">
          <Activity className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Iniciando Análise de Dados
        </h2>
        <p className="text-gray-600 dark:text-slate-300 text-lg">
          Bem-vindo ao Hexa Dashboard! Estamos conectando suas fontes de dados e calibrando os algoritmos de IA.
        </p>
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Progresso da Calibragem</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.min(progress, 100).toFixed(0)}%</span>
        </div>
        
        <div className="h-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border ${accountAgeDays >= 0 ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-500/30' : 'bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700'} transition-colors`}>
            <Database className={`w-5 h-5 mb-2 ${accountAgeDays >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
            <p className="text-xs font-medium text-gray-900 dark:text-white">Coleta de Dados</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Dia 1</p>
          </div>
          
          <div className={`p-3 rounded-lg border ${accountAgeDays >= 1 ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-500/30' : 'bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700'} transition-colors`}>
            <BarChart2 className={`w-5 h-5 mb-2 ${accountAgeDays >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
            <p className="text-xs font-medium text-gray-900 dark:text-white">Análise de Tendência</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Dia 2</p>
          </div>

          <div className={`p-3 rounded-lg border ${accountAgeDays >= 2 ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-500/30' : 'bg-gray-50 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700'} transition-colors`}>
            <Clock className={`w-5 h-5 mb-2 ${accountAgeDays >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
            <p className="text-xs font-medium text-gray-900 dark:text-white">Comparativo IA</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Dia 3+</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 dark:text-slate-500 max-w-sm">
        Métricas comparativas e insights avançados estarão disponíveis em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}.
      </p>
    </motion.div>
  );
};
