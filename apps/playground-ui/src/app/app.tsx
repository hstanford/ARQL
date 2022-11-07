import styled from '@emotion/styled';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { Welcome } from './components/welcome';
import { Layout } from './layout';
import { Query } from './query';
import { Source } from './source';

const StyledApp = styled.div`
  height: 100%;
`;

const queryClient = new QueryClient();

export function App() {
  return (
    <StyledApp>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/query" element={<Query />} />
            <Route path="/sources/:name" element={<Source />} />
          </Routes>
        </Layout>
      </QueryClientProvider>
    </StyledApp>
  );
}

export default App;
