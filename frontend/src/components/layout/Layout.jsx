import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSearch from '../common/GlobalSearch';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsMobile(true);
                setSidebarOpen(false);
            } else {
                setIsMobile(false);
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Toggle search with Ctrl + /
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-main flex">
            {/* Global Search Modal */}
            {/* Global Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <GlobalSearch
                            isOpen={isSearchOpen}
                            onClose={() => setIsSearchOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                isMobile={isMobile}
                setIsMobile={setIsMobile}
            />

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${!isMobile && sidebarOpen ? 'ml-64' : ''}
          ${!isMobile && !sidebarOpen ? 'ml-20' : ''}
        `}
            >
                <Header
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    isMobile={isMobile}
                    onSearchClick={() => setIsSearchOpen(true)}
                />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    <div className="w-full animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
