import { useState, useEffect } from 'react';

export const useApi = (apiCall, dependencies = [], maxRetries = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        setLoading(true);
        const result = await apiCall();
        setData(result);
        setError(null);
        return;
      } catch (err) {
        attempts++;
        if (attempts === maxRetries) {
          setError(new Error('Failed to fetch data after multiple attempts'));
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};