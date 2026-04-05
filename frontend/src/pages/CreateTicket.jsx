import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CreateTicket = () => {
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General',
        impact: 'Low',
        urgency: 'Medium'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tickets', formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Report New Incident</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                {error && <div className="bg-red-50 text-danger p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                        <input
                            type="text"
                            name="title"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Outlook keeps crashing"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                name="category"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="General">General</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Network">Network</option>
                                <option value="Access">Access/Auth</option>
                            </select>
                        </div>

                        {/* Impact */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Business Impact</label>
                            <select
                                name="impact"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.impact}
                                onChange={handleChange}
                            >
                                <option value="Low">Low (One User)</option>
                                <option value="Medium">Medium (Department)</option>
                                <option value="High">High (Whole Site)</option>
                                <option value="Critical">Critical (Company Wide)</option>
                            </select>
                        </div>

                        {/* Urgency */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                            <select
                                name="urgency"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.urgency}
                                onChange={handleChange}
                            >
                                <option value="Low">Low (Can wait)</option>
                                <option value="Medium">Medium (Need fix today)</option>
                                <option value="High">High (Work stopped)</option>
                            </select>
                        </div>
                    </div>

                    {/* AI Note */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-sm text-blue-800">
                            <strong>AI Analysis:</strong> Our system will automatically analyze your description to set the final technical priority.
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                        <textarea
                            name="description"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none h-40"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Please describe the issue in detail, including any error messages..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-lg font-bold shadow-sm transition-all transform active:scale-95"
                        >
                            {loading ? 'Submitting...' : 'Submit Incident'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
