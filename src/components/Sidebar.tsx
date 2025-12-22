import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, Settings, Users, BarChart3, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Campanhas', icon: Layers, path: '/campaigns' },
    { name: 'Integrações', icon: Radio, path: '/integrations' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Relatórios', icon: BarChart3, path: '/reports' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col fixed left-0 top-0 transition-colors duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-hexa-primary dark:text-indigo-400 flex items-center gap-2">
          <div className="w-8 h-8 bg-hexa-primary dark:bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg">
            H
          </div>
          Hexa
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-hexa-primary dark:text-indigo-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-300 font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-sm flex-1">
            <p className="font-medium text-gray-900 dark:text-slate-200">{user?.name || 'User'}</p>
            <p className="text-gray-500 dark:text-slate-500 text-xs truncate max-w-[120px]">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
