import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, AlertCircle, CheckCircle, LogOut, History, Share2 } from 'lucide-react';
import { resumeAPI } from '../lib/api';

interface ResumeUserDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function ResumeUserDashboard({ user, onLogout }: ResumeUserDashboardProps) {
  const [currentStep, setCurrentStep] = useState<'experience' | 'jobSwitch' | 'upload' | 'share' | 'analysis' | 'history'>('experience');
  const [hasExperience, setHasExperience] = useState<boolean | null>(null);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isJobSwitch, setIsJobSwitch] = useState<boolean | null>(null);
  const [jobSwitchReason, setJobSwitchReason] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [shareWithRecruiters, setShareWithRecruiters] = useState<boolean | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [resumeHistory, setResumeHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleExperienceSelection = (hasExp: boolean) => {
    setHasExperience(hasExp);
    if (hasExp) {
      setCurrentStep('jobSwitch');
    } else {
      setExperienceLevel('fresher');
      setCurrentStep('upload');
    }
  };

  const handleJobSwitchSelection = (isSwitch: boolean, level: string) => {
    setIsJobSwitch(isSwitch);
    setExperienceLevel(level);
    setCurrentStep('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
      setCurrentStep('share');
    }
  };

  const handleShareSelection = async (share: boolean) => {
    setShareWithRecruiters(share);
    setCurrentStep('analysis');
    await analyzeResume(share);
  };

  const analyzeResume = async (share: boolean) => {
    if (!resume) return;

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('experienceLevel', experienceLevel);
      formData.append('isJobSwitch', String(isJobSwitch));
      formData.append('jobSwitchReason', jobSwitchReason);
      formData.append('shareWithRecruiters', String(share));

      const result = await resumeAPI.upload(formData);
      
      if (result.analysis) {
        setAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await resumeAPI.getHistory();
      if (response.resumes) {
        setResumeHistory(response.resumes);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  return (
    <div className="min-h-screen bg-atlas">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-white/70">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Resume Suite</p>
            <h1 className="text-2xl font-display text-ink">Resume World</h1>
            <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <History className="w-5 h-5" />
              History
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold shadow-lg shadow-black/10 hover:bg-black transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Experience Question */}
        {currentStep === 'experience' && (
          <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-display text-ink mb-6 text-center">
              Do you have work experience?
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => handleExperienceSelection(true)}
                className="p-8 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/60 transition-all"
              >
                <CheckCircle className="w-12 h-12 text-emerald-700 mx-auto mb-4" />
                <p className="text-xl font-semibold">Yes, I have experience</p>
              </button>
              <button
                onClick={() => handleExperienceSelection(false)}
                className="p-8 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/60 transition-all"
              >
                <FileText className="w-12 h-12 text-emerald-700 mx-auto mb-4" />
                <p className="text-xl font-semibold">No, I'm a fresher</p>
              </button>
            </div>
          </div>
        )}

        {/* Job Switch Question */}
        {currentStep === 'jobSwitch' && (
          <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-display text-ink mb-6 text-center">
              Are you looking for a job switch?
            </h2>
            <div className="space-y-4 mb-6">
              <button
                onClick={() => {
                  setJobSwitchReason('job_switch');
                  handleJobSwitchSelection(true, 'experienced');
                }}
                className="w-full p-6 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/60 transition-all text-left"
              >
                <p className="text-xl font-semibold">Yes, looking for a job switch</p>
                <p className="text-slate-600 mt-2">I want to explore new opportunities</p>
              </button>
              <button
                onClick={() => {
                  setJobSwitchReason('career_growth');
                  handleJobSwitchSelection(false, 'experienced');
                }}
                className="w-full p-6 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/60 transition-all text-left"
              >
                <p className="text-xl font-semibold">No, just optimizing my resume</p>
                <p className="text-slate-600 mt-2">I want to improve my profile</p>
              </button>
              <button
                onClick={() => {
                  setJobSwitchReason('upskilling');
                  handleJobSwitchSelection(false, 'experienced');
                }}
                className="w-full p-6 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/60 transition-all text-left"
              >
                <p className="text-xl font-semibold">Other reasons</p>
                <p className="text-slate-600 mt-2">Upskilling or preparing for future</p>
              </button>
            </div>
          </div>
        )}

        {/* Upload Resume */}
        {currentStep === 'upload' && (
          <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-display text-ink mb-6 text-center">
              Upload Your Resume
            </h2>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-emerald-400 transition-colors">
              <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-lg text-slate-600">
                  Click to upload or drag and drop
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-slate-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
              {resume && (
                <p className="text-emerald-700 font-semibold mt-4">✓ {resume.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Share with Recruiters */}
        {currentStep === 'share' && (
          <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-display text-ink mb-6 text-center">
              Share your resume with recruiters?
            </h2>
            <p className="text-slate-600 text-center mb-8">
              Allowing recruiters to view your resume can increase your job opportunities
            </p>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => handleShareSelection(true)}
                className="p-8 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/60 transition-all"
              >
                <Share2 className="w-12 h-12 text-emerald-700 mx-auto mb-4" />
                <p className="text-xl font-semibold">Yes, share with recruiters</p>
              </button>
              <button
                onClick={() => handleShareSelection(false)}
                className="p-8 border border-slate-200 rounded-2xl hover:border-slate-400 hover:bg-slate-50/60 transition-all"
              >
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-xl font-semibold">No, keep it private</p>
              </button>
            </div>
          </div>
        )}

        {/* Analysis */}
        {currentStep === 'analysis' && (
          <div className="space-y-6">
            {analyzing ? (
              <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-ink">Analyzing your resume...</p>
                <p className="text-slate-600 mt-2">This may take a few moments</p>
              </div>
            ) : analysis ? (
              <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
                <h2 className="text-3xl font-display text-ink mb-6">Resume Analysis</h2>
                
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Overall ATS Score</p>
                      <p className="text-5xl font-bold">{analysis.overallScore || 0}%</p>
                    </div>
                    <TrendingUp className="w-16 h-16 opacity-80" />
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-sm text-slate-600">Keywords Match</p>
                    <p className="text-2xl font-semibold text-emerald-700">{analysis.keywordScore || 0}%</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-sm text-slate-600">Format Quality</p>
                    <p className="text-2xl font-semibold text-emerald-700">{analysis.formatScore || 0}%</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-sm text-slate-600">Skills Match</p>
                    <p className="text-2xl font-semibold text-emerald-700">{analysis.skillsScore || 0}%</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <p className="text-sm text-slate-600">Experience</p>
                    <p className="text-2xl font-semibold text-emerald-700">{analysis.experienceScore || 0}%</p>
                  </div>
                </div>

                {/* Suggestions */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold text-ink mb-4">Improvement Suggestions</h3>
                    <ul className="space-y-3">
                      {analysis.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setCurrentStep('experience');
                    setResume(null);
                    setAnalysis(null);
                  }}
                  className="w-full mt-6 bg-emerald-700 text-white py-3 rounded-full hover:bg-emerald-800 transition-colors font-semibold"
                >
                  Upload Another Resume
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* History View */}
        {showHistory && (
          <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-display text-ink">Resume History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              {resumeHistory.length > 0 ? (
                resumeHistory.map((item) => (
                  <div key={item._id} className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-400 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-ink">{item.fileName}</p>
                        <p className="text-sm text-slate-600">
                          Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-emerald-700">
                          {item.analysisResult?.overallScore || 0}%
                        </p>
                        <p className="text-sm text-slate-600">ATS Score</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 py-8">No resume history found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
