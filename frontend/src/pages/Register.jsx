import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'User',
        department: '',
        jobTitle: ''
    });

    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await register(formData.name, formData.email, formData.password, formData.role, formData.department, formData.jobTitle);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Visual Side */}
                <div className="md:w-5/12 bg-slate-800/50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-6">N</div>
                    <h3 className="text-2xl font-bold text-white mb-4">Join NexusIMS</h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        Create your corporate account to report incidents, track SLAs, and streamline your workflow.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Real-time Updates
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Smart Auto-Triage
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Enterprise Security
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="md:w-7/12 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

                    {error && <div className="mb-4 bg-red-500/20 border border-red-500/50 p-3 rounded text-red-200 text-xs">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Role</label>
                                <select
                                    name="role"
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="User">End User</option>
                                    <option value="Agent">Support Agent</option>
                                    <option value="Admin">System Admin</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/30"
                        >
                            {loading ? 'Creating...' : 'Register Account'}
                        </button>
                    </form>

                    <div className="mt-4 text-center text-xs">
                        <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                            Already have an account? <span className="text-blue-400">Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
