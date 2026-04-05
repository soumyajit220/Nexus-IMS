import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Tickets = () => {
    const { user } = useAuth();
    if (user?.role === 'User') {
        return <Navigate to="/dashboard" replace />;
    }

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data } = await api.get('/tickets');
                setTickets(data);
            } catch (error) {
                console.error('Error fetching tickets', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const filteredTickets = filter === 'All'
        ? tickets
        : filter === 'Mine'
            ? tickets.filter(t => t.assignedTo?._id === user?._id)
            : tickets.filter(t => t.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-slate-100 text-slate-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-slate-200 text-slate-600';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
                    <p className="text-slate-500">Manage and track all incidents</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(user.role === 'Admin' ? ['All', 'Open', 'In Progress', 'Resolved', 'Closed'] : ['All', 'Mine', 'Open', 'In Progress', 'Resolved', 'Closed']).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-slate-400 mb-2 text-lg">No tickets found</div>
                        <p className="text-slate-500 text-sm">Try adjusting your filters or create a new one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredTickets.map(ticket => (
                                    <tr key={ticket._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{ticket.title}</div>
                                            <div className="text-xs text-slate-500">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {ticket.priority}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {ticket.assignedTo?._id === user?._id ? (
                                                <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-md text-xs border border-indigo-200 shadow-sm">You</span>
                                            ) : (
                                                <span className="text-slate-600">{ticket.assignedTo?.name || 'Unassigned'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {ticket.createdBy?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/ticket/${ticket._id}`} className="text-primary hover:text-primary-dark text-sm font-medium">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tickets;
