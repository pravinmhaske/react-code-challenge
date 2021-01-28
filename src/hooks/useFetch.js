import { useState, useEffect } from 'react'

const useFetch = (url, method, options) => {

    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(url, {
                    method: method,
                    headers: options
                });
                const json = await res.json();
                setResponse(json);
                setIsLoading(false)
            } catch (error) {
                console.log("Error ", error);
                setError(error);
            }
        };
        fetchData();
    }, [url]);

    return { response, error, isLoading };
};

export default useFetch