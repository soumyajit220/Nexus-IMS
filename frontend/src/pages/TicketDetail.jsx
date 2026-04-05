import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TicketDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);

    // Form State
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [resolutionDetails, setResolutionDetails] = useState('');
    const [rootCauseCategory, setRootCauseCategory] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const { data } = await api.get(`/tickets/${id}`);
                setTicket(data);
                // Initialize form state
                setStatus(data.status);
                setPriority(data.priority);
                setResolutionDetails(data.resolutionDetails || '');
                setRootCauseCategory(data.rootCauseCategory || '');
                setAssignedTo(data.assignedTo?._id || '');
            } catch (error) {
                console.error('Error fetching ticket', error);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        const fetchAgents = async () => {
            if (user?.role === 'Admin') {
                try {
                    const { data } = await api.get('/users');
                    setAgents(data.filter(u => u.role === 'Agent'));
                } catch (err) {
                    console.error('Failed to fetch agents', err);
                }
            }
        };

        fetchTicket();
        fetchAgents();
    }, [id, navigate, user?.role]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                status,
                priority,
                resolutionDetails,
                rootCauseCategory,
                ...(assignedTo !== (ticket.assignedTo?._id || '') ? { assignedTo: assignedTo || null } : {})
            };

            await api.put(`/tickets/${id}`, payload);

            // Refresh data
            const { data } = await api.get(`/tickets/${id}`);
            setTicket(data);
            alert('Ticket updated successfully');
        } catch (error) {
            alert('Failed to update ticket');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Ticket Details...</div>;
    if (!ticket) return <div className="p-8 text-center text-danger">Ticket not found</div>;

    const canEdit = ['Admin', 'Agent'].includes(user.role);
    const isSlaBreached = ticket.slaStatus === 'Breached';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Main Content */}
            <div className="lg:col-span-2 space-y-6">

                {/* Header Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                {ticket._id} • {ticket.category}
                            </span>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                                {ticket.title}
                            </h1>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${ticket.status === 'Open' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                            ticket.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                            {ticket.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 border-t border-slate-100 pt-4 mt-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            {ticket.createdBy?.name || 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Description</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {ticket.description}
                    </p>
                </div>

                {/* Activity Feed / Audit Log */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">Activity Timeline</h3>
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                        {ticket.logs?.slice().reverse().map((log, index) => (
                            <div key={index} className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-slate-800 font-medium">{log.action}</span>
                                    <span className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Sidebar & Actions */}
            <div className="space-y-6">

                {/* SLA Panel */}
                {['Admin', 'Agent'].includes(user.role) && (
                    <div className={`p-6 rounded-xl border ${isSlaBreached ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${isSlaBreached ? 'text-danger' : 'text-slate-500'}`}>
                            Service Level Agreement
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-600 font-medium">Status</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${isSlaBreached ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {ticket.slaStatus}
                            </span>
                        </div>
                        {ticket.slaDeadline && (
                            <div className="text-sm text-slate-600">
                                Deadline: {new Date(ticket.slaDeadline).toLocaleString()}
                            </div>
                        )}
                    </div>
                )}

                {/* Metadata Sidebar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase">Priority</span>
                        <div className="mt-1 font-medium text-slate-900">{ticket.priority}</div>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase">Impact</span>
                        <div className="mt-1 font-medium text-slate-900">{ticket.impact || 'N/A'}</div>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase">Department</span>
                        <div className="mt-1 font-medium text-slate-900">{ticket.createdBy?.department || 'General'}</div>
                    </div>
                    <div>
                        <span className="block text-xs font-medium text-slate-500 uppercase">Assigned To</span>
                        <div className="mt-1 flex items-center justify-between text-slate-900">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                                    {ticket.assignedTo?.name?.[0] || '?'}
                                </div>
                                <span className="font-medium">{ticket.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                        </div>

                        {user.role === 'Admin' && (
                            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Admin Controls</h3>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Reassign Ticket</label>
                                    <select 
                                        className="w-full text-sm border-slate-300 rounded-md focus:ring-primary py-1.5"
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {agents.map(ag => (
                                            <option key={ag._id} value={ag._id}>
                                                {ag.name} ({ag.agentId || 'N/A'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Set Priority</label>
                                    <select
                                        className="w-full text-sm border-slate-300 rounded-md focus:ring-primary py-1.5"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleUpdate}
                                    className="w-full mt-2 font-medium py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
                                >
                                    Save Admin Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agent Actions Form */}
                {user.role === 'Agent' && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Agent Actions</h3>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Update Status</label>
                                    <select
                                        className="w-full text-sm border-slate-300 rounded-md focus:ring-primary py-2 disabled:opacity-50 disabled:bg-slate-100"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        disabled={user.role === 'Admin'}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Resolution Field - Highlighted if resolving */}
                            <div className={`transition-all ${status === 'Resolved' ? 'bg-green-50 p-4 rounded-lg border border-green-200' : ''}`}>
                                <label className={`block text-xs font-medium mb-1 ${status === 'Resolved' ? 'text-green-800' : 'text-slate-500'}`}>
                                    {status === 'Resolved' ? 'Resolution Details (Required)' : 'Notes / Resolution'}
                                </label>
                                <textarea
                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-primary h-24 p-2 disabled:opacity-50 disabled:bg-slate-100"
                                    placeholder={status === 'Resolved' ? "Describe steps taken to resolve the issue..." : "Add internal notes or progress steps..."}
                                    value={resolutionDetails}
                                    onChange={(e) => setResolutionDetails(e.target.value)}
                                    required={status === 'Resolved'}
                                    disabled={user.role === 'Admin'}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className={`w-full font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm flex items-center justify-center gap-2
                                    ${status === 'Resolved'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-primary hover:bg-primary-dark text-white'}`}
                            >
                                {status === 'Resolved' ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Resolve Ticket
                                    </>
                                ) : 'Update Ticket'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetail;
