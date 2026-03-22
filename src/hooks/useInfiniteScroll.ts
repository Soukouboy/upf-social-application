/**
 * Hook de scroll infini (Intersection Observer)
 *
 * Utilisé pour :
 *   - Historique du chat (charger les messages plus anciens)
 *   - Listes paginées (cours, épreuves, groupes)
 *
 * Usage :
 *   const { sentinelRef } = useInfiniteScroll({
 *     onLoadMore: () => fetchNextPage(),
 *     hasMore: page < totalPages,
 *     loading: isLoading,
 *   });
 *   // <div ref={sentinelRef} /> en bas de la liste
 */
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /** Fonction appelée pour charger la page suivante */
  onLoadMore: () => void;
  /** True s'il reste des pages à charger */
  hasMore: boolean;
  /** True si un chargement est en cours */
  loading: boolean;
  /** Distance en pixels avant le bas de la liste pour déclencher le chargement */
  threshold?: number;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  loading,
  threshold = 100,
}: UseInfiniteScrollOptions) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, loading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold]);

  return { sentinelRef };
};
