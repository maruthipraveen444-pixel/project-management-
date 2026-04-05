import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Bug, Clock } from 'lucide-react';

const IssueStats = () => {
    const [stats, setStats] = useState({
        totalOpen: 0,
        criticalBugs: 0,
        teamStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/issues/stats', { withCredentials: true });
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching issue stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="animate-pulse h-32 bg-surface rounded-xl" />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border flex items-center justify-between">
                <div>
                    <h3 className="text-text-muted text-sm font-medium">Total Open Issues</h3>
                    <p className="text-3xl font-bold text-text-main mt-2">{stats.totalOpen}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-500" />
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border flex items-center justify-between">
                <div>
                    <h3 className="text-text-muted text-sm font-medium">Critical Bugs</h3>
                    <p className="text-3xl font-bold text-text-main mt-2">{stats.criticalBugs}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
            </div>
            {/* Can add more stats here, keeping it to 2 main cards + maybe team breakdown if needed or requested */}
            <div className="bg-card p-6 rounded-xl border border-border flex items-center justify-between md:col-span-2">
                <div className="w-full">
                    <h3 className="text-text-muted text-sm font-medium mb-3">Team Assignment Overview</h3>
                    {stats.teamStats.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {stats.teamStats.map((item) => (
                                item.assignedTo && (
                                    <div key={item._id} className="flex flex-col items-center min-w-[60px]">
                                        {/* Since we only have ID in aggregation for simple grouping, we'd need populate or lookup.
                                            For simplicity, we'll skip avatar for now or fetch full user details if needed.
                                            The backend sent { _id: "UserId", count: 5 }.
                                            Ideally backend should lookup name. I'll stick to simple counts for now or fix backend if critical.
                                            Actually, let's keep it simple: Just show counts.
                                         */}
                                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs text-text-muted">
                                            {item.count}
                                        </div>
                                        <span className="text-xs text-text-muted mt-1">Issues</span>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted">No assigned issues</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueStats;
