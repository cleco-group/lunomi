import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type IndustryConfig, getIndustryConfig } from '../config/industries';

interface IndustryContextType {
  industry: IndustryConfig;
  setIndustryId: (id: string) => void;
  loading: boolean;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industry, setIndustry] = useState<IndustryConfig>(getIndustryConfig('fnb'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_industry') || 'fnb';
    setIndustry(getIndustryConfig(stored));
    setLoading(false);
  }, []);

  const handleSetIndustryId = (id: string) => {
    localStorage.setItem('lunomi_industry', id);
    setIndustry(getIndustryConfig(id));
  };

  return (
    <IndustryContext.Provider value={{ industry, setIndustryId: handleSetIndustryId, loading }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error('useIndustry must be used within IndustryProvider');
  }
  return context;
}
