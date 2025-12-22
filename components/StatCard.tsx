import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Metric } from '../types';

interface StatCardProps {
  title: string;
  metric: Metric;
  prefix?: string;
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, metric, prefix = '', suffix = '' }) => {
  const isUp = metric.trend === 'up';
  const isDown = metric.trend === 'down';
  
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
          isUp ? 'bg-emerald-500/10 text-emerald-500' : 
          isDown ? 'bg-rose-500/10 text-rose-500' : 
          'bg-slate-700/50 text-slate-400'
        }`}>
          {isUp && <ArrowUpRight size={14} className="mr-1" />}
          {isDown && <ArrowDownRight size={14} className="mr-1" />}
          {!isUp && !isDown && <Minus size={14} className="mr-1" />}
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </span>
      </div>
      <div className="text-3xl font-bold text-white">
        {prefix}{metric.value.toLocaleString('pt-BR')}{suffix}
      </div>
    </div>
  );
};