import React, { useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon, X, PanelLeft } from 'lucide-react';
import gsap from 'gsap';

interface HeaderProps {
  showSidebar?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showSidebar = false,
  isSidebarOpen = false,
  onToggleSidebar,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current!, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2">
        {/* Left side: Brand + Mobile Sidebar Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
              aria-label={isSidebarOpen ? 'Close audit history' : 'Open audit history'}
              title={isSidebarOpen ? 'Close audit history' : 'Open audit history'}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0 border border-neutral-200">
              <img
                src="/b9ff45e8-1230-4597-aa59-50ec6193b39d.webp"
                alt="CiteVerify Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-bold text-black tracking-tight">
                Cite<span className="text-neutral-500">Verify</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                AI Academic Auditor
              </span>
            </div>
          </Link>
        </div>

        {/* Right side: Navigation & Auth */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link
                to="/dashboard"
                className="text-xs sm:text-sm font-medium text-neutral-700 hover:text-black transition-colors px-2 py-1.5 rounded-lg hover:bg-neutral-100"
              >
                Dashboard
              </Link>
              <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-700 bg-neutral-100 px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-200 max-w-[110px] sm:max-w-[180px]">
                <UserIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="font-medium text-neutral-900 truncate">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-200 transition-colors cursor-pointer shrink-0"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-neutral-700 hover:text-black transition-colors px-2.5 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-xs sm:text-sm font-medium text-white bg-black hover:bg-neutral-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-2xs transition-colors shrink-0"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
