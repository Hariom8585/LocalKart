import React, { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { CartProvider } from '../context/CartContext';
import { QuickRoleBar } from '../components/layout/QuickRoleBar';
import { LocationModal } from '../components/layout/LocationModal';
import { CartDrawer } from '../components/customer/CartDrawer';
import { MultiShopConflictModal } from '../components/customer/MultiShopConflictModal';
import { SearchModal } from '../components/customer/SearchModal';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <Head>
            <title>LocalKart - Your Local Shops. Delivered Today.</title>
            <meta name="description" content="Shop from trusted local neighborhood stores and get fast same-day doorstep delivery across Ludhiana, Chandigarh, Delhi NCR, and Indian cities." />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛍️</text></svg>" />
          </Head>

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <QuickRoleBar />
            <Component {...pageProps} onOpenSearch={() => setIsSearchOpen(true)} />
            
            {/* Global Modals & Overlays */}
            <LocationModal />
            <CartDrawer />
            <MultiShopConflictModal />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </div>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
