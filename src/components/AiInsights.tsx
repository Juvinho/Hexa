import { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCw, MessageSquare, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'sonner';

interface AiInsightsProps {
  metrics: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AiInsights = ({ metrics }: AiInsightsProps) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');
  
  // Insights State
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await api.post('/ai/insights', { metrics });
      setInsights(response.data.insights);
      setShowInsights(true);
      toast.success('Insights gerados com sucesso!');
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast.error('Não foi possível gerar insights no momento.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const response = await api.post('/ai/chat', { 
        message: userMsg.content,
        context: metrics 
      });

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data.reply
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      toast.error('Erro ao enviar mensagem para a IA.');
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl text-white shadow-xl relative overflow-hidden flex flex-col h-[500px]">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24" />
      </div>

      {/* Header & Tabs */}
      <div className="relative z-10 p-6 pb-2 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h3 className="font-bold text-lg">Hexa AI</h3>
          </div>
          {activeTab === 'insights' && (
            <button 
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar Insights"
            >
              <RefreshCw className={`w-5 h-5 ${loadingInsights ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('insights')}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === 'insights' ? 'text-white' : 'text-indigo-300 hover:text-white'
            }`}
          >
            Insights Estratégicos
            {activeTab === 'insights' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === 'chat' ? 'text-white' : 'text-indigo-300 hover:text-white'
            }`}
          >
            Chat Assistente
            {activeTab === 'chat' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10 bg-black/20">
        <AnimatePresence mode="wait">
          {activeTab === 'insights' ? (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-6"
            >
              {loadingInsights ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-300 animate-pulse" />
                  </div>
                  <p className="text-indigo-200 animate-pulse">Analisando seus dados...</p>
                </div>
              ) : !showInsights ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-indigo-200 mb-4 max-w-xs">
                    Utilize nossa IA para analisar seus dados e descobrir oportunidades de crescimento.
                  </p>
                  <button 
                    onClick={fetchInsights}
                    disabled={loadingInsights}
                    className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Gerar Insights
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-colors"
                    >
                      <p className="text-sm font-medium leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                  
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={fetchInsights}
                      className="text-xs text-indigo-300 hover:text-white underline decoration-dashed underline-offset-4"
                    >
                      Gerar novos insights
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p className="text-sm">Faça perguntas sobre seus dados...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-indigo-500' : 'bg-emerald-600'
                      }`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white/10 text-indigo-100 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {loadingChat && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg rounded-tl-none">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/10">
                <div className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua pergunta..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-indigo-300 focus:outline-none focus:bg-white/20 focus:border-indigo-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loadingChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
