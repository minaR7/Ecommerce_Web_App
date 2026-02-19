
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

export const usePageContent = (slug) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await axiosInstance.get(`/api/pages/${slug}`);
        setPage(response.data);
      } catch (err) {
        console.error(`Error fetching page ${slug}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  return { page, loading, error };
};
