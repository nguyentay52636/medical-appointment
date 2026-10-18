import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook fetch dữ liệu từ API
 */
const useFetch = (apiCall, dependencies = []) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            setData(result);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || err.message || 'An unknown error occurred');
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [apiCall, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refetchTrigger]);

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    return { data, isLoading, error, refetch };
};

export default useFetch;
