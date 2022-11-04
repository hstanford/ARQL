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

function extractParams(query: string) {
  let outQuery = '';
  const params: unknown[] = [];
  let matching = false;
  let last: string | undefined;
  let param = '';
  for (const char of query) {
    if (matching) {
      if (char === '}') {
        let parsed: unknown;
        try {
          parsed = JSON.parse(param);
        } catch (e) {
          //
        }

        if (parsed !== undefined) {
          params.push(parsed);
          param = '';
          matching = false;
          last = undefined;
          outQuery += params.length;
          continue;
        }
      }
      param += char;
      continue;
    }
    if (char === '{' && last === '$') {
      matching = true;
      continue;
    }

    last = char;
    outQuery += char;
  }
  return { query: outQuery, params };
}

export function useArqlQuery() {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch(BASE_URL + '/query', {
        method: 'POST',
        body: JSON.stringify(extractParams(query)),
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
