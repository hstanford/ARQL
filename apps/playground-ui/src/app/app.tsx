import styled from '@emotion/styled';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './layout';
import { Source } from './source';

const StyledApp = styled.div`
  // Your style here
`;

const queryClient = new QueryClient();

export function App() {
  return (
    <StyledApp>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Routes>
            <Route path="/" element={<div>Welcome</div>} />
            <Route path="/query" element={<div>QUERY</div>} />
            <Route path="/sources/:name" element={<Source />} />
          </Routes>
        </Layout>
      </QueryClientProvider>
    </StyledApp>
  );
}

export default App;
