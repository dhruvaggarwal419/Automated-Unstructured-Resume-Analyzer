import { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, Mail, CheckCircle, LogOut, Building2 } from 'lucide-react';
import { authAPI, resumeAPI } from '../lib/api';

interface RecruiterDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function RecruiterDashboard({ user, onLogout }: RecruiterDashboardProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'pending' | 'sent' | 'verified'>('pending');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    experienceLevel: 'all',
  });

  useEffect(() => {
    // Check if user is already verified
    if (user?.isVerified) {
      setIsVerified(true);
      setVerificationStep('verified');
    }
    if (user?.companyName) {
      setCompanyName(user.companyName);
    }
    if (user?.companyEmail) {
      setCompanyEmail(user.companyEmail);
    }
    if (user?.designation) {
      setDesignation(user.designation);
    }
    if (user?.companyName && user?.companyEmail && user?.designation) {
      setProfileReady(true);
    }
  }, [user]);

  const profileComplete = Boolean(companyName && companyEmail && designation);

  const handleProfileSave = async () => {
    setProfileError('');
    setProfileSaved(false);
    setProfileSaving(true);
    try {
      const response = await authAPI.updateProfile({
        companyName,
        companyEmail,
        designation
      });

      if (response?.message) {
        setProfileSaved(true);
        setProfileReady(true);
      }
    } catch (error: any) {
      setProfileError(error?.message || 'Failed to save profile details');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSendVerification = async () => {
    // TODO: API call to send verification email
    setVerificationStep('sent');
  };

  const handleVerifyCode = async () => {
    // TODO: API call to verify code
    // Mock verification for now
    if (verificationCode.length === 6) {
      setIsVerified(true);
      setVerificationStep('verified');
    }
  };

  const handleSearchCandidates = async () => {
    try {
      const response = await resumeAPI.searchCandidates(
        jobDescription,
        filters.minScore,
        filters.experienceLevel
      );
      
      if (response.resumes) {
        const formattedCandidates = response.resumes.map((resume: any) => ({
          id: resume._id,
          name: resume.userId?.name || 'Anonymous',
          atsScore: resume.analysisResult?.overallScore || 0,
          experience: resume.experienceLevel,
          skills: resume.analysisResult?.keywords || [],
          email: resume.userId?.email || 'N/A',
        }));
        setCandidates(formattedCandidates);
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
    }
  };

  return (
    <div className="min-h-screen bg-atlas">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-white/70">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Recruiter Suite</p>
            <h1 className="text-2xl font-display text-ink">Resume World</h1>
            <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold shadow-lg shadow-black/10 hover:bg-black transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Recruiter Profile */}
        <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <Building2 className="w-14 h-14 text-emerald-700 mx-auto mb-3" />
              <h2 className="text-3xl font-display text-ink mb-2">Complete Recruiter Profile</h2>
              <p className="text-slate-600">Add your company details to unlock recruiter tools.</p>
            </div>

            {profileError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {profileError}
              </div>
            )}

            {profileSaved && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Profile details saved.
              </div>
            )}

            {!profileReady && !profileSaved && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Save your profile to continue to verification.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  placeholder="Resume World Inc."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Company Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent"
                  placeholder="Talent Lead"
                />
              </div>
            </div>

            <button
              onClick={handleProfileSave}
              disabled={profileSaving || !profileComplete}
              className="mt-6 w-full bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-semibold disabled:opacity-70"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Details'}
            </button>
        </div>

        {/* Email Verification */}
        {!isVerified && profileReady && (
          <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <Mail className="w-16 h-16 text-emerald-700 mx-auto mb-4" />
              <h2 className="text-3xl font-display text-ink mb-2">Verify Your Company Email</h2>
              <p className="text-slate-600">
                We need to verify that you're from a valid company
              </p>
            </div>

            {verificationStep === 'pending' && (
              <div className="max-w-md mx-auto">
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Company Email Address
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent mb-4"
                  placeholder="you@company.com"
                />
                <button
                  onClick={handleSendVerification}
                  className="w-full bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-semibold"
                >
                  Send Verification Code
                </button>
              </div>
            )}

            {verificationStep === 'sent' && (
              <div className="max-w-md mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <p className="text-emerald-800 text-sm">
                    ✓ Verification code sent to {companyEmail}
                  </p>
                </div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent mb-4"
                  placeholder="123456"
                  maxLength={6}
                />
                <button
                  onClick={handleVerifyCode}
                  className="w-full bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-semibold"
                >
                  Verify Code
                </button>
              </div>
            )}
          </div>
        )}

        {/* Job Description & Search */}
        {isVerified && (
          <div className="space-y-6">
            <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-display text-ink mb-6">Post Job Description</h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/40 focus:border-transparent mb-4"
                rows={8}
                placeholder="Enter job description, required skills, experience level..."
              />
              <button
                onClick={handleSearchCandidates}
                className="w-full bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Find Matching Candidates
              </button>
            </div>

            {/* Filters */}
            {candidates.length > 0 && (
              <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-6">
                <div className="flex items-center gap-4">
                  <Filter className="w-5 h-5 text-slate-600" />
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-600 mb-1">Min ATS Score</label>
                      <input
                        type="number"
                        value={filters.minScore}
                        onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-full"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-600 mb-1">Experience Level</label>
                      <select
                        value={filters.experienceLevel}
                        onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-full"
                      >
                        <option value="all">All Levels</option>
                        <option value="fresher">Fresher</option>
                        <option value="experienced">Experienced</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Candidates List */}
            {candidates.length > 0 && (
              <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
                <h2 className="text-2xl font-display text-ink mb-6">
                  Matching Candidates (Ranked by ATS Score)
                </h2>
                <div className="space-y-4">
                  {candidates
                    .filter(c => c.atsScore >= filters.minScore)
                    .sort((a, b) => b.atsScore - a.atsScore)
                    .map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className="border border-slate-200 rounded-2xl p-6 hover:border-emerald-400 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-emerald-100 text-emerald-800 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-ink">{candidate.name}</h3>
                              <p className="text-slate-600">{candidate.email}</p>
                              <p className="text-sm text-slate-500 mt-1">
                                Experience: {candidate.experience}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl px-4 py-2">
                              <p className="text-sm">ATS Score</p>
                              <p className="text-3xl font-bold">{candidate.atsScore}%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {candidate.skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 bg-emerald-700 text-white py-2 rounded-full hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Contact Candidate
                          </button>
                          <button className="px-4 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                            View Full Profile
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {candidates.length === 0 && jobDescription && (
              <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-12 text-center">
                <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No candidates found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
