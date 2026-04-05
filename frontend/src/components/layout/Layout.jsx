import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSearch from '../common/GlobalSearch';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen text-text-main flex relative overflow-hidden"
             style={{ background: 'var(--bg-primary)' }}>

            {/* ─── Floating glow orbs (3D glass ambiance) ─── */}
            <div className="glow-orb glow-orb-1" />
            <div className="glow-orb glow-orb-2" />
            <div className="glow-orb glow-orb-3" />

            {/* Global Search Modal */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-20"
                    style={{ background: 'rgba(6,11,26,0.75)', backdropFilter: 'blur(12px)' }}
                    onClick={() => setIsSearchOpen(false)}
                >
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
                  ${!isMobile && sidebarOpen  ? 'ml-64' : ''}
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
