import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiConfig, configureApi } from '../services/api';

interface ApiContextType {
  config: ApiConfig;
  updateConfig: (newConfig: ApiConfig) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('apiConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse API config', e);
      }
    }
    return {
      baseUrl: 'http://localhost:3000/api',
      timeout: 10000,
      retryCount: 3,
    };
  });

  useEffect(() => {
    localStorage.setItem('apiConfig', JSON.stringify(config));
    configureApi(config);
  }, [config]);

  const updateConfig = (newConfig: ApiConfig) => {
    setConfig(newConfig);
  };

  return (
    <ApiContext.Provider value={{ config, updateConfig }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiConfig must be used within an ApiProvider');
  }
  return context;
};
