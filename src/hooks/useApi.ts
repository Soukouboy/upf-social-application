/**
 * Hook générique pour les appels API
 *
 * Encapsule un appel asynchrone avec les états :
 *   - data : résultat typé
 *   - loading : en cours de chargement
 *   - error : message d'erreur le cas échéant
 *
 * Usage :
 *   const { data, loading, error, execute } = useApi(getCourses);
 *   useEffect(() => { execute({ filiere: 'INFO' }); }, []);
 */
import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, A extends unknown[]> extends UseApiState<T> {
  /** Lancer l'appel API */
  execute: (...args: A) => Promise<T | null>;
  /** Réinitialiser l'état */
  reset: () => void;
}

export function useApi<T, A extends unknown[] = []>(
  apiFunction: (...args: A) => Promise<T>
): UseApiReturn<T, A> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        const message =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Une erreur est survenue';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
