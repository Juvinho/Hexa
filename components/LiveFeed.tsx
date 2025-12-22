import React from 'react';
import { Lead } from '../types';
import { User, Facebook, Instagram, Youtube, Globe, Smartphone } from 'lucide-react';

interface LiveFeedProps {
  leads: Lead[];
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ leads }) => {
  const getIcon = (platform: string) => {
    switch(platform) {
      case 'facebook': return <Facebook size={16} className="text-blue-500" />;
      case 'instagram': return <Instagram size={16} className="text-pink-500" />;
      case 'tiktok': return <Smartphone size={16} className="text-teal-400" />; // Lucide doesn't have tiktok specific, using phone
      case 'youtube': return <Youtube size={16} className="text-red-500" />;
      case 'google': return <Globe size={16} className="text-green-500" />;
      default: return <Globe size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Leads em Tempo Real
        </h3>
        <span className="text-xs text-slate-500 uppercase font-mono">Live Stream</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {leads.length === 0 && (
          <div className="text-center text-slate-500 py-10">Aguardando novos leads...</div>
        )}
        {leads.map((lead) => (
          <div key={lead.id} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
               {getIcon(lead.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="text-sm font-medium text-slate-200 truncate">{lead.name}</p>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {lead.timestamp.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{lead.email}</p>
            </div>
            <div className="text-right shrink-0">
               <span className="block text-sm font-bold text-emerald-400">R$ {lead.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};