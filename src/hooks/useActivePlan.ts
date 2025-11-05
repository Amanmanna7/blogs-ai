import { useState, useEffect } from 'react';

interface ActivePlan {
  id: string;
  planName: string;
  planDescription: string;
  startDate: string;
  endDate: string;
  paidAmount: number;
  features: Array<{
    id: string;
    feature: string;
    description: string;
    featureSlug: string;
  }>;
}

interface UseActivePlanReturn {
  hasActivePlan: boolean;
  activePlan: ActivePlan | null;
  loading: boolean;
  error: string | null;
}

export function useActivePlan(): UseActivePlanReturn {
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/user-plans/active');
        
        if (!response.ok) {
          throw new Error('Failed to fetch active plan');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setHasActivePlan(data.hasActivePlan);
          setActivePlan(data.activePlan);
        } else {
          throw new Error(data.error || 'Failed to fetch active plan');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setHasActivePlan(false);
        setActivePlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlan();
  }, []);

  return {
    hasActivePlan,
    activePlan,
    loading,
    error
  };
}
