import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showSidebar = false }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header
        showSidebar={showSidebar}
        isSidebarOpen={isMobileSidebarOpen}
        onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {showSidebar && (
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 min-w-0 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
