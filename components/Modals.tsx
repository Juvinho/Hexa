import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Platform, PlatformData } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; platform: Platform; value: number }) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    platform: 'facebook' as Platform,
    value: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({ name: '', email: '', platform: 'facebook', value: 0 }); // Reset
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Lead Manual">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Lead</label>
          <input 
            required
            type="text" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
          <input 
            required
            type="email" 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
            placeholder="Ex: joao@email.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Plataforma</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              value={formData.platform}
              onChange={e => setFormData({...formData, platform: e.target.value as Platform})}
            >
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google Ads</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor Conversão (R$)</label>
            <input 
              required
              type="number" 
              min="0"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              value={formData.value}
              onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
          <Plus size={18} />
          Adicionar Lead
        </button>
      </form>
    </Modal>
  );
};

interface EditMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: PlatformData[];
  onSave: (platformId: Platform, updates: Partial<PlatformData>) => void;
}

export const EditMetricsModal: React.FC<EditMetricsModalProps> = ({ isOpen, onClose, platforms, onSave }) => {
  const [selectedId, setSelectedId] = useState<Platform>('facebook');
  const [metrics, setMetrics] = useState({ spend: 0, impressions: 0, clicks: 0 });

  // Update local state when selected platform changes
  useEffect(() => {
    const p = platforms.find(p => p.id === selectedId);
    if (p) {
      setMetrics({ spend: p.spend, impressions: p.impressions, clicks: p.clicks });
    }
  }, [selectedId, platforms, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedId, metrics);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atualizar Métricas de Campanha">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Selecionar Plataforma</label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`text-xs py-2 px-1 rounded border transition-colors ${
                  selectedId === p.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">Gasto Total (R$)</label>
             <input 
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
              value={metrics.spend}
              onChange={e => setMetrics({...metrics, spend: parseFloat(e.target.value) || 0})}
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Impressões</label>
              <input 
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                value={metrics.impressions}
                onChange={e => setMetrics({...metrics, impressions: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cliques</label>
              <input 
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                value={metrics.clicks}
                onChange={e => setMetrics({...metrics, clicks: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
          <Save size={18} />
          Salvar Alterações
        </button>
      </form>
    </Modal>
  );
};