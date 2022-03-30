import React from 'react';
import { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import '../styles/globals.scss'
import Layout from '../src/components/layout/Layout'

const queryClient = new QueryClient();

const App = ({ Component, pageProps }: AppProps) => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </QueryClientProvider>
);

export default App;
