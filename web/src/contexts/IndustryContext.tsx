import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { type IndustryConfig, getIndustryConfig } from '../config/industries';

interface IndustryContextType {
  industry: IndustryConfig;
  setIndustryId: (id: string) => void;
  loading: boolean;
}

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industryId, setIndustryId] = useState<string>('fnb'); // Default to F&B
  const [industry, setIndustry] = useState<IndustryConfig>(getIndustryConfig('fnb'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndustryConfig();
  }, []);

  const loadIndustryConfig = async () => {
    try {
      // Load industry config from Firestore company settings
      const companyRef = doc(db, 'companies/demo_company');
      const companySnap = await getDoc(companyRef);
      
      if (companySnap.exists()) {
        const data = companySnap.data();
        const configuredIndustry = data.businessType || 'fnb';
        setIndustryId(configuredIndustry);
        setIndustry(getIndustryConfig(configuredIndustry));
      }
    } catch (error) {
      console.error('Error loading industry config:', error);
      // Fallback to F&B
      setIndustry(getIndustryConfig('fnb'));
    } finally {
      setLoading(false);
    }
  };

  const handleSetIndustryId = (id: string) => {
    setIndustryId(id);
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
