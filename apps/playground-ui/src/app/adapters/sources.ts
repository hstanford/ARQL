import { useMutation, useQuery } from '@tanstack/react-query';

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

type ArqlPayload = { query: string; params: unknown[] };

export function useArqlQuery() {
  return useMutation({
    mutationFn: async (payload: ArqlPayload) => {
      const res = await fetch(BASE_URL + '/query', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }
      return await res.json();
    },
  });
}
