import { useState, useEffect, useRef } from 'react';
import { Search, X, Folder, FileText, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ projects: [], tasks: [], users: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch();
            } else {
                setResults({ projects: [], tasks: [], users: [] });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
            if (data.success) {
                setResults(data.data);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search projects, tasks..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="w-64 md:w-80 bg-surface border border-border text-text-main pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-text-muted"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full md:w-96 right-0 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-text-muted text-sm">Searching...</div>
                    ) : (
                        <>
                            {/* Projects */}
                            {results.projects?.length > 0 && (
                                <div className="p-2">
                                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Projects</div>
                                    {results.projects.map(project => (
                                        <div
                                            key={project._id}
                                            onClick={() => handleNavigate(`/projects/${project._id}`)}
                                            className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg cursor-pointer group"
                                        >
                                            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                                                <Folder size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm text-text-main group-hover:text-primary-400 transition-colors">{project.name}</div>
                                                <div className="text-xs text-text-muted">{project.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tasks */}
                            {results.tasks?.length > 0 && (
                                <div className="p-2 border-t border-border/50">
                                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Tasks</div>
                                    {results.tasks.map(task => (
                                        <div
                                            key={task._id}
                                            onClick={() => handleNavigate(`/projects/${task.project}/tasks`)}
                                            className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg cursor-pointer group"
                                        >
                                            <div className="p-1.5 bg-green-500/10 text-green-400 rounded-lg">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm text-text-main group-hover:text-primary-400 transition-colors">{task.title}</div>
                                                <div className="text-xs text-text-muted">{task.status} • {task.priority}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* People */}
                            {results.users?.length > 0 && (
                                <div className="p-2 border-t border-border/50">
                                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">People</div>
                                    {results.users.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleNavigate(`/team/${user._id}`)}
                                            className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg cursor-pointer group"
                                        >
                                            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm text-text-main group-hover:text-primary-400 transition-colors">{user.name}</div>
                                                <div className="text-xs text-text-muted">{user.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {(!results.projects?.length && !results.tasks?.length && !results.users?.length) && (
                                <div className="p-6 text-center">
                                    <p className="text-text-muted text-sm">No results found for "{query}"</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
