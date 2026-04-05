import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
const URGENCY_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const RANGE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [ticketRes, statsRes] = await Promise.all([
                    api.get('/tickets'),
                    ['Admin', 'Agent'].includes(user.role) ? api.get(`/analytics/dashboard?range=${range}`) : Promise.resolve({ data: null })
                ]);

                setTickets(ticketRes.data);
                if (statsRes.data) setStats(statsRes.data);

            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.role, range]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-slate-100 text-slate-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-slate-200 text-slate-600';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            'Low': 'bg-slate-100 text-slate-600',
            'Medium': 'bg-blue-50 text-blue-600',
            'High': 'bg-orange-50 text-orange-600',
            'Critical': 'bg-red-50 text-red-600 border border-red-100'
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[priority]}`}>{priority}</span>;
    };

    // Prepare chart data
    const categoryData = stats?.categoryStats
        ? Object.entries(stats.categoryStats).map(([name, value]) => ({ name, value }))
        : [];
    const urgencyData = stats?.urgencyStats
        ? Object.entries(stats.urgencyStats).map(([name, value]) => ({ name, value }))
        : [];

    const renderCustomLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview of incident operations</p>
                </div>
                {user.role === 'User' && (
                    <Link to="/new-ticket" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
                        + Report Incident
                    </Link>
                )}
            </div>

            {/* Time-Range Filter (Admin/Agent) */}
            {['Admin', 'Agent'].includes(user.role) && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500 mr-2">Filter:</span>
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
            )}

            {/* Stats Area (Admin/Agent) */}
            {['Admin', 'Agent'].includes(user.role) && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Incidents"
                        value={stats.totalTickets}
                        icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>}
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Open Tickets"
                        value={stats.statusCounts?.['Open'] || 0}
                        icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        color="bg-orange-50"
                    />
                    <StatCard
                        title="SLA Breached"
                        value={stats.slaStats?.['Breached'] || 0}
                        icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                        color="bg-red-50"
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.statusCounts?.['Resolved'] || 0}
                        icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        color="bg-green-50"
                    />
                </div>
            )}

            {/* Mini Charts (Admin Only) */}
            {user.role === 'Admin' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Incidents by Category</h3>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={renderCustomLabel}
                                        labelLine={false}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" iconSize={8} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No data for this period</div>
                        )}
                    </div>

                    {/* Urgency Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Incidents by Urgency</h3>
                        {urgencyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={urgencyData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={renderCustomLabel}
                                        labelLine={false}
                                    >
                                        {urgencyData.map((entry, index) => (
                                            <Cell key={`urg-${index}`} fill={URGENCY_COLORS[index % URGENCY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" iconSize={8} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No data for this period</div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content: Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">
                        {user.role === 'User' ? 'My Recent Tickets' : 'Incident Queue'}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                                {['Admin', 'Agent'].includes(user.role) && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SLA</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assignee</th>
                                    </>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {tickets.map(ticket => (
                                <tr key={ticket._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">{ticket.title}</span>
                                            <span className="text-xs text-slate-500">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getPriorityBadge(ticket.priority)}
                                    </td>
                                    {['Admin', 'Agent'].includes(user.role) && (
                                        <>
                                            <td className="px-6 py-4">
                                                <div className={`text-xs font-medium ${ticket.slaStatus === 'Breached' ? 'text-danger' : 'text-slate-600'}`}>
                                                    {ticket.slaStatus}
                                                </div>
                                                {ticket.slaDeadline && (
                                                    <div className="text-xs text-slate-400">
                                                        Due: {new Date(ticket.slaDeadline).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {ticket.assignedTo?.name || 'Unassigned'}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/ticket/${ticket._id}`}
                                            className="text-primary hover:text-primary-dark text-sm font-medium hover:underline"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {tickets.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No active tickets found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
