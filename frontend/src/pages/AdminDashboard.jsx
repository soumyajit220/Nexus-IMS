import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
const SLA_COLORS = { 'On Track': '#10B981', 'Warning': '#F59E0B', 'Breached': '#EF4444', 'N/A': '#94A3B8' };

const RANGE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('all');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/analytics/dashboard?range=${range}`);
                setStats(data);
            } catch (error) {
                console.error('Error fetching analytics', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && ['Admin', 'Agent'].includes(user.role)) {
            fetchStats();
        }
    }, [user, range]);

    if (!['Admin', 'Agent'].includes(user?.role)) {
        return <div className="p-8 text-center text-danger">Access Denied</div>;
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading System Analytics...</div>;

    // Prepare chart data
    const categoryData = stats?.categoryStats
        ? Object.entries(stats.categoryStats).map(([name, value]) => ({ name, value }))
        : [];
    const slaData = stats?.slaStats
        ? Object.entries(stats.slaStats).map(([name, value]) => ({ name, value }))
        : [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
                    <p className="text-slate-500">Real-time performance metrics</p>
                </div>
                <div className="text-sm text-slate-400">
                    Last Updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-2">Period:</span>
                {RANGE_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setRange(opt.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${range === opt.value
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tickets"
                    value={stats?.totalTickets || 0}
                    icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Critical Issues"
                    value={stats?.priorityStats?.['Critical'] || 0}
                    icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                    color="bg-red-50"
                />
                <StatCard
                    title="SLA Breached"
                    value={stats?.slaStats?.['Breached'] || 0}
                    icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    color="bg-orange-50"
                />
                <StatCard
                    title="Resolved"
                    value={stats?.statusCounts?.['Resolved'] || 0}
                    icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    color="bg-green-50"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Category Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Incidents by Category</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Legend iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">No category data for this period</div>
                    )}
                </div>

                {/* SLA Compliance Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">SLA Compliance</h3>
                    {slaData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={slaData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {slaData.map((entry, index) => (
                                        <Cell key={`sla-${index}`} fill={SLA_COLORS[entry.name] || '#94A3B8'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Legend iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">No SLA data for this period</div>
                    )}
                </div>

            </div>

            {/* Priority & Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Priority Breakdown</h3>
                    <div className="space-y-4">
                        {['Critical', 'High', 'Medium', 'Low'].map(priority => {
                            const count = stats?.priorityStats?.[priority] || 0;
                            const percent = stats?.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0;
                            const colors = {
                                Critical: 'bg-red-500',
                                High: 'bg-orange-500',
                                Medium: 'bg-blue-500',
                                Low: 'bg-slate-400'
                            };
                            return (
                                <div key={priority}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">{priority}</span>
                                        <span className="font-semibold text-slate-900">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className={`${colors[priority]} h-2 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Status Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'].map(status => {
                            const count = stats?.statusCounts?.[status] || 0;
                            const colors = {
                                Open: 'bg-slate-100 text-slate-700 border-slate-200',
                                'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
                                Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                Resolved: 'bg-green-50 text-green-700 border-green-100',
                                Closed: 'bg-slate-50 text-slate-600 border-slate-200'
                            };
                            return (
                                <div key={status} className={`p-4 rounded-lg border ${colors[status]}`}>
                                    <div className="text-2xl font-bold">{count}</div>
                                    <div className="text-xs uppercase font-medium">{status}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
