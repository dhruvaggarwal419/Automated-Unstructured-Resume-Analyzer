
import { FileText, Briefcase, Shield, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onRoleSelect: (role: 'user' | 'recruiter' | 'admin') => void;
}

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-atlas flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-5xl text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-800">
          <Sparkles className="h-4 w-4" />
          Crafted resumes
        </div>
        <h1 className="mt-6 text-5xl md:text-6xl font-display text-ink">
          Resume World
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Choose your role to unlock a refined, AI-powered hiring experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Resume User Card */}
        <div 
          onClick={() => onRoleSelect('user')}
          className="group rounded-3xl border border-white/70 bg-white/90 backdrop-blur p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-50 p-6 rounded-full">
              <FileText className="w-16 h-16 text-emerald-700" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-ink mb-3 text-center">Resume User</h2>
          <p className="text-slate-600 text-center mb-4">
            Upload and optimize your resume with AI-powered analysis
          </p>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>• Detailed ATS scoring</li>
            <li>• Refined improvement notes</li>
            <li>• Seamless recruiter sharing</li>
            <li>• Progress tracking</li>
          </ul>
        </div>

        {/* Recruiter Card */}
        <div 
          onClick={() => onRoleSelect('recruiter')}
          className="group rounded-3xl border border-white/70 bg-white/90 backdrop-blur p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-amber-50 p-6 rounded-full">
              <Briefcase className="w-16 h-16 text-amber-700" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-ink mb-3 text-center">Recruiter</h2>
          <p className="text-slate-600 text-center mb-4">
            Find the best candidates with AI-powered matching
          </p>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>• Post curated job specs</li>
            <li>• Ranked candidate shortlist</li>
            <li>• ATS score filtering</li>
            <li>• Company verification</li>
          </ul>
        </div>

        {/* Admin Card */}
        <div 
          onClick={() => onRoleSelect('admin')}
          className="group rounded-3xl border border-white/70 bg-white/90 backdrop-blur p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-rose-50 p-6 rounded-full">
              <Shield className="w-16 h-16 text-rose-700" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-ink mb-3 text-center">Admin</h2>
          <p className="text-slate-600 text-center mb-4">
            Manage platform users and maintain system integrity
          </p>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>• User management</li>
            <li>• Admin access control</li>
            <li>• Activity monitoring</li>
            <li>• Full system control</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center text-slate-500 text-sm">
        <p>AI guided. Secure. Crafted for clarity.</p>
      </div>
    </div>
  );
}
