import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  UserPlus,
  Trash2,
  Edit,
  LogOut,
  Search,
  BadgeCheck,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { adminAPI, authAPI } from '../lib/api';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'recruiter' | 'admin';
  createdAt: string;
  isVerified?: boolean;
}

interface ResumeData {
  id: string;
  fileName: string;
  experienceLevel: string;
  createdAt: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  shareWithRecruiters: boolean;
  overallScore?: number;
  user?: {
    name?: string;
    email?: string;
  };
}

interface AdminOverview {
  totals: {
    users: number;
    recruiters: number;
    admins: number;
    resumes: number;
    verifiedUsers: number;
  };
  moderation: {
    pending: number;
    approved: number;
    rejected: number;
  };
  trends: {
    users: Array<{ date: string; count: number }>;
    resumes: Array<{ date: string; count: number }>;
  };
}

interface SettingsData {
  maintenanceMode: boolean;
  allowUserSignup: boolean;
  allowRecruiterSignup: boolean;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'recruiters' | 'admins' | 'resumes' | 'analytics' | 'settings'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resumeSearchTerm, setResumeSearchTerm] = useState('');
  const [resumeStatusFilter, setResumeStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminError, setAddAdminError] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalRecruiters: 0, totalAdmins: 0 });
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [settings, setSettings] = useState<SettingsData>({
    maintenanceMode: false,
    allowUserSignup: true,
    allowRecruiterSignup: true
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'recruiter' | 'admin'>('user');
  const [editUserVerified, setEditUserVerified] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [editUserSaving, setEditUserSaving] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (user?.companyName) {
      setCompanyName(user.companyName);
    }
    if (user?.companyEmail) {
      setCompanyEmail(user.companyEmail);
    }
    if (user?.designation) {
      setDesignation(user.designation);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'recruiters' || activeTab === 'admins') {
      loadUsers();
    }
    if (activeTab === 'resumes') {
      loadResumes();
    }
    if (activeTab === 'analytics') {
      loadOverview();
    }
    if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab, resumeStatusFilter]);

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
      }
    } catch (error: any) {
      setProfileError(error?.message || 'Failed to save profile details');
    } finally {
      setProfileSaving(false);
    }
  };

  const loadStats = async () => {
    try {
      const allUsersResponse = await adminAPI.getUsers();
      if (allUsersResponse.users) {
        const totalUsers = allUsersResponse.users.filter((u: any) => u.role === 'user').length;
        const totalRecruiters = allUsersResponse.users.filter((u: any) => u.role === 'recruiter').length;
        const totalAdmins = allUsersResponse.users.filter((u: any) => u.role === 'admin').length;
        setStats({ totalUsers, totalRecruiters, totalAdmins });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const roleFilter = activeTab === 'users' ? 'user' : activeTab === 'recruiters' ? 'recruiter' : 'admin';
      const response = await adminAPI.getUsers(roleFilter);
      
      if (response.users) {
        const formattedUsers: UserData[] = response.users.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          isVerified: u.isVerified
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadResumes = async () => {
    try {
      const response = await adminAPI.getResumes({
        status: resumeStatusFilter,
        search: resumeSearchTerm.trim() ? resumeSearchTerm.trim() : undefined
      });
      if (response.resumes) {
        const formattedResumes: ResumeData[] = response.resumes.map((resume: any) => ({
          id: resume._id,
          fileName: resume.fileName,
          experienceLevel: resume.experienceLevel,
          createdAt: resume.createdAt,
          moderationStatus: resume.moderationStatus || 'pending',
          shareWithRecruiters: resume.shareWithRecruiters,
          overallScore: resume.analysisResult?.overallScore,
          user: resume.userId
            ? { name: resume.userId.name, email: resume.userId.email }
            : undefined
        }));
        setResumes(formattedResumes);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const loadOverview = async () => {
    try {
      const response = await adminAPI.getOverview();
      if (response.totals) {
        setOverview(response as AdminOverview);
      }
    } catch (error) {
      console.error('Error loading overview:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      if (response.settings) {
        setSettings({
          maintenanceMode: response.settings.maintenanceMode,
          allowUserSignup: response.settings.allowUserSignup,
          allowRecruiterSignup: response.settings.allowRecruiterSignup
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    setAddAdminError('');
    try {
      const response = await adminAPI.createAdmin({
        name: newAdminName || undefined,
        email: newAdminEmail,
        password: newAdminPassword || undefined
      });
      if (response?.message) {
        setShowAddAdmin(false);
        setNewAdminEmail('');
        setNewAdminName('');
        setNewAdminPassword('');
        loadUsers();
        loadStats();
      } else if (response?.message === undefined && response?.error) {
        setAddAdminError(response.error);
      }
    } catch (error: any) {
      setAddAdminError(error?.message || 'Failed to add admin');
    }
  };

  const handleEditUser = (userData: UserData) => {
    setEditUser(userData);
    setEditUserName(userData.name);
    setEditUserEmail(userData.email);
    setEditUserRole(userData.role);
    setEditUserVerified(!!userData.isVerified);
    setEditUserError('');
  };

  const handleEditUserSave = async () => {
    if (!editUser) return;
    setEditUserSaving(true);
    setEditUserError('');
    try {
      const response = await adminAPI.updateUser(editUser.id, {
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
        isVerified: editUserVerified
      });
      if (response?.user) {
        setEditUser(null);
        loadUsers();
        loadStats();
      } else {
        setEditUserError(response?.message || 'Failed to update user');
      }
    } catch (error: any) {
      setEditUserError(error?.message || 'Failed to update user');
    } finally {
      setEditUserSaving(false);
    }
  };

  const handleModerationUpdate = async (resumeId: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      await adminAPI.updateResumeModeration(resumeId, { status, note });
      loadResumes();
      loadOverview();
    } catch (error) {
      console.error('Error updating moderation status:', error);
      alert('Failed to update moderation status');
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Delete this resume permanently?')) return;
    try {
      await adminAPI.deleteResume(resumeId);
      loadResumes();
      loadOverview();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    }
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    setSettingsError('');
    try {
      const response = await adminAPI.updateSettings(settings);
      if (response?.settings) {
        setSettingsSaved(true);
      } else {
        setSettingsError(response?.message || 'Failed to update settings');
      }
    } catch (error: any) {
      setSettingsError(error?.message || 'Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserTab = activeTab === 'users' || activeTab === 'recruiters' || activeTab === 'admins';

  return (
    <div className="min-h-screen bg-atlas">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-white/70">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Admin Console</p>
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Admin Profile */}
        <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl p-8 mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
              <BadgeCheck className="h-6 w-6 text-rose-700" />
            </div>
            <div>
              <h2 className="text-2xl font-display text-ink">Admin Profile Details</h2>
              <p className="text-sm text-slate-600">Store admin information for records.</p>
            </div>
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

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Organization</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/40"
                placeholder="Resume World"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Official Email</label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/40"
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/40"
                placeholder="System Administrator"
              />
            </div>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="mt-6 w-full bg-rose-700 text-white py-3 rounded-full hover:bg-rose-800 transition-colors font-semibold disabled:opacity-70"
          >
            {profileSaving ? 'Saving...' : 'Save Admin Details'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/90 border border-white/70 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Users</p>
                <p className="text-3xl font-semibold text-ink">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-emerald-700 opacity-20" />
            </div>
          </div>
          <div className="bg-white/90 border border-white/70 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Recruiters</p>
                <p className="text-3xl font-semibold text-ink">{stats.totalRecruiters}</p>
              </div>
              <Briefcase className="w-12 h-12 text-amber-700 opacity-20" />
            </div>
          </div>
          <div className="bg-white/90 border border-white/70 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Admins</p>
                <p className="text-3xl font-semibold text-ink">{stats.totalAdmins}</p>
              </div>
              <Shield className="w-12 h-12 text-rose-700 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 border border-white/70 rounded-3xl shadow-2xl overflow-hidden">
          <div className="border-b border-slate-100">
            <div className="flex flex-wrap">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 min-w-[160px] py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Resume Users
              </button>
              <button
                onClick={() => setActiveTab('recruiters')}
                className={`flex-1 min-w-[160px] py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'recruiters'
                    ? 'bg-amber-700 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Recruiters
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`flex-1 min-w-[160px] py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'admins'
                    ? 'bg-rose-700 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Admins
              </button>
              <button
                onClick={() => setActiveTab('resumes')}
                className={`flex-1 min-w-[160px] py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'resumes'
                    ? 'bg-ink text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Resumes
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 min-w-[160px] py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 min-w-[160px] py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {isUserTab && (
              <>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/40"
                      placeholder="Search by name or email..."
                    />
                  </div>
                  {activeTab === 'admins' && (
                    <button
                      onClick={() => setShowAddAdmin(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-700 text-white rounded-full hover:bg-rose-800 transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Admin
                    </button>
                  )}
                </div>

                {showAddAdmin && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                      <h3 className="text-2xl font-display text-ink mb-4">Add New Admin</h3>
                      {addAdminError && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                          {addAdminError}
                        </div>
                      )}
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-transparent mb-3"
                        placeholder="Admin name"
                      />
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-transparent mb-3"
                        placeholder="admin@example.com"
                      />
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-transparent mb-4"
                        placeholder="Temporary password (optional for existing users)"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleAddAdmin}
                          className="flex-1 bg-rose-700 text-white py-2 rounded-full hover:bg-rose-800 transition-colors"
                        >
                          Add Admin
                        </button>
                        <button
                          onClick={() => setShowAddAdmin(false)}
                          className="flex-1 border border-slate-200 py-2 rounded-full hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {editUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                      <h3 className="text-2xl font-display text-ink mb-4">Update User</h3>
                      {editUserError && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                          {editUserError}
                        </div>
                      )}
                      <input
                        type="text"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-transparent mb-3"
                        placeholder="Full name"
                      />
                      <input
                        type="email"
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-transparent mb-3"
                        placeholder="Email address"
                      />
                      <select
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value as 'user' | 'recruiter' | 'admin')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-transparent mb-3"
                      >
                        <option value="user">User</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <input
                          type="checkbox"
                          checked={editUserVerified}
                          onChange={(e) => setEditUserVerified(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        Email verified
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditUserSave}
                          disabled={editUserSaving}
                          className="flex-1 bg-emerald-700 text-white py-2 rounded-full hover:bg-emerald-800 transition-colors disabled:opacity-70"
                        >
                          {editUserSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditUser(null)}
                          className="flex-1 border border-slate-200 py-2 rounded-full hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userData) => (
                      <div
                        key={userData.id}
                        className="border border-slate-200 rounded-2xl p-5 hover:border-rose-400 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-ink">{userData.name}</h3>
                              {userData.isVerified && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600">{userData.email}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              Joined: {new Date(userData.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(userData)}
                              className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {userData.email !== user?.email && (
                              <button
                                onClick={() => handleDeleteUser(userData.id)}
                                className="p-2 text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-600">No {activeTab} found</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'resumes' && (
              <>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[220px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={resumeSearchTerm}
                      onChange={(e) => setResumeSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:ring-2 focus:ring-ink/20 focus:border-ink/40"
                      placeholder="Search by file name..."
                    />
                  </div>
                  <select
                    value={resumeStatusFilter}
                    onChange={(e) => setResumeStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                    className="px-4 py-2 border border-slate-200 rounded-full focus:ring-2 focus:ring-ink/20 focus:border-ink/40"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={loadResumes}
                    className="px-4 py-2 rounded-full bg-ink text-white hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <div className="space-y-4">
                  {resumes.length > 0 ? (
                    resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="border border-slate-200 rounded-2xl p-5 hover:border-ink/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-ink">{resume.fileName}</h3>
                              <p className="text-sm text-slate-600">
                                {resume.user?.name || 'Unknown'} · {resume.user?.email || 'No email'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Experience: {resume.experienceLevel} · Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                              </p>
                              {typeof resume.overallScore === 'number' && (
                                <p className="text-xs text-slate-500 mt-1">Overall score: {resume.overallScore}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`px-3 py-1 text-xs rounded-full ${
                                resume.moderationStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : resume.moderationStatus === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {resume.moderationStatus || 'pending'}
                            </span>
                            <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                              {resume.shareWithRecruiters ? 'Shared' : 'Private'}
                            </span>
                            <div className="flex gap-2">
                              {resume.moderationStatus !== 'approved' && (
                                <button
                                  onClick={() => handleModerationUpdate(resume.id, 'approved')}
                                  className="px-3 py-1 text-xs rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                                >
                                  Approve
                                </button>
                              )}
                              {resume.moderationStatus !== 'rejected' && (
                                <button
                                  onClick={() => {
                                    const note = prompt('Rejection note (optional):') || undefined;
                                    handleModerationUpdate(resume.id, 'rejected', note || undefined);
                                  }}
                                  className="px-3 py-1 text-xs rounded-full bg-rose-700 text-white hover:bg-rose-800"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteResume(resume.id)}
                                className="px-3 py-1 text-xs rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-600">No resumes found</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display text-ink">Platform Overview</h3>
                    <p className="text-sm text-slate-600">Last updated from live data.</p>
                  </div>
                </div>

                {overview ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Users</p>
                        <p className="text-3xl font-semibold text-ink">{overview.totals.users}</p>
                        <p className="text-xs text-slate-500 mt-2">Verified: {overview.totals.verifiedUsers}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Resumes</p>
                        <p className="text-3xl font-semibold text-ink">{overview.totals.resumes}</p>
                        <p className="text-xs text-slate-500 mt-2">Pending: {overview.moderation.pending}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admins</p>
                        <p className="text-3xl font-semibold text-ink">{overview.totals.admins}</p>
                        <p className="text-xs text-slate-500 mt-2">Recruiters: {overview.totals.recruiters}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="border border-slate-200 rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-slate-600 mb-4">User signups (7 days)</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                          {overview.trends.users.map((item) => (
                            <div key={item.date} className="flex justify-between">
                              <span>{item.date}</span>
                              <span className="font-semibold text-ink">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-slate-600 mb-4">Resumes uploaded (7 days)</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                          {overview.trends.resumes.map((item) => (
                            <div key={item.date} className="flex justify-between">
                              <span>{item.date}</span>
                              <span className="font-semibold text-ink">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-600">Loading analytics...</div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display text-ink">System Settings</h3>
                    <p className="text-sm text-slate-600">Control platform access and signups.</p>
                  </div>
                </div>

                {settingsError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {settingsError}
                  </div>
                )}
                {settingsSaved && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Settings saved.
                  </div>
                )}

                <div className="grid gap-4">
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">Maintenance mode</p>
                      <p className="text-xs text-slate-500">Only admins can log in while enabled.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">Allow user signup</p>
                      <p className="text-xs text-slate-500">Enable or disable resume user signups.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowUserSignup}
                      onChange={(e) => setSettings({ ...settings, allowUserSignup: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">Allow recruiter signup</p>
                      <p className="text-xs text-slate-500">Enable or disable recruiter signups.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowRecruiterSignup}
                      onChange={(e) => setSettings({ ...settings, allowRecruiterSignup: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSettingsSave}
                  disabled={settingsSaving}
                  className="w-full bg-slate-900 text-white py-3 rounded-full hover:bg-black transition-colors font-semibold disabled:opacity-70"
                >
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
