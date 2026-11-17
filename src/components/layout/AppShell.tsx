'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from '@/components/global/GlobalSearchModal';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';
import { ToastProvider } from '@/components/ui/Toast';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-[#FBFBF9] text-[#1A1A18]">
        {/* Desktop Sidebar */}
        <Sidebar onOpenQuickCreate={() => setIsQuickCreateOpen(true)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
            onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
            {children}
          </main>
        </div>

        {/* Mobile Navigation and Menu */}
        <MobileNav
          isMenuOpen={isMobileMenuOpen}
          onCloseMenu={() => setIsMobileMenuOpen(false)}
          onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
        />

        {/* Global Search Dialog (Cmd+K) */}
        <GlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
        />

        {/* Quick Create Dialog */}
        <QuickCreateModal
          isOpen={isQuickCreateOpen}
          onClose={() => setIsQuickCreateOpen(false)}
        />
      </div>
    </ToastProvider>
  );
};
