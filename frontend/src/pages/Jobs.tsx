import { useEffect, useState, useRef, type MouseEvent, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Bookmark, Check, Trash2, Plus, X as CloseIcon, Calendar, Upload, Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

interface Job {
  id: string;
  title: string;
  type: string;
  organization?: string;
  description?: string;
  location?: string;
  compensation?: string;
  requirements?: string | string[];
  createdAt?: string;
}

export default function Jobs() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Browse');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive state
  const { user, token } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOn, setIsAlertOn] = useState(false);
  const [sortOrder, setSortOrder] = useState('Popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // Category horizontal scroll controls
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = categoryScrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(checkScrollability, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [allJobs, activeTab]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 260;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollability, 300);
    }
  };

  // Modal form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'Internship',
    organization: '',
    description: '',
    location: '',
    deadline: '',
    eventStarts: '',
    eventEnds: '',
    results: '',
    compensation: '',
    applyUrl: '',
    tags: ''
  });
  const [keyFacts, setKeyFacts] = useState<{ label: string, value: string }[]>([{ label: '', value: '' }]);
  const [prizes, setPrizes] = useState<{ label: string, value: string }[]>([{ label: '', value: '' }]);
  
  // Image preview state & file input refs
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const deadlineInputRef = useRef<HTMLInputElement>(null);
  const eventStartsInputRef = useRef<HTMLInputElement>(null);
  const eventEndsInputRef = useRef<HTMLInputElement>(null);
  const resultsInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, target: 'banner' | 'logo') => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (target === 'banner') {
        setBannerPreview(dataUrl);
      } else {
        setLogoPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const categories = [
    { name: 'Full-Time', label: 'Full Time' },
    { name: 'Internship', label: 'Internship' },
    { name: 'Hackathon', label: 'Hackathon' },
    { name: 'Scholarship', label: 'Scholarship' },
    { name: 'Startup Program', label: 'Startup Program' },
    { name: 'Fellowships', label: 'Fellowships' }
  ];

  const matchesCategory = (jobType: string | undefined, categoryName: string) => {
    const jType = (jobType || '').toLowerCase().trim();
    const cName = categoryName.toLowerCase().trim();
    if (cName === 'full-time') return jType === 'full-time' || jType === 'full time';
    if (cName === 'fellowships') return jType === 'fellowship' || jType === 'fellowships';
    if (cName === 'startup program') return jType === 'startup program' || jType === 'startup';
    return jType === cName;
  };

  const fetchJobs = () => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/jobs?search=${search}&page=${page}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs');
        return res.json();
      })
      .then(data => {
        if (data.jobs && Array.isArray(data.jobs)) {
          setAllJobs(data.jobs);
        } else if (Array.isArray(data)) {
          setAllJobs(data);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Could not load opportunities. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  const fetchApplications = () => {
    if (!user || !token) return;
    fetch(`${API_BASE_URL}/api/jobs/applications/user/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const appMap: Record<string, string> = {};
          data.forEach(app => {
            appMap[app.jobId] = app.status;
          });
          setApplications(appMap);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchJobs();
  }, [search, page, limit]);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const toggleSave = (id: string, e: MouseEvent) => {
    e.preventDefault();
    const newSaved = new Set(savedJobs);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedJobs(newSaved);
  };

  const handleApply = (id: string, e: MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to apply.');
      return;
    }
    
    fetch(`${API_BASE_URL}/api/jobs/${id}/apply`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setApplications(prev => ({ ...prev, [id]: data.status }));
          alert('Application submitted successfully!');
        }
      })
      .catch(console.error);
  };

  const handleWithdraw = (id: string, e: MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;
    
    fetch(`${API_BASE_URL}/api/jobs/${id}/apply`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          setApplications(prev => {
            const newApps = { ...prev };
            delete newApps[id];
            return newApps;
          });
          alert('Application withdrawn successfully.');
        }
      })
      .catch(console.error);
  };

  const handlePostSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        organization: formData.organization,
        description: formData.description,
        location: formData.location || 'Remote',
        type: formData.type,
        compensation: formData.compensation,
        requirements: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : []
      })
    })
      .then(res => res.json())
      .then(() => {
        setIsModalOpen(false);
        setFormData({
          title: '',
          type: 'Internship',
          organization: '',
          description: '',
          location: '',
          deadline: '',
          eventStarts: '',
          eventEnds: '',
          results: '',
          compensation: '',
          applyUrl: '',
          tags: ''
        });
        setBannerPreview(null);
        setLogoPreview(null);
        setBannerUrlInput('');
        setLogoUrlInput('');
        setKeyFacts([{ label: '', value: '' }]);
        setPrizes([{ label: '', value: '' }]);
        fetchJobs();
      })
      .catch(console.error);
  };

  // Filter jobs based on tabs and category
  let displayedJobs = allJobs;
  if (activeCategory && activeCategory !== 'Quick Apply') {
    displayedJobs = displayedJobs.filter(j => matchesCategory(j.type, activeCategory));
  }
  if (activeTab === 'Saved') {
    displayedJobs = displayedJobs.filter(j => savedJobs.has(j.id));
  } else if (activeTab === 'Applied') {
    displayedJobs = displayedJobs.filter(j => applications[j.id]);
  }

  // Sort jobs
  if (sortOrder === 'Latest') {
    displayedJobs = [...displayedJobs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime() || b.id.localeCompare(a.id));
  } else if (sortOrder === 'Oldest') {
    displayedJobs = [...displayedJobs].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime() || a.id.localeCompare(b.id));
  } else if (sortOrder === 'Popular') {
    displayedJobs = [...displayedJobs].sort((a, b) => (b.organization?.length || 0) - (a.organization?.length || 0));
  }

  if (activeTab === 'For You') {
    if (user?.profile?.currentRole === 'student') {
      displayedJobs = allJobs.filter(j => j.type !== 'Full-Time');
    } else if (user?.profile?.currentRole === 'employee' || user?.profile?.currentRole === 'founder') {
      displayedJobs = allJobs.filter(j => j.type === 'Full-Time');
    } else {
      displayedJobs = [...allJobs].reverse().slice(0, Math.ceil(allJobs.length / 2));
    }
  }

  const visibleJobs = displayedJobs.slice(0, visibleCount);

  return (
    <div className="w-full flex justify-center py-8 px-4 sm:px-6 lg:px-8 relative">

      {/* Modal for Post an Opportunity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
            >
              <CloseIcon size={20} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Post an Opportunity</h2>
              <p className="text-slate-500 mb-8 text-[15px]">
                Listings are reviewed by our team before going live. Free up to a few postings.
              </p>

              <form onSubmit={handlePostSubmit} className="space-y-6">
                {/* Type & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Type</label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Scholarship">Scholarship</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Full-Time">Full-time Job</option>
                        <option value="Startup Program">Startup Program</option>
                        <option value="Fellowships">Fellowship</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Deadline</label>
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => {
                        try { deadlineInputRef.current?.showPicker(); } catch {}
                      }}
                    >
                      <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                      <input
                        ref={deadlineInputRef}
                        type="date"
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        onClick={e => {
                          try { (e.currentTarget as any).showPicker?.(); } catch {}
                        }}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                      />
                      {formData.deadline ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, deadline: '' });
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 z-20"
                          title="Clear date"
                        >
                          <CloseIcon size={16} />
                        </button>
                      ) : (
                        <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Compensation (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹60K/mo stipend • ₹5L prize pool • Unpaid"
                    value={formData.compensation}
                    onChange={e => setFormData({ ...formData, compensation: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <p className="text-[13px] text-slate-500 mt-2">Shown on the listing card and the hero. Leave blank if there's nothing to state.</p>
                </div>

                {/* Key dates */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Key dates (optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[13px] text-slate-500 mb-1.5">Event starts</label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => {
                          try { eventStartsInputRef.current?.showPicker(); } catch {}
                        }}
                      >
                        <input 
                          ref={eventStartsInputRef}
                          type="date" 
                          value={formData.eventStarts}
                          onChange={e => setFormData({ ...formData, eventStarts: e.target.value })}
                          onClick={e => { try { (e.currentTarget as any).showPicker?.(); } catch {} }}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] text-slate-500 mb-1.5">Event ends</label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => {
                          try { eventEndsInputRef.current?.showPicker(); } catch {}
                        }}
                      >
                        <input 
                          ref={eventEndsInputRef}
                          type="date" 
                          value={formData.eventEnds}
                          onChange={e => setFormData({ ...formData, eventEnds: e.target.value })}
                          onClick={e => { try { (e.currentTarget as any).showPicker?.(); } catch {} }}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] text-slate-500 mb-1.5">Results</label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => {
                          try { resultsInputRef.current?.showPicker(); } catch {}
                        }}
                      >
                        <input 
                          ref={resultsInputRef}
                          type="date" 
                          value={formData.results}
                          onChange={e => setFormData({ ...formData, results: e.target.value })}
                          onClick={e => { try { (e.currentTarget as any).showPicker?.(); } catch {} }}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Summer Software Internship 2025"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Organization *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Banner Image */}
                <div>
                  <label className="flex items-center gap-2 text-[15px] font-semibold text-slate-900 mb-2">
                    <ImageIcon size={18} className="text-slate-500" /> Banner image <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'banner');
                    }}
                  />
                  {bannerPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="px-4 py-2 bg-white text-slate-800 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={14} /> Change Banner
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerPreview(null);
                            if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700 transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                      <div className="absolute bottom-2.5 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium pointer-events-none">
                        Banner preview
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageUpload(file, 'banner');
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center bg-[#F9FAFB]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-wrap justify-center">
                        <label
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="flex items-center gap-2 text-[#3C3CF0] font-semibold hover:bg-[#F0F4FF] px-4 py-2 rounded-full transition-colors cursor-pointer"
                        >
                          <Upload size={18} /> Click to upload
                        </label>
                        <span className="text-slate-400 text-[14px]">or</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="paste image URL"
                            value={bannerUrlInput}
                            onChange={(e) => setBannerUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (bannerUrlInput.trim()) {
                                  setBannerPreview(bannerUrlInput.trim());
                                  setBannerUrlInput('');
                                }
                              }
                            }}
                            className="bg-white border border-slate-200 rounded-full px-4 py-2 text-[14px] outline-none focus:border-primary w-48"
                          />
                          {bannerUrlInput.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setBannerPreview(bannerUrlInput.trim());
                                setBannerUrlInput('');
                              }}
                              className="px-3 py-1.5 bg-[#3C3CF0] text-white rounded-full text-xs font-semibold hover:bg-blue-600 transition-colors"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-400 mt-4">JPEG, PNG, GIF or WebP — you'll crop it next</p>
                    </div>
                  )}
                </div>

                {/* Logo Image */}
                <div>
                  <label className="flex items-center gap-2 text-[15px] font-semibold text-slate-900 mb-2">
                    <ImageIcon size={18} className="text-slate-500" /> Logo <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo');
                    }}
                  />
                  {logoPreview ? (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Logo preview</div>
                          <p className="text-xs text-slate-500">Image loaded and ready</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={14} /> Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            if (logoFileInputRef.current) logoFileInputRef.current.value = '';
                          }}
                          className="px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageUpload(file, 'logo');
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center bg-[#F9FAFB]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-wrap justify-center">
                        <label
                          onClick={() => logoFileInputRef.current?.click()}
                          className="flex items-center gap-2 text-[#3C3CF0] font-semibold hover:bg-[#F0F4FF] px-4 py-2 rounded-full transition-colors cursor-pointer"
                        >
                          <Upload size={18} /> Click to upload
                        </label>
                        <span className="text-slate-400 text-[14px]">or</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="paste image URL"
                            value={logoUrlInput}
                            onChange={(e) => setLogoUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (logoUrlInput.trim()) {
                                  setLogoPreview(logoUrlInput.trim());
                                  setLogoUrlInput('');
                                }
                              }
                            }}
                            className="bg-white border border-slate-200 rounded-full px-4 py-2 text-[14px] outline-none focus:border-primary w-48"
                          />
                          {logoUrlInput.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(logoUrlInput.trim());
                                setLogoUrlInput('');
                              }}
                              className="px-3 py-1.5 bg-[#3C3CF0] text-white rounded-full text-xs font-semibold hover:bg-blue-600 transition-colors"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-400 mt-4">JPEG, PNG, GIF or WebP — you'll crop it next</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
                  <div>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-3 pr-2">
                    <input type="checkbox" id="remote" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <label htmlFor="remote" className="text-[15px] font-medium text-slate-900">Remote</label>
                  </div>
                </div>

                {/* How should candidates apply */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">How should candidates apply?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-[#3C3CF0] bg-[#F0F4FF]/50 rounded-xl p-4 cursor-pointer">
                      <div className="font-semibold text-slate-900">External link</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">Send to your link</div>
                    </div>
                    <div className="border-2 border-slate-100 hover:border-slate-200 bg-white rounded-xl p-4 cursor-pointer transition-colors">
                      <div className="font-semibold text-slate-900">In-app form</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">Collect applications here</div>
                    </div>
                  </div>
                </div>

                {/* Apply URL */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Apply URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.applyUrl}
                    onChange={e => setFormData({ ...formData, applyUrl: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Machine Learning, Remote, Paid"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Rich Text Areas */}
                {[
                  { label: "About the Program", placeholder: "An overview of the opportunity — its purpose, objectives and key details." },
                  { label: "Eligibility", placeholder: "Who can apply? (one point per line)" },
                  { label: "Benefits", placeholder: "What do applicants get? (one point per line)" },
                  { label: "Documents required", placeholder: "Documents needed to apply (one point per line)" },
                  { label: "How to apply", placeholder: "Steps to apply — use the numbered list for ordered steps" }
                ].map((section, idx) => (
                  <div key={idx}>
                    <label className="block text-[14px] font-semibold text-slate-900 mb-2">{section.label}</label>
                    <div className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden">
                      <div className="flex items-center gap-1 border-b border-slate-200 px-3 py-2 bg-white">
                        <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"><Bold size={18} /></button>
                        <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"><Italic size={18} /></button>
                        <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"><Underline size={18} /></button>
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"><List size={18} /></button>
                        <button type="button" className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"><ListOrdered size={18} /></button>
                      </div>
                      <textarea
                        rows={section.label === 'About the Program' ? 4 : 3}
                        placeholder={section.placeholder}
                        value={section.label === 'About the Program' ? formData.description : ''}
                        onChange={e => section.label === 'About the Program' ? setFormData({ ...formData, description: e.target.value }) : undefined}
                        className="w-full bg-transparent px-4 py-4 text-[15px] outline-none resize-none"
                      />
                    </div>
                    {section.label === 'About the Program' && <div className="text-right text-[12px] text-slate-400 mt-1">0/2000</div>}
                  </div>
                ))}

                {/* Key facts */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1">Key facts (optional)</label>
                  <p className="text-[13px] text-slate-500 mb-3">Short label/value pairs for the panel beside the listing.</p>
                  <div className="space-y-3 mb-3">
                    {keyFacts.map((fact, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Duration"
                          value={fact.label}
                          onChange={(e) => {
                            const newFacts = [...keyFacts];
                            newFacts[index].label = e.target.value;
                            setKeyFacts(newFacts);
                          }}
                          className="w-1/2 bg-slate-50/50 border border-slate-200 rounded-full px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          placeholder="6 months"
                          value={fact.value}
                          onChange={(e) => {
                            const newFacts = [...keyFacts];
                            newFacts[index].value = e.target.value;
                            setKeyFacts(newFacts);
                          }}
                          className="w-1/2 bg-slate-50/50 border border-slate-200 rounded-full px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setKeyFacts(keyFacts.filter((_, i) => i !== index))}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <CloseIcon size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setKeyFacts([...keyFacts, { label: '', value: '' }])} className="text-[#3C3CF0] font-semibold text-[14px] hover:underline">+ Add fact</button>
                </div>

                {/* Prizes */}
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1">Prizes (optional)</label>
                  <p className="text-[13px] text-slate-500 mb-3">The ranked award ladder. Rows appear in the order you add them.</p>
                  <div className="space-y-3 mb-3">
                    {prizes.map((prize, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="1st"
                          value={prize.label}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[index].label = e.target.value;
                            setPrizes(newPrizes);
                          }}
                          className="w-1/3 bg-slate-50/50 border border-slate-200 rounded-full px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          placeholder="₹2,00,000 + internship"
                          value={prize.value}
                          onChange={(e) => {
                            const newPrizes = [...prizes];
                            newPrizes[index].value = e.target.value;
                            setPrizes(newPrizes);
                          }}
                          className="w-2/3 bg-slate-50/50 border border-slate-200 rounded-full px-4 py-2.5 text-[15px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setPrizes(prizes.filter((_, i) => i !== index))}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <CloseIcon size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setPrizes([...prizes, { label: '', value: '' }])} className="text-[#3C3CF0] font-semibold text-[14px] hover:underline">+ Add prize</button>
                </div>

                <div className="pt-4 pb-0 mt-8 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 p-4 -mx-8 -mb-8 rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-full font-semibold text-slate-600 hover:bg-red-500 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-full font-semibold bg-[#75A5FF] text-white hover:bg-blue-500 transition-colors shadow-sm">
                    Post for review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1250px] w-full flex flex-col lg:flex-row gap-8">

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-slate-900 leading-tight tracking-tight">Opportunity Hub</h1>
              <p className="text-slate-500 mt-1">{allJobs.length} live opportunities &middot; {Math.floor(allJobs.length / 3)} closing this week</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 border border-[#3C3CF0] text-[#3C3CF0] bg-white hover:bg-[#F0F4FF] px-4 py-2 rounded-full font-bold text-[14px] transition-colors self-start sm:self-auto shadow-sm"
            >
              <Plus size={16} /> Post an Opportunity
            </button>
          </div>

          <div className="flex items-center gap-6 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
            {['Browse', 'For You', 'Saved', 'Applied'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveCategory(null); }}
                className={`pb-3 font-bold text-[15px] whitespace-nowrap border-b-2 transition-all ${activeTab === tab
                  ? 'border-[#3C3CF0] text-[#3C3CF0]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
              >
                {tab}
                {tab === 'For You' && <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === tab ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600'}`}>{Math.ceil(allJobs.length / 2)}</span>}
                {tab === 'Saved' && <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === tab ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600'}`}>{savedJobs.size}</span>}
                {tab === 'Applied' && <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === tab ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600'}`}>{Object.keys(applications).length}</span>}
              </button>
            ))}
          </div>

          {(activeTab === 'Browse' || activeTab === 'For You') && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                  <input
                    type="text"
                    placeholder="Search by title, company, skills or keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#7828F0]/20 transition-all border border-slate-200 focus:border-[#7828F0]/30 rounded-full py-2.5 pl-10 pr-4 text-[14px] font-medium outline-none text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center justify-between sm:justify-center gap-2 border border-slate-200 hover:bg-slate-50 bg-white px-4 py-2.5 rounded-full text-[14px] font-medium text-slate-700 whitespace-nowrap shadow-sm"
                  >
                    Sort: {sortOrder} <ChevronDown size={16} className="text-slate-400" />
                  </button>
                  {isSortOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                      {['Popular', 'Latest', 'Oldest'].map((option) => (
                        <button
                          key={option}
                          onClick={() => { setSortOrder(option); setIsSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortOrder === option ? 'bg-[#F0F4FF] text-[#3C3CF0] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex items-center mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  disabled={!canScrollLeft}
                  title="Scroll categories left"
                  aria-label="Scroll left"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    !canScrollLeft
                      ? 'border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm active:scale-95 cursor-pointer'
                  }`}
                >
                  <ChevronLeft size={17} strokeWidth={2.5} />
                </button>

                <div
                  ref={categoryScrollRef}
                  onScroll={checkScrollability}
                  className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 flex-1 items-center"
                >
                  <button
                    onClick={() => setActiveCategory(activeCategory === 'Quick Apply' ? null : 'Quick Apply')}
                    className={`flex items-center gap-1.5 border px-4 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-all shrink-0 ${activeCategory === 'Quick Apply'
                      ? 'border-[#3C3CF0] bg-[#3C3CF0] text-white shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                  >
                    ⚡ Quick Apply
                  </button>
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.name;
                    const count = allJobs.filter(j => matchesCategory(j.type, cat.name)).length;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setActiveCategory(isActive ? null : cat.name)}
                        className={`flex items-center gap-1.5 border px-4 py-2 rounded-full text-[14px] font-bold whitespace-nowrap transition-all shrink-0 ${isActive
                          ? 'border-[#3C3CF0] bg-white text-[#3C3CF0] shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        <div className={`w-3.5 h-3.5 grid grid-cols-2 gap-[1.5px] opacity-70 ${isActive ? 'text-[#3C3CF0]' : 'text-slate-400'}`}>
                          <div className="bg-current rounded-[1.5px]"></div>
                          <div className="bg-current rounded-[1.5px]"></div>
                          <div className="bg-current rounded-[1.5px]"></div>
                          <div className="bg-current rounded-[1.5px]"></div>
                        </div>
                        {cat.label}
                        <span className={`ml-1 font-bold ${isActive ? 'text-[#3C3CF0]/80' : 'text-slate-400'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  disabled={!canScrollRight}
                  title="Scroll categories right"
                  aria-label="Scroll right"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    !canScrollRight
                      ? 'border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm active:scale-95 cursor-pointer'
                  }`}
                >
                  <ChevronRight size={17} strokeWidth={2.5} />
                </button>
              </div>
            </>
          )}

          {error ? (
            <div className="col-span-full py-12 text-center border-2 border-red-100 rounded-3xl bg-red-50/50 mt-4">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button onClick={fetchJobs} className="px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold text-sm hover:bg-red-200 transition-colors">Try Again</button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {[1, 2, 3, 4].map(n => (
                <Card key={n} className="border border-slate-200 rounded-[20px] overflow-hidden bg-white p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-8"></div>
                  <div className="flex justify-between items-end">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded-full w-20"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {visibleJobs.length > 0 ? visibleJobs.map((job: Job) => {
                const isSaved = savedJobs.has(job.id);
              const appStatus = applications[job.id];
              const isApplied = !!appStatus;

              return (
                <Card key={job.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-[20px] overflow-hidden bg-white flex flex-col group relative">
                  <CardHeader className="p-5 pb-3 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                          {((job.organization || job.title || 'O') as string).substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-[15px] text-slate-800 leading-tight line-clamp-1">{job.organization || 'Company Name'}</span>
                      </div>
                      <button
                        onClick={(e) => toggleSave(job.id, e)}
                        className={`transition-colors p-1.5 rounded-full hover:bg-slate-100 ${isSaved ? 'text-slate-800' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-[#F3E8FF] text-[#7828F0] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        {job.type || 'Opportunity'}
                      </span>
                    </div>
                    <CardTitle className="text-[17px] font-bold text-slate-900 leading-tight line-clamp-2 mb-1 group-hover:text-[#3C3CF0] transition-colors">
                      <Link to={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <p className="text-[13px] text-slate-500 mb-0">
                      {job.location || 'Remote'}
                    </p>
                    {isApplied && (
                      <div className="flex items-center gap-2 mt-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 border-2 border-white shrink-0">1</div>
                        <p className="text-[12px] font-medium text-slate-500 line-clamp-1">1 person from student-benefit is applying</p>
                      </div>
                    )}
                  </CardHeader>
                  <CardFooter className="px-5 py-4 mt-auto flex justify-between items-end bg-white border-none relative z-10">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-bold text-slate-900">{job.compensation || 'Open'}</span>
                      <span className="text-[12px] font-medium text-slate-500">15 days left</span>
                    </div>
                    {isApplied ? (
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <button className={`px-4 py-1.5 rounded-full font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-default transition-colors ${appStatus === 'accepted' ? 'bg-green-100 text-green-700' : appStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {appStatus === 'accepted' ? <Check size={14} strokeWidth={3} /> : null} 
                          {appStatus ? appStatus.charAt(0).toUpperCase() + appStatus.slice(1) : 'Applied'}
                        </button>
                        <button 
                          onClick={(e) => handleWithdraw(job.id, e)}
                          className="text-[12px] font-semibold text-slate-500 hover:text-red-500 transition-colors"
                        >
                          Withdraw
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="border border-slate-200 text-[#3C3CF0] hover:bg-[#F0F4FF] hover:border-[#3C3CF0] px-4 py-1.5 rounded-full font-bold text-[13px] transition-all w-full sm:w-auto flex items-center justify-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={(e) => handleApply(job.id, e)}
                          className="border border-[#3C3CF0] bg-[#3C3CF0] text-white hover:bg-[#3131D0] px-4 py-1.5 rounded-full font-bold text-[13px] transition-all w-full sm:w-auto flex items-center justify-center shadow-sm"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            }) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/80 mt-4">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  {activeTab === 'Saved' ? <Bookmark className="text-slate-400" size={24} /> :
                    activeTab === 'Applied' ? <Check className="text-slate-400" size={24} /> :
                      <Search className="text-slate-400" size={24} />}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  {activeTab === 'Saved' ? 'Nothing saved yet' :
                    activeTab === 'Applied' ? 'No applications yet' :
                      'No opportunities found'}
                </h3>
                <p className="text-slate-500 text-[15px] max-w-sm mx-auto">
                  {activeTab === 'Saved' ? 'Tap the bookmark on any listing to keep it here for later.' :
                    activeTab === 'Applied' ? 'Opportunities you apply to will appear here.' :
                      'Try adjusting your search terms or clearing your filters.'}
                </p>
              </div>
            )}
            </div>
          )}

          {displayedJobs.length > visibleCount && !isLoading && !error && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="px-6 py-2.5 rounded-full border border-slate-200 font-bold text-[14px] text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm"
              >
                View more listings
              </button>
            </div>
          )}

        </div>

        {/* Right Sidebar Area */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-5">

          <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-[17px] text-slate-900 mb-5">Your application activity</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-600 font-medium">Applied</span>
                <span className={`font-bold ${Object.keys(applications).length > 0 ? 'text-[#0F6F4C]' : 'text-slate-900'}`}>{Object.keys(applications).length}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-600 font-medium">Saved</span>
                <span className={`font-bold ${savedJobs.size > 0 ? 'text-primary' : 'text-slate-900'}`}>{savedJobs.size}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-slate-600 font-medium">Shortlisted</span>
                <span className="font-bold text-slate-900">0</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-[20px] p-6 shadow-sm relative overflow-hidden group hover:border-[#A5B4FC] transition-colors">
            <h3 className="font-bold text-[17px] text-[#312E81] mb-2 relative z-10">Opportunity alerts</h3>
            <p className="text-[14px] text-[#4338CA] mb-5 leading-relaxed relative z-10 font-medium">
              Get notified the moment a matching scholarship, internship or hackathon is posted.
            </p>
            <button
              onClick={() => setIsAlertOn(!isAlertOn)}
              className={`w-full py-2.5 rounded-full font-bold text-[15px] transition-all shadow-sm relative z-10 ${isAlertOn
                ? 'bg-[#E6F4EA] text-[#0F6F4C] border border-[#A5D6A7]'
                : 'bg-white hover:bg-slate-50 text-[#3C3CF0]'
                }`}
            >
              {isAlertOn ? 'Alerts are ON' : 'Turn on alerts'}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center cursor-pointer group">
            <h3 className="font-bold text-[16px] text-slate-800">My Postings</h3>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
