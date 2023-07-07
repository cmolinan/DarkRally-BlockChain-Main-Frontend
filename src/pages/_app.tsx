import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { createPublicClient, http } from 'viem';
import { createConfig, mainnet, WagmiConfig } from 'wagmi';

import '@/styles/globals.css';
// !STARTERCONF This is for demo purposes, remove @/styles/colors.css import immediately
import '@/styles/colors.css';

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});
/* * !STARTERCONF info
 * ? `Layout` component is called in every page using `np` snippets. If you have consistent layout across all page, you can add it here too
 */

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <div className='h-screen w-screen'>
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </WagmiConfig>
  );
}

export default MyApp;
