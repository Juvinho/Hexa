import { useEffect, useState, useRef } from 'react';
import { Activity, Download, Calendar, Users, Filter, Search, MoreVertical, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useApiConfig } from '../context/ApiContext';

export const Leads = () => {
  const { config } = useApiConfig();
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, newLeads: 0, contacted: 0, converted: 0, conversionRate: '0' });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const socketRef = useRef<Socket | null>(null);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads', {
        params: { status: filterStatus }
      });
      setLeads(response.data.leads);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filterStatus]);

  useEffect(() => {
    try {
        const socketUrl = new URL(config.baseUrl).origin;
        socketRef.current = io(socketUrl);
        
        socketRef.current.on('new_lead', (newLead: any) => {
            setLeads(prev => [newLead, ...prev]);
            toast.success('Novo lead recebido!');
            // Optionally update stats locally or refetch
            fetchLeads();
        });

        return () => {
            socketRef.current?.disconnect();
        };
    } catch (e) {
        console.error('Socket error', e);
    }
  }, []);

  const handleExport = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Data'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name || '',
        lead.email,
        lead.phone || '',
        lead.status,
        new Date(lead.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString()}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'NEW': return 'bg-blue-100 text-blue-700';
          case 'CONTACTED': return 'bg-yellow-100 text-yellow-700';
          case 'CONVERTED': return 'bg-green-100 text-green-700';
          case 'LOST': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500">Total Leads</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500">Novos</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.newLeads}</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500">Convertidos</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.converted}</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-sm text-slate-500">Taxa de Conversão</p>
              <h3 className="text-2xl font-bold text-indigo-600">{stats.conversionRate}%</h3>
          </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciamento de Leads</h1>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe seus leads em tempo real</p>
        </div>
        <div className="flex gap-2">
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
                <option value="ALL">Todos os Status</option>
                <option value="NEW">Novos</option>
                <option value="CONTACTED">Contatados</option>
                <option value="CONVERTED">Convertidos</option>
                <option value="LOST">Perdidos</option>
            </select>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
            <Download className="w-4 h-4" />
            Exportar CSV
            </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{lead.name || 'Sem nome'}</span>
                        <span className="text-xs text-slate-500">{lead.source || 'Desconhecido'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Mail className="w-3 h-3" /> {lead.email}
                        </div>
                        {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Phone className="w-3 h-3" /> {lead.phone}
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <MoreVertical className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Nenhum lead encontrado.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
