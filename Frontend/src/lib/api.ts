const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string, role?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, role })
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    return response.json();
  },

  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.message || 'Verification failed');
    }
    return response.json();
  },

  updateProfile: async (profileData: { companyName?: string; companyEmail?: string; designation?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    return response.json();
  }
};

// Resume API
export const resumeAPI = {
  upload: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return response.json();
  },
  
  uploadResume: async (fileName: string, fileData: string, fileType: string, experienceLevel: string, jobDescription?: string) => {
    const response = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fileName, fileData, fileType, experienceLevel, jobDescription })
    });
    return response.json();
  },

  saveAnalysis: async (resumeId: string, analysisResult: any) => {
    const response = await fetch(`${API_BASE_URL}/resume/${resumeId}/analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ analysisResult })
    });
    return response.json();
  },

  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/resume/history`, {
      credentials: 'include'
    });
    return response.json();
  },

  getResume: async (resumeId: string) => {
    const response = await fetch(`${API_BASE_URL}/resume/${resumeId}`, {
      credentials: 'include'
    });
    return response.json();
  },

  deleteResume: async (resumeId: string) => {
    const response = await fetch(`${API_BASE_URL}/resume/${resumeId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  },

  searchCandidates: async (jobDescription: string, minScore?: number, experienceLevel?: string) => {
    const response = await fetch(`${API_BASE_URL}/resume/recruiter/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ jobDescription, minScore, experienceLevel })
    });
    return response.json();
  }
};

// Admin API
export const adminAPI = {
  getUsers: async (role?: string) => {
    const url = role 
      ? `${API_BASE_URL}/admin/users?role=${role}`
      : `${API_BASE_URL}/admin/users`;
    const response = await fetch(url, {
      credentials: 'include'
    });
    return response.json();
  },

  createAdmin: async (payload: { name?: string; email: string; password?: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  getResumes: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) {
      query.append('status', params.status);
    }
    if (params?.search) {
      query.append('search', params.search);
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/resumes${suffix}`, {
      credentials: 'include'
    });
    return response.json();
  },

  updateResumeModeration: async (resumeId: string, payload: { status: string; note?: string }) => {
    const response = await fetch(`${API_BASE_URL}/admin/resumes/${resumeId}/moderation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  deleteResume: async (resumeId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/resumes/${resumeId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  },

  getOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/overview`, {
      credentials: 'include'
    });
    return response.json();
  },

  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      credentials: 'include'
    });
    return response.json();
  },

  updateSettings: async (payload: { maintenanceMode?: boolean; allowUserSignup?: boolean; allowRecruiterSignup?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return response.json();
  }
};
