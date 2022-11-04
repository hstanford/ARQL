import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'http://localhost:3333/api';

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const res = await fetch(BASE_URL + '/sources');
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      return await res.json();
    },
  });
}
