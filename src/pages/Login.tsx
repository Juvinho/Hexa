import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Hexagon, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      const fetchUser = async () => {
        try {
          localStorage.setItem('token', token);
          const response = await api.get('/auth/me');
          login(token, response.data);
          toast.success('Login realizado com sucesso!');
        } catch (error) {
          console.error('Failed to fetch user:', error);
          toast.error('Erro ao autenticar com provedor social.');
          localStorage.removeItem('token');
        }
      };
      fetchUser();
    }
  }, [searchParams, login]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.token, response.data.user);
      toast.success('Login realizado com sucesso!');
    } catch (err) {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      
      {/* Enhanced Background Elements with Motion */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 3, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 relative z-10"
      >
        {/* Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-default"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-4 bg-slate-900 ring-1 ring-slate-800/50 rounded-2xl">
              <Hexagon className="w-10 h-10 text-indigo-500 fill-indigo-500/10" strokeWidth={1.5} />
            </div>
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-white tracking-tight">Bem-vindo ao Hexa</h2>
          <p className="mt-2 text-slate-400 text-center text-sm">
            Gerencie suas campanhas com inteligência e precisão.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl ring-1 ring-white/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 ml-1">
                E-mail Profissional
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm hover:border-slate-600"
                  placeholder="nome@empresa.com"
                  autoComplete="email"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1 mt-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                  Senha
                </label>
                <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm hover:border-slate-600"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs flex items-center gap-1 mt-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Acessar Painel <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50">
             {/* Social Login Buttons */}
             <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.a 
                  whileHover={{ scale: 1.02, backgroundColor: '#1e293b' }}
                  whileTap={{ scale: 0.98 }}
                  href="http://localhost:3000/api/auth/google" 
                  className="flex items-center justify-center px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-slate-300 hover:text-white transition-colors text-sm font-medium"
                >
                   <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   Google
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.02, backgroundColor: '#1e293b' }}
                  whileTap={{ scale: 0.98 }}
                  href="http://localhost:3000/api/auth/github" 
                  className="flex items-center justify-center px-4 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-slate-300 hover:text-white transition-colors text-sm font-medium"
                >
                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                     <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                   </svg>
                   GitHub
                </motion.a>
             </div>

            <p className="text-center text-sm text-slate-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-all">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
