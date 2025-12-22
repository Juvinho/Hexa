import { useState } from 'react';
import { User, Bell, Shield, Moon, Globe, Save, Database, Palette, Zap, Layout, Key, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useApiConfig } from '../context/ApiContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings = () => {
  const { 
    mode, 
    toggleMode, 
    themeId, 
    setThemeId, 
    availableThemes, 
    currentTheme,
    fontId,
    setFontId,
    availableFonts,
    radiusId,
    setRadiusId,
    availableRadii
  } = useTheme();
  const { user } = useAuth();
  const { config, updateConfig } = useApiConfig();
  
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('pt-BR');

  // API Form State
  const [apiForm, setApiForm] = useState(config);

  const handleSaveApi = () => {
    if (!apiForm.baseUrl) {
      toast.error('URL Base é obrigatória');
      return;
    }
    updateConfig(apiForm);
    toast.success('Configurações de API salvas com sucesso!');
  };

  const handleClearCache = () => {
    // In a real scenario, we might clear the axios cache or localStorage cache
    // Since our cache is in memory in api.ts, reloading the page clears it.
    // We can simulate it.
    toast.success('Cache limpo com sucesso!');
    window.location.reload();
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: User },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'api', label: 'API & Integrações', icon: Database },
    { id: 'performance', label: 'Desempenho', icon: Zap },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'general' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Perfil e Preferências
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                        <input 
                          type="text" 
                          defaultValue={user?.name}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                        <input 
                          type="email" 
                          defaultValue={user?.email}
                          disabled
                          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Notificações</p>
                          <p className="text-sm text-slate-500">Receber alertas sobre leads e campanhas</p>
                        </div>
                        <button 
                          onClick={() => setNotifications(!notifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Idioma</label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full md:w-1/3 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-600" />
                    Personalização Visual
                  </h2>

                  <div className="space-y-8">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Modo Escuro</p>
                        <p className="text-sm text-slate-500">Alternar entre tema claro e escuro</p>
                      </div>
                      <button 
                        onClick={toggleMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mode === 'dark' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mode === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Theme Grid */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Tema de Cores</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableThemes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setThemeId(t.id)}
                            className={`group relative p-4 rounded-xl border-2 transition-all ${
                              themeId === t.id 
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors.primary }}></div>
                              <span className={`font-medium ${themeId === t.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                {t.name}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <div className="h-2 w-full rounded-full opacity-50" style={{ backgroundColor: t.colors.primary }}></div>
                              <div className="h-2 w-1/3 rounded-full opacity-50" style={{ backgroundColor: t.colors.secondary }}></div>
                            </div>
                            {themeId === t.id && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Font Selection */}
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Tipografia</h3>
                        <div className="space-y-3">
                          {availableFonts.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setFontId(f.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                fontId === f.id
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                              }`}
                              style={{ fontFamily: f.value }}
                            >
                              <span className="font-medium">{f.name}</span>
                              <span className="text-xs opacity-70">Aa Bb Cc</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Border Radius Selection */}
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Estilo de Borda</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {availableRadii.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setRadiusId(r.id)}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                radiusId === r.id
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                              }`}
                            >
                              <div 
                                className="w-12 h-8 border-2 border-current mb-2"
                                style={{ borderRadius: r.value }}
                              ></div>
                              <span className="text-sm font-medium">{r.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preview Area */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Pré-visualização</h3>
                      <div className="flex gap-4">
                        <button className="px-4 py-2 rounded-lg text-white font-medium transition-colors" style={{ backgroundColor: currentTheme.colors.primary }}>
                          Botão Primário
                        </button>
                        <button className="px-4 py-2 rounded-lg text-white font-medium transition-colors" style={{ backgroundColor: currentTheme.colors.secondary }}>
                          Botão Secundário
                        </button>
                        <div className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                          Card Exemplo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Configuração da API
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL Base</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={apiForm.baseUrl}
                          onChange={(e) => setApiForm({...apiForm, baseUrl: e.target.value})}
                          placeholder="https://api.exemplo.com/v1"
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">O endpoint principal para todas as requisições do sistema.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chave de API (Opcional)</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          value={apiForm.apiKey || ''}
                          onChange={(e) => setApiForm({...apiForm, apiKey: e.target.value})}
                          placeholder="sk_..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timeout (ms)</label>
                        <input 
                          type="number" 
                          value={apiForm.timeout}
                          onChange={(e) => setApiForm({...apiForm, timeout: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tentativas de Retry</label>
                        <input 
                          type="number" 
                          value={apiForm.retryCount}
                          onChange={(e) => setApiForm({...apiForm, retryCount: parseInt(e.target.value) || 0})}
                          min="0"
                          max="10"
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleSaveApi}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Salvar Configurações
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    Otimização e Desempenho
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Cache de Requisições</p>
                        <p className="text-sm text-slate-500">Armazena respostas da API localmente para carregamento mais rápido</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">Ativo</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Limpar Cache do Sistema</p>
                        <p className="text-sm text-slate-500">Remove todos os dados temporários e recarrega a aplicação</p>
                      </div>
                      <button 
                        onClick={handleClearCache}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Limpar Agora
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Lazy Loading</p>
                        <p className="text-sm text-slate-500">Carregamento sob demanda de módulos e imagens</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">Ativo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
