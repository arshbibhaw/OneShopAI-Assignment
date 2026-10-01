import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, LogOut } from 'lucide-react';

export default function Portal() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-body text-slate-900">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#7828F0]/10 via-[#28A0F0]/5 to-transparent rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#16C874]/10 to-transparent rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-12 md:py-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 mb-2">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Choose your path to continue exploring the platform.
            </p>
          </div>
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <Link to="/jobs" className="group block outline-none">
            <div className="h-full bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#28A0F0]/20 hover:-translate-y-2 hover:border-[#28A0F0]/50 group-focus-visible:ring-2 group-focus-visible:ring-[#28A0F0] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#28A0F0]/10 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-150" />
              
              <div className="w-16 h-16 rounded-2xl bg-[#28A0F0]/10 text-[#28A0F0] flex items-center justify-center mb-8 relative z-10">
                <Briefcase className="w-8 h-8" />
              </div>
              
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4 relative z-10">
                Opportunity Hub
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 relative z-10">
                Discover your next career move. Browse verified job opportunities, fellowships, and startup programs.
              </p>
              
              <div className="inline-flex items-center gap-2 text-[#28A0F0] font-bold text-lg relative z-10">
                Explore Jobs
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </Link>

          <Link to="/collab" className="group block outline-none">
            <div className="h-full bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-[#7828F0]/20 hover:-translate-y-2 hover:border-[#7828F0]/50 group-focus-visible:ring-2 group-focus-visible:ring-[#7828F0] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#7828F0]/10 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-150" />
              
              <div className="w-16 h-16 rounded-2xl bg-[#7828F0]/10 text-[#7828F0] flex items-center justify-center mb-8 relative z-10">
                <Users className="w-8 h-8" />
              </div>
              
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4 relative z-10">
                Collab Space
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 relative z-10">
                Find your co-founder or project team. Connect with builders, share skills, and launch something new.
              </p>
              
              <div className="inline-flex items-center gap-2 text-[#7828F0] font-bold text-lg relative z-10">
                Enter Collab Space
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
