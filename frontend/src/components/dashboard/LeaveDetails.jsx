import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { name: 'Casual Leave', value: 4, color: '#3b82f6' },
    { name: 'Sick Leave', value: 2, color: '#ef4444' },
    { name: 'Privilege Leave', value: 6, color: '#10b981' },
    { name: 'Remaining', value: 8, color: '#374151' },
];

const LeaveDetails = () => {
    return (
        <div className="card glass">
            <h3 className="text-lg font-bold text-text-main mb-4">Leave Details</h3>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-3xl font-bold text-text-main">12</p>
                    <p className="text-xs text-text-muted">Total Leaves</p>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {data.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-text-muted">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaveDetails;
