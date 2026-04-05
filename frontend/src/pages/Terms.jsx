import { Link } from 'react-router-dom';

const Terms = () => {
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
                    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                    <p className="text-slate-500 mb-8 border-b pb-4">Effective Date: January 1, 2026</p>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">1. Acceptance of Terms</h2>
                            <p>By accessing or using the NexusIMS platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you may not use the platform.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">2. Acceptable Use</h2>
                            <p>You agree to use the platform only for legitimate internal business purposes related to incident management. You must not attempt to bypass security features, compromise the integrity of the system, or upload malicious content.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">3. Service Level Agreements (SLAs)</h2>
                            <p>While the system calculates SLAs based on priority, these are internal targets and do not constitute a legal guarantee of service availability unless specified in a separate enterprise contract.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">4. Account Responsibilities</h2>
                            <p>You are responsible for maintaining the confidentiality of your credentials. Any actions performed under your account are logged and attributed to you.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">5. Termination</h2>
                            <p>We reserve the right to suspend or terminate access for any user who violates these terms or poses a security risk to the organization.</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Terms;
