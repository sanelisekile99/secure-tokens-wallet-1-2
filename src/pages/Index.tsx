import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { WalletProvider } from '@/contexts/WalletContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <WalletProvider>
        <AppLayout />
      </WalletProvider>
    </AppProvider>
  );
};

export default Index;
