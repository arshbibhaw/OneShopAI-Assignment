import { useEffect, useState, useRef, type FormEvent } from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '../components/ui/card';
import { Search, User, Pencil, LogIn, Mail, Lock, Plus, X, MapPin, GraduationCap, Briefcase, Rocket, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface CollabRequest {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  category?: string;
  coverImage?: string;
  projectType?: string;
  duration?: string;
  status: string;
  openRoles?: string;
  isClosed?: boolean;
  owner: { id: string; name: string; username?: string; avatar: string };
  members?: { id: string; status: string }[];
  createdAt: string;
}

interface Profile {
  id: string;
  bio: string;
  skills: string[];
  portfolio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  location?: string;
  currentRole?: string;
  organization?: string;
  user: { id: string; name: string; username?: string; avatar: string; email: string };
}

interface MyCollabCreated {
  id: string;
  title: string;
  status: string;
  description?: string;
  requiredSkills?: string[];
  owner?: { id: string; name: string; username?: string; avatar: string };
}

interface MyCollabJoined {
  id: string;
  status: string;
  request?: {
    id: string;
    title: string;
    description: string;
  };
}

export default function CollabSpace() {
  const { user, token, login, setUser } = useAuth();

  const [requests, setRequests] = useState<CollabRequest[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [myCollabs, setMyCollabs] = useState<{ created: MyCollabCreated[]; joined: MyCollabJoined[] }>({
    created: [],
    joined: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('Discover Channels');
  const [activeSort, setActiveSort] = useState('Trending');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setVisibleCount(6);
  }, [activeTab, selectedCategory, search]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Auth Form
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '', name: '', username: '' });

  // Project Form
  const [projectData, setProjectData] = useState({ title: '', description: '', requiredSkills: '', category: 'Post a Need', coverImage: '', projectType: 'Side Project', duration: 'Unspecified', openRoles: '' });

  // Join Project Form
  const [joinProjectTarget, setJoinProjectTarget] = useState<CollabRequest | null>(null);
  const [joinData, setJoinData] = useState({ role: '', message: '', portfolioLink: '' });

  // Manage Requests State
  const [selectedProjectForManage, setSelectedProjectForManage] = useState<any>(null);
  const [manageTab, setManageTab] = useState<'pending' | 'active'>('pending');

  // Profile Form
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    skills: '',
    portfolio: '',
    linkedinUrl: '',
    githubUrl: '',
    location: '',
    currentRole: 'student',
    organization: ''
  });

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE_URL}/api/collab/requests`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
      }),
      fetch(`${API_BASE_URL}/api/collab/profiles`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch profiles');
        return res.json();
      })
    ])
      .then(([requestsData, profilesData]) => {
        if (Array.isArray(requestsData)) setRequests(requestsData);
        if (Array.isArray(profilesData)) setProfiles(profilesData);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load data. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  const fetchMyData = () => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/collab/requests/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => {
        console.log('fetchMyData response:', data);
        if (data.created) {
          setMyCollabs(data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMyData();
  }, [token]);

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          login(data.token, data.user);
          setIsAuthModalOpen(false);
          fetchMyData();
        } else {
          alert(data.error || 'Authentication failed');
        }
      })
      .catch(console.error);
  };

  const handleProjectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!token) return setIsAuthModalOpen(true);

    fetch(`${API_BASE_URL}/api/collab/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...projectData,
        requiredSkills: projectData.requiredSkills.split(',').map(s => s.trim())
      })
    })
      .then(res => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setIsProjectModalOpen(false);
        setProjectData({ title: '', description: '', requiredSkills: '', category: 'Post a Need', coverImage: '', projectType: 'Side Project', duration: 'Unspecified', openRoles: '' });
        fetchData();
        fetchMyData();
      })
      .catch(console.error);
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!token) return setIsAuthModalOpen(true);

    fetch(`${API_BASE_URL}/api/collab/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...profileData,
        username: profileData.username.trim().toLowerCase(),
        skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean)
      })
    })
      .then(res => res.json())
      .then(updatedProfile => {
        if (updatedProfile.error) {
          alert(updatedProfile.error);
          return;
        }
        setIsProfileModalOpen(false);
        fetchData();
        if (user) {
          setUser({
            ...user,
            username: updatedProfile.user?.username || profileData.username.trim().toLowerCase() || user.username,
            profile: {
              ...user.profile,
              ...updatedProfile,
              skills: Array.isArray(updatedProfile.skills) ? updatedProfile.skills.join(',') : updatedProfile.skills
            }
          });
        }
      })
      .catch(console.error);
  };

  const openJoinModal = (req: CollabRequest) => {
    if (!token) return setIsAuthModalOpen(true);
    setJoinProjectTarget(req);
    setJoinData({ role: '', message: '', portfolioLink: user?.profile?.portfolio || '' });
    setIsJoinModalOpen(true);
  };

  const submitJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!token || !joinProjectTarget) return;

    fetch(`${API_BASE_URL}/api/collab/requests/${joinProjectTarget.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(joinData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        alert('Request to join sent!');
        setIsJoinModalOpen(false);
        fetchMyData();
      })
      .catch(console.error);
  };

  const openManageRequests = (id: string) => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/collab/requests/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setSelectedProjectForManage(data);
        setIsManageModalOpen(true);
        setManageTab('pending');
      })
      .catch(console.error);
  };

  const handleUpdateMemberStatus = (memberId: string, status: string, reason?: string) => {
    if (!token || !selectedProjectForManage) return;
    fetch(`${API_BASE_URL}/api/collab/requests/${selectedProjectForManage.id}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, rejectionReason: reason })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        openManageRequests(selectedProjectForManage.id);
      })
      .catch(console.error);
  };

  const handleLeaveProject = (requestId: string, memberId: string, status: string) => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/collab/requests/${requestId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        fetchMyData();
      })
      .catch(console.error);
  };

  const handleToggleProjectStatus = () => {
    if (!token || !selectedProjectForManage) return;
    fetch(`${API_BASE_URL}/api/collab/requests/${selectedProjectForManage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isClosed: !selectedProjectForManage.isClosed })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        openManageRequests(selectedProjectForManage.id);
        fetchData();
        fetchMyData();
      })
      .catch(console.error);
  };

  const openEditProfile = () => {
    if (!user) return setIsAuthModalOpen(true);
    setProfileData({
      username: user.username || '',
      bio: user.profile?.bio || '',
      skills: user.profile?.skills || '',
      portfolio: user.profile?.portfolio || '',
      linkedinUrl: user.profile?.linkedinUrl || '',
      githubUrl: user.profile?.githubUrl || '',
      location: user.profile?.location || '',
      currentRole: user.profile?.currentRole || 'student',
      organization: user.profile?.organization || ''
    });
    setIsProfileModalOpen(true);
  };

  const tabs = user ? ['Discover Channels', 'Builder Directory', 'My Collabs'] : ['Discover Channels', 'Builder Directory'];

  let filteredRequests = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (activeSort === 'Recent') {
    filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (activeSort === 'Trending') {
    filteredRequests.sort((a, b) => b.id.localeCompare(a.id));
  }

  const filteredProfiles = profiles.filter(p => p.user.name?.toLowerCase().includes(search.toLowerCase()) || p.bio?.toLowerCase().includes(search.toLowerCase()));

  // Default images for visual mock
  const fallbackImages = [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=400",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800&h=400",
  ];

  return (
    <div className="w-full flex justify-center py-8 px-4 sm:px-6 lg:px-8 relative bg-[#F8FAFC] min-h-screen">

      {/* Manage Requests Modal */}
      {isManageModalOpen && selectedProjectForManage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Manage Requests</h2>
                <p className="text-slate-500 text-[14px]">Project: {selectedProjectForManage.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleProjectStatus}
                  className={`px-4 py-2 rounded-full font-bold text-[13px] transition-colors ${selectedProjectForManage.isClosed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                  {selectedProjectForManage.isClosed ? 'Reopen Project' : 'Close Project'}
                </button>
                <button onClick={() => setIsManageModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-slate-200 px-6">
              <button
                onClick={() => setManageTab('pending')}
                className={`py-3 font-bold text-[14px] transition-all border-b-2 ${manageTab === 'pending' ? 'border-[#7828F0] text-[#7828F0]' : 'border-transparent text-slate-500'}`}
              >
                Pending Requests ({selectedProjectForManage.creator.filter((m: any) => m.status === 'pending').length})
              </button>
              <button
                onClick={() => setManageTab('active')}
                className={`py-3 font-bold text-[14px] transition-all border-b-2 ${manageTab === 'active' ? 'border-[#7828F0] text-[#7828F0]' : 'border-transparent text-slate-500'}`}
              >
                Active Members ({selectedProjectForManage.creator.filter((m: any) => m.status === 'accepted').length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {manageTab === 'pending' && (
                <div className="space-y-4">
                  {selectedProjectForManage.creator.filter((m: any) => m.status === 'pending').map((m: any) => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold">
                            {m.user.name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 leading-tight">{m.user.name} <span className="text-sm font-normal text-slate-500">@{m.user.username}</span></h4>
                            <p className="text-[13px] text-slate-600 mt-1">Requested Role: <span className="font-semibold text-slate-800">{m.role || 'Any'}</span></p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateMemberStatus(m.id, 'accepted')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors">Accept</button>
                          <button onClick={() => {
                            const reason = prompt('Optional rejection reason:');
                            if (reason !== null) handleUpdateMemberStatus(m.id, 'rejected', reason);
                          }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors">Reject</button>
                        </div>
                      </div>

                      {m.message && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                          <p className="text-[13px] text-slate-700 italic">"{m.message}"</p>
                        </div>
                      )}

                      {m.portfolioLink && (
                        <a href={m.portfolioLink} target="_blank" rel="noreferrer" className="text-[13px] text-blue-600 hover:underline flex items-center gap-1 mb-3">
                          <Globe size={14} /> View Portfolio
                        </a>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.user.profile?.skills?.map((s: any) => (
                          <span key={s.id || s.name} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-semibold">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {selectedProjectForManage.creator.filter((m: any) => m.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-slate-500">No pending requests.</div>
                  )}
                </div>
              )}

              {manageTab === 'active' && (
                <div className="space-y-4">
                  {selectedProjectForManage.creator.filter((m: any) => m.status === 'accepted').map((m: any) => (
                    <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold">
                          {m.user.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{m.user.name}</h4>
                          <p className="text-[13px] text-slate-500">Role: {m.role || 'Member'}</p>
                        </div>
                      </div>
                      <button onClick={() => {
                        if (confirm('Are you sure you want to remove this member?')) handleUpdateMemberStatus(m.id, 'removed');
                      }} className="text-red-500 hover:text-red-700 text-[13px] font-bold">Kick Out</button>
                    </div>
                  ))}
                  {selectedProjectForManage.creator.filter((m: any) => m.status === 'accepted').length === 0 && (
                    <div className="text-center py-8 text-slate-500">No active members yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Join Project Modal */}
      {isJoinModalOpen && joinProjectTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Join Project</h2>
              <p className="text-slate-500 mb-6 text-[15px]">You are requesting to join: <strong>{joinProjectTarget.title}</strong></p>

              <form onSubmit={submitJoin} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">Role you are applying for</label>
                  <input type="text" placeholder="e.g. Frontend Developer" value={joinData.role} onChange={e => setJoinData({ ...joinData, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0]" />
                  {joinProjectTarget.openRoles && (
                    <p className="text-xs text-slate-500 mt-1">Looking for: {joinProjectTarget.openRoles}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">Short Message</label>
                  <textarea rows={3} required placeholder="Why do you want to join?" value={joinData.message} onChange={e => setJoinData({ ...joinData, message: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#7828F0] resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">Portfolio/Shipped Project Link (optional)</label>
                  <input type="url" placeholder="https://..." value={joinData.portfolioLink} onChange={e => setJoinData({ ...joinData, portfolioLink: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0]" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-xl font-bold text-[15px] transition-colors shadow-sm">
                    Send Join Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Join Collab Space'}</h2>
              <p className="text-slate-500 mb-6 text-[15px]">
                {isLogin ? 'Sign in to connect with other builders.' : 'Create an account to start collaborating.'}
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input required type="text" value={authData.name} onChange={e => setAuthData({ ...authData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20 transition-all" placeholder="Your full name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">Unique Username</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm select-none">@</span>
                        <input
                          required
                          type="text"
                          value={authData.username}
                          onChange={e => setAuthData({ ...authData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-[15px] font-mono outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20 transition-all"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">
                    {isLogin ? 'Email or Username' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type={isLogin ? 'text' : 'email'} value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20 transition-all" placeholder={isLogin ? "you@example.com or @username" : "you@example.com"} />
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="password" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20 transition-all" placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#7828F0] hover:bg-[#6020C0] text-white py-3 rounded-xl font-bold text-[15px] transition-colors mt-2 shadow-sm">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-[#7828F0] font-semibold text-[14px] hover:underline">
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Post a Collaboration Request</h2>
              <p className="text-slate-500 mb-8 text-[15px]">Find talented builders to join your next big idea.</p>

              <form onSubmit={handleProjectSubmit} className="space-y-6">
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Project Title *</label>
                  <input required type="text" placeholder="e.g. Building an AI agent platform" value={projectData.title} onChange={e => setProjectData({ ...projectData, title: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20" />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Description *</label>
                  <textarea required rows={4} placeholder="What are you building? Who do you need?" value={projectData.description} onChange={e => setProjectData({ ...projectData, description: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20 resize-none"></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Category *</label>
                    <select value={projectData.category} onChange={e => setProjectData({ ...projectData, category: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20">
                      <option value="Post a Need">Post a Need</option>
                      <option value="How Collab Works">How Collab Works</option>
                      <option value="Working Together">Working Together</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Required Skills *</label>
                    <input required type="text" placeholder="e.g. React, Node.js" value={projectData.requiredSkills} onChange={e => setProjectData({ ...projectData, requiredSkills: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Project Type</label>
                    <select value={projectData.projectType} onChange={e => setProjectData({ ...projectData, projectType: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20">
                      <option value="Side Project">Side Project</option>
                      <option value="Startup">Startup</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Expected Duration</label>
                    <select value={projectData.duration} onChange={e => setProjectData({ ...projectData, duration: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20">
                      <option value="Unspecified">Unspecified</option>
                      <option value="< 1 month">&lt; 1 month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="Ongoing">Ongoing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Looking for Roles (optional)</label>
                  <input type="text" placeholder="e.g. Fullstack Dev, UI Designer" value={projectData.openRoles} onChange={e => setProjectData({ ...projectData, openRoles: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20" />
                  <p className="text-xs text-slate-500 mt-1">Comma-separated list of roles you need</p>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Cover Image URL (optional)</label>
                  <input type="url" placeholder="https://images.unsplash.com/..." value={projectData.coverImage} onChange={e => setProjectData({ ...projectData, coverImage: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20" />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-5 py-2.5 rounded-full font-bold text-[14px] text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" className="bg-[#7828F0] hover:bg-[#6020C0] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm">Post Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Edit Builder Profile</h2>
              <p className="text-slate-500 mb-8 text-[15px]">Showcase your skills and experience to the community.</p>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Unique Username */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[14px] font-semibold text-slate-900">
                      Unique Username
                    </label>
                    <span className="text-xs font-mono font-bold text-[#7828F0] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full border border-[#E9D5FF]">
                      @{profileData.username || 'handle'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 select-none text-[15px]">@</span>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={profileData.username}
                      onChange={e => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-[15px] font-mono outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                    />
                  </div>
                  <p className="text-[12px] text-slate-400 mt-1">Your unique public handle across OneShopAI.</p>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Bio</label>
                  <textarea rows={3} placeholder="A short bio about yourself..." value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20 resize-none"></textarea>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Current Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'student', label: 'Student', icon: <GraduationCap size={16} /> },
                      { id: 'employee', label: 'Employee', icon: <Briefcase size={16} /> },
                      { id: 'founder', label: 'Founder', icon: <Rocket size={16} /> },
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setProfileData({ ...profileData, currentRole: role.id })}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-[14px] font-bold transition-all ${profileData.currentRole === role.id
                          ? 'bg-[#F3E8FF] border-[#7828F0] text-[#7828F0] shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        {role.icon}
                        <span>{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Organization / College & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">
                      {profileData.currentRole === 'student'
                        ? 'College / University'
                        : profileData.currentRole === 'founder'
                          ? 'Startup / Company'
                          : 'Company / Organization'}
                    </label>
                    <div className="relative">
                      {profileData.currentRole === 'student' ? (
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                      ) : (
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                      )}
                      <input
                        type="text"
                        placeholder={
                          profileData.currentRole === 'student'
                            ? 'e.g. Stanford University'
                            : profileData.currentRole === 'founder'
                              ? 'e.g. OneShopAI'
                              : 'e.g. Stripe, Google'
                        }
                        value={profileData.organization}
                        onChange={e => setProfileData({ ...profileData, organization: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={profileData.location}
                        onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. UI/UX, Python, Marketing (comma separated)"
                    value={profileData.skills}
                    onChange={e => setProfileData({ ...profileData, skills: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                  />
                </div>

                {/* Social & Portfolio Links */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-[14px] font-bold text-slate-900">Social & Portfolio Links</h3>

                  <div>
                    <label className="block text-[13px] font-medium text-slate-700 mb-1.5">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={profileData.linkedinUrl}
                      onChange={e => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-slate-700 mb-1.5">GitHub URL (optional)</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={profileData.githubUrl}
                        onChange={e => setProfileData({ ...profileData, githubUrl: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Portfolio / Website (optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={profileData.portfolio}
                        onChange={e => setProfileData({ ...profileData, portfolio: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-5 py-2.5 rounded-full font-bold text-[14px] text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" className="bg-[#7828F0] hover:bg-[#6020C0] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm">Save Profile</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1250px] w-full flex flex-col">

        {/* Header & Main Controls (Full Width) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 leading-tight tracking-tight">Collab Space</h1>
            <p className="text-slate-500 mt-1">Find the right people and build something worth talking about.</p>
          </div>
          <button
            onClick={() => user ? setIsProjectModalOpen(true) : setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 border border-[#7828F0] text-[#7828F0] bg-white hover:bg-[#F3E8FF] px-4 py-2 rounded-full font-bold text-[14px] transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus size={16} /> Post a Project
          </button>
        </div>

        {activeTab === 'Discover Channels' && (
          <div className="mb-10 flex flex-col gap-5">
            <div className="relative group w-full">
              {canScrollLeft && (
                <button
                  onClick={() => handleScroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#3C3CF0] z-10 hidden sm:flex transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => handleScroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#3C3CF0] z-10 hidden sm:flex transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              )}

              <div
                ref={categoryScrollRef}
                onScroll={checkScrollability}
                className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 items-center"
              >
                {['All', 'How Collab Works', 'Post a Need', 'Working Together', 'Developer Tools', 'Hackathon', 'AI Research', 'Creative Tech', 'Web3 / Crypto', 'Finance', 'Productivity'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`${selectedCategory === cat ? 'bg-[#A7F3D0] text-[#065F46] border-transparent shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'} px-5 py-2 border rounded-full text-[14px] whitespace-nowrap font-bold transition-colors shrink-0`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-sm font-bold border-2 border-white">LM</div>
                <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-sm font-bold border-2 border-white">AK</div>
                <div className="w-10 h-10 rounded-full bg-[#A855F7] text-white flex items-center justify-center text-sm font-bold border-2 border-white">ST</div>
              </div>
              <p className="text-[15px] font-semibold text-[#7828F0] ml-2">{profiles.length} members &bull; {requests.length} Channels</p>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full py-12 text-center border-2 border-red-100 rounded-3xl bg-red-50/50 mb-8">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold text-sm hover:bg-red-200 transition-colors">Try Again</button>
          </div>
        )}

        {isLoading && !error && (
          <div className="w-full py-20 text-center flex flex-col items-center justify-center border-2 border-slate-100 border-dashed rounded-3xl bg-white mb-8">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#7828F0] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading spaces...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {user ? (
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7828F0] to-[#28A0F0] text-white flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white ring-1 ring-slate-100 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[19px] text-slate-900 leading-tight">{user.name}</h3>
                          {user.username && (
                            <span className="font-mono text-[13px] font-bold text-[#7828F0] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full border border-[#E9D5FF]">
                              @{user.username}
                            </span>
                          )}
                          {user.profile?.currentRole && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${user.profile.currentRole === 'founder'
                              ? 'bg-amber-100 text-amber-800'
                              : user.profile.currentRole === 'student'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {user.profile.currentRole === 'founder' ? '🚀 ' : user.profile.currentRole === 'student' ? '🎓 ' : '💼 '}
                              {user.profile.currentRole}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[13px] text-slate-500 mt-1 flex-wrap">
                          {user.profile?.organization && (
                            <span className="font-medium text-slate-700">
                              {user.profile.organization}
                            </span>
                          )}
                          {user.profile?.organization && user.profile?.location && (
                            <span>•</span>
                          )}
                          {user.profile?.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin size={13} /> {user.profile.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button onClick={openEditProfile} className="px-5 py-2 rounded-full font-bold text-[14px] transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Pencil size={15} /> Edit Profile
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">My Bio</h4>
                    <p className="text-[14px] text-slate-700 leading-relaxed">{user.profile?.bio || 'No bio added yet.'}</p>
                  </div>

                  {/* Social and portfolio link buttons for logged-in user */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 flex-wrap">
                    {user.profile?.linkedinUrl && (
                      <a href={user.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {user.profile?.githubUrl && (
                      <a href={user.profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    {user.profile?.portfolio && (
                      <a href={user.profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#7828F0] hover:bg-purple-100 transition-colors">
                        <Globe size={14} /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[20px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-bold text-[18px] text-[#312E81] mb-1">Join the Collab Space</h3>
                    <p className="text-[14px] text-[#4338CA] font-medium max-w-xl">
                      Create your builder profile to showcase your skills, discover talent, and collaborate on amazing projects.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-white hover:bg-slate-50 text-[#7828F0] px-6 py-2.5 rounded-full font-bold text-[15px] transition-all shadow-sm flex items-center gap-2 shrink-0"
                  >
                    <LogIn size={18} /> Sign in / Register
                  </button>
                </div>
              )}

              {user && (
                <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                  <h3 className="font-bold text-[16px] text-slate-900 mb-4">My Activity</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-600 font-medium">Projects Created</span>
                      <span className="font-bold text-slate-900">{myCollabs.created.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-600 font-medium">Projects Joined</span>
                      <span className="font-bold text-slate-900">{myCollabs.joined.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-bold text-[15px] whitespace-nowrap border-b-2 transition-all ${activeTab === tab
                    ? 'border-[#7828F0] text-[#7828F0]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {tab}
                  {tab === 'Discover Channels' && <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-100 text-slate-600">{requests.length}</span>}
                  {tab === 'Builder Directory' && <span className="ml-2 text-xs py-0.5 px-2 rounded-full bg-slate-100 text-slate-600">{profiles.length}</span>}
                </button>
              ))}
            </div>

            {(activeTab === 'Discover Channels' || activeTab === 'Builder Directory') && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'Discover Channels' ? 'channels by title or keywords' : 'builders by name or skills'}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#7828F0]/20 transition-all border border-slate-200 focus:border-[#7828F0]/30 rounded-full py-2.5 pl-10 pr-4 text-[14px] font-medium outline-none text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>
            )}

            {!isLoading && !error && activeTab === 'Discover Channels' && (
              <div className="flex justify-between items-end mb-6 mt-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Explore more channels</h2>
                  <p className="text-slate-500 text-sm">Browse specialized sub-communities within Collab Space</p>
                </div>
                <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                  <button
                    onClick={() => setActiveSort('Trending')}
                    className={`${activeSort === 'Trending' ? 'bg-[#A855F7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'} px-5 py-1.5 rounded-full text-[14px] font-bold transition-all`}
                  >
                    Trending
                  </button>
                  <button
                    onClick={() => setActiveSort('Recent')}
                    className={`${activeSort === 'Recent' ? 'bg-[#A855F7] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'} px-5 py-1.5 rounded-full text-[14px] font-bold transition-all`}
                  >
                    Recent
                  </button>
                </div>
              </div>
            )}

            {/* 3-Column Content Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {/* Discover Channels Tab */}
              {activeTab === 'Discover Channels' && filteredRequests.slice(0, visibleCount).map((req) => (
                <Card key={req.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[20px] overflow-hidden bg-white flex flex-col group">
                  <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                    <img src={req.coverImage || fallbackImages[req.id.charCodeAt(req.id.length - 1) % fallbackImages.length]} alt={req.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-5 flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{req.title}</h3>
                    <p className="text-slate-500 text-[14px] line-clamp-2 mb-4">{req.description}</p>

                    {req.category && (
                      <span className="inline-block bg-[#F3E8FF] text-[#A855F7] px-3 py-1 rounded-full text-[12px] font-semibold mb-3">
                        {req.category}
                      </span>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {req.projectType && req.projectType !== 'Side Project' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-amber-200/50">
                          🚀 {req.projectType}
                        </span>
                      )}
                      {req.duration && req.duration !== 'Unspecified' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-200/50">
                          ⏱️ {req.duration}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-5 py-4 border-t border-slate-50 flex justify-between items-center bg-white mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white z-20">
                          {req.owner?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white z-10">
                          MK
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#A855F7] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white z-0">
                          {req.requiredSkills.length}
                        </div>
                      </div>
                      <span className="text-slate-500 text-[12px] font-medium ml-1 truncate max-w-[150px]">
                        <span>{(req.members?.filter((m: any) => m.status === 'accepted').length || 0) + ((req.id?.charCodeAt(0) || 0) % 100 + 56)} members</span>
                      </span>
                    </div>
                    <button onClick={() => openJoinModal(req)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2 rounded-full font-bold text-[14px] transition-colors shadow-sm">
                      Join
                    </button>
                  </CardFooter>
                </Card>
              ))}

              {/* Builder Directory Tab */}
              {activeTab === 'Builder Directory' && filteredProfiles.slice(0, visibleCount).map(p => (
                <Card key={p.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-[20px] overflow-hidden bg-white text-center p-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7828F0] to-[#28A0F0] text-white flex items-center justify-center font-bold text-2xl shadow-sm mb-3 border-4 border-white ring-1 ring-slate-100">
                    {p.user?.name?.charAt(0) || 'U'}
                  </div>
                  <h3 className="font-bold text-[17px] text-slate-900 leading-tight mb-0.5">{p.user?.name}</h3>
                  {p.user?.username && (
                    <span className="text-[12px] font-mono font-medium text-[#7828F0] bg-[#F3E8FF] px-2 py-0.5 rounded-full mb-1.5 border border-[#E9D5FF]">
                      @{p.user.username}
                    </span>
                  )}

                  {/* Role & Org */}
                  {p.organization && (
                    <p className="text-[12px] font-bold text-[#7828F0] mb-1">
                      {p.currentRole === 'founder' ? '🚀 Founder @ ' : p.currentRole === 'student' ? '🎓 Student @ ' : '💼 '}
                      {p.organization}
                    </p>
                  )}

                  {/* Location */}
                  {p.location && (
                    <p className="text-[12px] text-slate-400 flex items-center gap-1 mb-2">
                      <MapPin size={12} /> {p.location}
                    </p>
                  )}

                  <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 min-h-[39px]">{p.bio || 'Passionate builder exploring new technologies.'}</p>

                  <div className="flex gap-4 mb-5 items-center justify-center w-full">
                    <a href={`mailto:${p.user?.email}`} title="Email" className="text-slate-400 hover:text-red-500 transition-colors">
                      <Mail size={20} />
                    </a>
                    <a
                      href={p.linkedinUrl || `mailto:${p.user?.email}`}
                      target={p.linkedinUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      title={p.linkedinUrl ? "LinkedIn Profile" : "LinkedIn"}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a
                      href={p.githubUrl || `https://github.com`}
                      target={p.githubUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      title={p.githubUrl ? "GitHub Profile" : "GitHub"}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                    {p.portfolio && (
                      <a href={p.portfolio} target="_blank" rel="noopener noreferrer" title="Portfolio" className="text-slate-400 hover:text-purple-600 transition-colors">
                        <Globe size={20} />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 mt-auto w-full border-t border-slate-100 pt-4">
                    {p.skills?.slice(0, 4).map((skill: string, i: number) => (
                      <span key={i} className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200">{skill}</span>
                    ))}
                    {p.skills?.length > 4 && (
                      <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-slate-200">+{p.skills.length - 4}</span>
                    )}
                  </div>
                </Card>
              ))}

              {/* My Collabs Tab */}
              {activeTab === 'My Collabs' && user && (
                <div className="col-span-full lg:col-span-2 lg:col-start-1 lg:row-start-1">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Projects I Created</h3>
                  <div className="grid gap-4 sm:grid-cols-2 mb-8">
                    {myCollabs.created.length > 0 ? myCollabs.created.map((req: any) => (
                      <Card key={req.id} className="border border-slate-200 shadow-sm rounded-[20px] bg-white p-5">
                        <CardTitle className="text-[16px] font-bold text-slate-900 mb-2">{req.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${req.isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {req.isClosed ? 'Closed' : 'Open'}
                          </span>
                        </div>
                        <button onClick={() => openManageRequests(req.id)} className="text-[13px] font-bold text-[#7828F0] hover:underline">Manage Requests</button>
                      </Card>
                    )) : (
                      <p className="text-[14px] text-slate-500 col-span-2">You haven't posted any projects yet.</p>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-4">Projects I Joined</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {myCollabs.joined.length > 0 ? myCollabs.joined.map((j: any) => (
                      <Card key={j.id} className="border border-slate-200 shadow-sm rounded-[20px] bg-white p-5 flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-[16px] font-bold text-slate-900 mb-2">{j.request?.title}</CardTitle>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${j.status === 'pending' ? 'bg-amber-100 text-amber-700' : j.status === 'rejected' ? 'bg-red-100 text-red-700' : j.status === 'withdrawn' ? 'bg-slate-100 text-slate-700' : j.status === 'removed' ? 'bg-slate-100 text-slate-700' : 'bg-green-100 text-green-700'}`}>{j.status}</span>
                        </div>
                        {['pending', 'accepted'].includes(j.status) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                            <button onClick={() => {
                              if (confirm(`Are you sure you want to ${j.status === 'pending' ? 'withdraw your request' : 'leave this project'}?`)) {
                                handleLeaveProject(j.request?.id, j.id, j.status === 'pending' ? 'withdrawn' : 'removed');
                              }
                            }} className="text-[13px] font-bold text-red-500 hover:text-red-700">
                              {j.status === 'pending' ? 'Withdraw Request' : 'Leave Project'}
                            </button>
                          </div>
                        )}
                      </Card>
                    )) : (
                      <p className="text-[14px] text-slate-500 col-span-2">You haven't requested to join any projects yet.</p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* View More Button */}
            {activeTab === 'Discover Channels' && filteredRequests.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-6 py-2.5 rounded-full border border-slate-200 font-bold text-[14px] text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  View more channels
                </button>
              </div>
            )}

            {activeTab === 'Builder Directory' && filteredProfiles.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-6 py-2.5 rounded-full border border-slate-200 font-bold text-[14px] text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  View more builders
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
