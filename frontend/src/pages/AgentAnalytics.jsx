import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#14B8A6'];

const RANGE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
];

const AgentAnalytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: result } = await api.get(`/analytics/agent-analytics?range=${range}`);
                setData(result);
            } catch (error) {
                console.error('Error fetching agent analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && ['Admin', 'Agent'].includes(user.role)) {
            fetchData();
        }
    }, [user, range]);

    if (!['Admin', 'Agent'].includes(user?.role)) {
        return <div className="p-8 text-center text-danger font-medium">Access Denied</div>;
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Loading Agent Analytics...</p>
            </div>
        );
    }

    const agents = data?.agents || [];
    const timeline = data?.activityTimeline || [];

    // Chart 1: Agent Workload (total assigned)
    const workloadData = agents.map(a => ({
        name: a.name,
        'Total Assigned': a.totalAssigned,
    }));

    // Chart 2: Avg Resolution Time
    const resolutionData = agents.map(a => ({
        name: a.name,
        'Avg Hours': a.avgResolutionTime,
    }));

    // Chart 3: Resolved vs Active (Stacked)
    const resolvedActiveData = agents.map(a => ({
        name: a.name,
        Resolved: a.resolvedCount,
        Active: a.activeCount,
        Pending: a.pendingCount,
    }));

    // Chart 4: Activity Timeline (area chart - aggregate by date)
    const timelineMap = {};
    timeline.forEach(item => {
        if (!timelineMap[item.date]) {
            timelineMap[item.date] = { date: item.date };
        }
        timelineMap[item.date][item.agentName] = (timelineMap[item.date][item.agentName] || 0) + item.count;
    });
    const timelineData = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));
    const agentNames = [...new Set(timeline.map(t => t.agentName))];

    // Chart 5: Performance Radar
    const maxResTime = Math.max(...agents.map(a => a.avgResolutionTime), 1);
    const maxWorkload = Math.max(...agents.map(a => a.totalAssigned), 1);
    const maxActivity = Math.max(...agents.map(a => a.activityCount), 1);

    const radarData = agents.map(a => {
        const resolutionRate = a.totalAssigned > 0 ? Math.round((a.resolvedCount / a.totalAssigned) * 100) : 0;
        const speed = Math.round(((maxResTime - a.avgResolutionTime) / maxResTime) * 100);
        const workloadShare = Math.round((a.totalAssigned / maxWorkload) * 100);
        const activityScore = Math.round((a.activityCount / maxActivity) * 100);

        return {
            name: a.name,
            'Resolution Rate': resolutionRate,
            'Speed': Math.max(speed, 0),
            'SLA Compliance': a.slaCompliance,
            'Workload': workloadShare,
            'Activity': activityScore,
        };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
                    <p className="font-semibold text-slate-800 mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-xs">
                            {entry.name}: <span className="font-semibold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Agent Analytics</h1>
                    <p className="text-slate-500">Comprehensive agent performance metrics & insights</p>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Total Agents</div>
                    <div className="text-3xl font-bold text-slate-800 mt-1">{agents.length}</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Tickets Resolved</div>
                    <div className="text-3xl font-bold text-green-600 mt-1">{agents.reduce((s, a) => s + a.resolvedCount, 0)}</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Active Tickets</div>
                    <div className="text-3xl font-bold text-orange-600 mt-1">{agents.reduce((s, a) => s + a.activeCount, 0)}</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Avg SLA Compliance</div>
                    <div className="text-3xl font-bold text-blue-600 mt-1">
                        {agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.slaCompliance, 0) / agents.length) : 0}%
                    </div>
                </div>
            </div>

            {/* Charts Row 1: Workload + Resolution Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Workload */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Agent Workload Distribution</h3>
                    {workloadData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={workloadData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="Total Assigned" radius={[6, 6, 0, 0]}>
                                    {workloadData.map((entry, index) => (
                                        <Cell key={`wl-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No agents found</div>
                    )}
                </div>

                {/* Avg Resolution Time */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Average Resolution Time (Hours)</h3>
                    {resolutionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={resolutionData} layout="vertical" barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="Avg Hours" radius={[0, 6, 6, 0]}>
                                    {resolutionData.map((entry, index) => (
                                        <Cell key={`rt-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No data available</div>
                    )}
                </div>
            </div>

            {/* Charts Row 2: Resolved vs Active + Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resolved vs Active Stacked Bar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Tickets: Resolved vs Active vs Pending</h3>
                    {resolvedActiveData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={resolvedActiveData} barSize={35}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} />
                                <Bar dataKey="Resolved" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Active" stackId="a" fill="#F59E0B" />
                                <Bar dataKey="Pending" stackId="a" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No data available</div>
                    )}
                </div>

                {/* Activity Timeline */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Agent Activity (Last 30 Days)</h3>
                    {timelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    tickFormatter={(val) => val.slice(5)}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} />
                                {agentNames.map((name, index) => (
                                    <Area
                                        key={name}
                                        type="monotone"
                                        dataKey={name}
                                        stackId="1"
                                        stroke={COLORS[index % COLORS.length]}
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={0.3}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No activity data yet</div>
                    )}
                </div>
            </div>

            {/* Charts Row 3: Performance Radar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Agent Performance Scorecard</h3>
                {radarData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {radarData.map((agent, index) => (
                            <div key={agent.name} className="border border-slate-100 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-slate-700 text-center mb-2">{agent.name}</h4>
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={[
                                        { metric: 'Resolution', value: agent['Resolution Rate'] },
                                        { metric: 'Speed', value: agent['Speed'] },
                                        { metric: 'SLA', value: agent['SLA Compliance'] },
                                        { metric: 'Workload', value: agent['Workload'] },
                                        { metric: 'Activity', value: agent['Activity'] },
                                    ]}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Radar
                                            dataKey="value"
                                            stroke={COLORS[index % COLORS.length]}
                                            fill={COLORS[index % COLORS.length]}
                                            fillOpacity={0.25}
                                            strokeWidth={2}
                                        />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">No agent data available</div>
                )}
            </div>

            {/* Agent Details Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Agent Performance Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Agent</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Active</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Time (hrs)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">SLA Compliance</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {agents.map(agent => (
                                <tr key={agent._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                                                {agent.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{agent.name}</div>
                                                <div className="text-xs text-slate-500">{agent.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">{agent.totalAssigned}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                            {agent.resolvedCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                            {agent.activeCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-700">{agent.avgResolutionTime}h</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 bg-slate-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${agent.slaCompliance >= 80 ? 'bg-green-500' : agent.slaCompliance >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${agent.slaCompliance}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">{agent.slaCompliance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-600">{agent.activityCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {agents.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No agent data available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentAnalytics;
