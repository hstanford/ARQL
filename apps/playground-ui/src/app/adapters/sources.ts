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

export function useArqlQuery() {
  return useMutation({
    mutationFn: async (query: string) => {
      const params: unknown[] = [];
      let newQuery = '';
      let matching = false;
      let justSawDollar = false;
      let variable = '';
      for (const char of query) {
        if (matching && char !== '}') {
          variable += char;
        } else if (matching && char === '}') {
          matching = false;
          params.push(variable);
          variable = '';
          newQuery += params.length;
        } else if (justSawDollar && char === '{') {
          matching = true;
          justSawDollar = false;
        } else if (justSawDollar) {
          throw new Error('Invalid use of "$"');
        } else if (char === '$') {
          justSawDollar = true;
          newQuery += char;
        } else {
          newQuery += char;
        }
      }
      const res = await fetch(BASE_URL + '/query', {
        method: 'POST',
        body: JSON.stringify({ query: newQuery, params }),
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
