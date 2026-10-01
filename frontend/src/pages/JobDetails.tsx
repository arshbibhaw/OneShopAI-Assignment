import { useEffect, useState, type MouseEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function JobDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        setJob(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user && token && id) {
      fetch(`${API_BASE_URL}/api/jobs/applications/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const application = data.find(app => app.jobId === id);
            if (application) {
              setAppStatus(application.status);
            }
          }
        })
        .catch(console.error);
    }
  }, [user, id]);

  const handleApply = (e: MouseEvent) => {
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
        if (data.error) alert(data.error);
        else {
          setAppStatus(data.status || 'pending');
          alert('Application submitted successfully!');
        }
      })
      .catch(console.error);
  };

  const handleWithdraw = (e: MouseEvent) => {
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
        if (data.error) alert(data.error);
        else {
          setAppStatus(null);
          alert('Application withdrawn successfully.');
        }
      })
      .catch(console.error);
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!job) return <div className="text-center py-20 text-destructive">Job not found.</div>;

  return (
    <div className="max-w-[1100px] mx-auto pt-10 pb-20 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/jobs" className="text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 hover:bg-slate-50 p-1.5 rounded-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </Link>
        <span className="font-semibold text-[15px] text-slate-700">Opportunity Hub</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Main Details */}
        <div className="flex-1 space-y-6">
          
          {/* Header Card */}
          <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-[20px] bg-white">
            {/* Images */}
            <div className="h-56 bg-slate-100 flex items-center justify-center">
              <div className="w-1/2 h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800&h=400)'}} />
              <div className="w-1/2 h-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=400)'}} />
            </div>
            <CardContent className="p-6 relative">
              <div className="absolute -top-12 left-6">
                <div className="w-20 h-20 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-bold text-3xl border-4 border-white shadow-sm">
                  {((job.organization || job.title || 'O') as string).substring(0, 1).toUpperCase()}
                </div>
              </div>
              <div className="mt-12">
                <div className="mb-2">
                   <span className="inline-block bg-[#F3E8FF] text-[#7828F0] px-3 py-1.5 rounded-full text-[12px] font-bold">
                     {job.type === 'Scholarship' ? '🎓 ' : job.type === 'Internship' ? '💼 ' : job.type === 'Hackathon' ? '💻 ' : job.type === 'Startup Program' ? '🚀 ' : job.type === 'Fellowships' ? '🤝 ' : ''}{job.type || 'Opportunity'}
                   </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{job.title}</h1>
                <p className="text-[15px] font-semibold text-[#7828F0]">{job.organization || 'OneShopAI Foundation'} &middot; {job.location || 'India'}</p>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="border border-slate-200 shadow-sm rounded-[20px] p-6 lg:p-8 bg-white">
            <h2 className="text-[19px] font-bold mb-4 text-slate-900">About</h2>
            <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </Card>

          {/* Eligibility & requirements */}
          <Card className="border border-slate-200 shadow-sm rounded-[20px] p-6 lg:p-8 bg-white">
            <h2 className="text-[19px] font-bold mb-5 text-slate-900">Eligibility & requirements</h2>
            <ul className="list-disc pl-5 space-y-3 text-[15px] text-slate-600">
               {job.requirements ? job.requirements.map((req: string, i: number) => (
                 <li key={i}>{req}</li>
               )) : (
                 <>
                   <li>Students currently studying in Class 11</li>
                   <li>Students currently studying in Class 12</li>
                   <li>First year undergraduate students</li>
                   <li>Open to students across India</li>
                   <li>No prior startup, prototype, revenue or entrepreneurship experience is required</li>
                 </>
               )}
            </ul>
          </Card>

          {/* Benefits */}
          <Card className="border border-slate-200 shadow-sm rounded-[20px] p-6 lg:p-8 bg-white">
            <h2 className="text-[19px] font-bold mb-5 text-slate-900">Benefits</h2>
            <ul className="list-disc pl-5 space-y-3 text-[15px] text-slate-600">
               <li>{job.compensation || '₹1 lakh annual college scholarship'}</li>
               <li>₹1 lakh per month internship stipend</li>
               <li>3 to 4 summer Pit Stop Internships</li>
               <li>Exposure to startups, founders and venture capital organisations</li>
               <li>Entrepreneurship mentorship and business experience</li>
               <li>Opportunity for a ₹25 LPA Entrepreneur in Residence role after graduation</li>
            </ul>
          </Card>

          {/* How to apply */}
          <Card className="border border-slate-200 shadow-sm rounded-[20px] p-6 lg:p-8 bg-white">
            <h2 className="text-[19px] font-bold mb-5 text-slate-900">How to apply</h2>
            <ul className="list-disc pl-5 space-y-5 text-[15px] text-slate-600">
               <li>Register for {job.title} by clicking the <strong>Register link above</strong>.</li>
               <li>Pay the ₹199 registration fee.</li>
               <li>Appear for the 120-minute online test in the first week of next month.</li>
               <li>The top 50 candidates are invited to the Bootcamp.</li>
               <li>Candidates are selected for the final round.</li>
            </ul>
          </Card>
          
          {/* Related opportunities */}
          <div>
            <h2 className="text-[19px] font-bold mb-4 mt-8 text-slate-900">Related opportunities</h2>
            <div className="flex flex-col gap-4">
              <Card className="border border-slate-200 shadow-sm rounded-[20px] p-5 flex items-center justify-between hover:border-slate-300 cursor-pointer bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">ETH</div>
                  <div>
                    <div className="mb-1">
                      <span className="inline-block bg-[#F3E8FF] text-[#7828F0] px-2 py-0.5 rounded-full text-[11px] font-bold">🎓 Scholarship</span>
                    </div>
                    <h3 className="font-bold text-[15px] text-slate-900">ETH Zurich Excellence Scholarship (ESOP) 2027</h3>
                    <p className="text-[13px] text-slate-500">ETH Zurich</p>
                  </div>
                </div>
                <div className="text-[13px] font-bold text-slate-500">Apply by 30 Nov</div>
              </Card>
              <Card className="border border-slate-200 shadow-sm rounded-[20px] p-5 flex items-center justify-between hover:border-slate-300 cursor-pointer bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">RF</div>
                  <div>
                    <div className="mb-1">
                      <span className="inline-block bg-[#F3E8FF] text-[#7828F0] px-2 py-0.5 rounded-full text-[11px] font-bold">🎓 Scholarship</span>
                    </div>
                    <h3 className="font-bold text-[15px] text-slate-900">Reliance Foundation Undergraduate Scholarships</h3>
                    <p className="text-[13px] text-slate-500">Reliance Foundation</p>
                  </div>
                </div>
                <div className="text-[13px] font-bold text-slate-500">Apply by 4 Oct</div>
              </Card>
            </div>
          </div>

        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0">
          <div className="sticky top-6">
            <Card className="border border-slate-200 shadow-sm rounded-[20px] p-6 lg:p-8 bg-white">
              <div className="flex justify-between items-center mb-5">
                 <span className="text-[14px] font-semibold text-slate-600">Apply by 15 Oct</span>
                 <span className="text-[14px] font-bold text-[#D97706]">15 days left</span>
              </div>
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                 <span className="text-[13px] text-slate-500">Registration closes</span>
                 <span className="text-[13px] font-bold text-slate-900">15 Oct</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[13px] text-slate-500">Event</span>
                 <span className="text-[13px] font-bold text-slate-900">1 Dec &ndash; 7 May</span>
              </div>

              {appStatus ? (
                <div className="flex flex-col gap-2 mb-3">
                  <button className={`w-full py-3 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-sm cursor-default ${appStatus === 'accepted' ? 'bg-[#E6F4EA] text-[#0F6F4C] border border-[#A5D6A7]' : appStatus === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                    {appStatus === 'accepted' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : null}
                    {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                  </button>
                  <button onClick={handleWithdraw} className="text-[13px] font-semibold text-slate-500 hover:text-red-500 transition-colors text-center">
                    Withdraw Application
                  </button>
                </div>
              ) : (
                <button onClick={handleApply} className="w-full bg-[#3C3CF0] text-white hover:bg-[#3131D0] py-3 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors mb-3 shadow-sm">
                  Apply Now
                </button>
              )}
              
              <p className="text-center text-[12px] text-slate-500 mb-6 px-2 leading-tight">
                 Takes ~2 minutes &middot; applies with your OneShopAI profile
              </p>

              <div className="flex justify-between gap-2 mb-6">
                 <button className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Save
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> Remind
                 </button>
              </div>

              <p className="text-center text-[12px] text-slate-400">
                 5 views &middot; 3 applied
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
