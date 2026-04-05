import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tight">Nexus<span className="text-blue-600">IMS</span></Link>
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">Back to Home</Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                    <p className="text-slate-500 mb-8 border-b pb-4">Last Updated: February 2, 2026</p>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">1. Information Collection</h2>
                            <p>We collect information you provide directly to us when you create an account, report an incident, or communicate with our support team. This may include your name, email address, department, and job title.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">2. Incident Data Usage</h2>
                            <p>Data submitted in incident reports is used solely for the purpose of resolving technical issues, tracking SLAs, and generating internal performance analytics. We do not share operational data with third parties.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">3. Data Security</h2>
                            <p>We employ enterprise-grade security measures including encryption at rest and in transit, strict role-based access control (RBAC), and immutable audit logging to protect your data.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">4. Cookies & Tracking</h2>
                            <p>We use essential cookies to maintain your authenticated session. We do not use advertising or third-party tracking cookies.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
