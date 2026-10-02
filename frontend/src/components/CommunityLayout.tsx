import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Hand,
  Calendar,
  Briefcase,
  Trophy,
  Gamepad2,
  BrainCircuit,
  Code2,
  Search,
  Plus,
  MessageSquare,
  Bell,
  Rocket,
  GraduationCap,
  Users,
  BookOpen,
  Store,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Bookmark,
  Newspaper,
  MessageSquareText,
  Edit,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import mainLogo from '../assets/mainLogo-F6715TUU-F6715TUU.png';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function CommunityLayout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col text-slate-900">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Left Section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={mainLogo} alt="OneShopAI Logo" className="h-[28px] transition-transform group-hover:scale-105" />
            <span className="font-bold text-[19px] text-[#7828F0] tracking-tight">OneShopAI</span>
          </Link>
        </div>

        {/* Center Section: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md lg:max-w-xl mx-4 lg:mx-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
          <input
            type="text"
            placeholder="Search communities, channels, posts..."
            className="w-full bg-[#F1F5F9] hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-[#7828F0]/20 transition-all border border-transparent focus:border-[#7828F0]/30 text-[14px] font-medium rounded-full py-2 pl-10 pr-4 outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Create Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#28A0F0] to-[#7828F0] hover:opacity-95 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(40,160,240,0.35)] whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${createMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {createMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setCreateMenuOpen(false)}
              >
                <Link
                  to="/feed"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <MessageSquare size={17} className="text-[#3C3CF0]" />
                  <div>
                    <p className="text-sm font-semibold">Post</p>
                    <p className="text-xs text-slate-400">Share with the community</p>
                  </div>
                </Link>
                <Link
                  to="/jobs"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <Briefcase size={17} className="text-[#28A0F0]" />
                  <div>
                    <p className="text-sm font-semibold">Opportunity</p>
                    <p className="text-xs text-slate-400">Post a job or internship</p>
                  </div>
                </Link>
                <Link
                  to="/collab"
                  onClick={() => setCreateMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 hover:text-slate-900"
                >
                  <Users size={17} className="text-[#8C28F0]" />
                  <div>
                    <p className="text-sm font-semibold">Collab Project</p>
                    <p className="text-xs text-slate-400">Find project partners</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Messages Dropdown on Hover */}
          <div
            className="relative hidden sm:flex items-center justify-center py-2"
            onMouseEnter={() => { setMessagesOpen(true); setNotificationsOpen(false); setCreateMenuOpen(false); }}
            onMouseLeave={() => setMessagesOpen(false)}
          >
            <button
              onClick={() => setMessagesOpen(!messagesOpen)}
              className={`text-slate-500 hover:text-slate-900 relative p-2 rounded-full transition-colors ${messagesOpen ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100'}`}
              aria-label="Messages"
            >
              <MessageSquare size={19} />
            </button>
            {messagesOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-[360px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-4"
              >
                <div className="px-5 py-3.5 flex justify-between items-center bg-white border-b border-slate-100">
                  <h3 className="font-bold text-[16px] text-slate-900 tracking-tight">Messages</h3>
                  <button className="p-1.5 rounded-lg bg-[#F3E8FF] text-[#7828F0] hover:bg-[#E9D5FF] transition-colors shadow-sm">
                    <Edit size={16} strokeWidth={2} />
                  </button>
                </div>
                <div className="px-4 py-2.5 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search messages" className="w-full bg-[#F8FAFC] rounded-full py-2 pl-9 pr-4 text-[14px] outline-none focus:bg-slate-100 transition-colors text-slate-800 placeholder:text-slate-400 font-medium" />
                  </div>
                </div>
                <div className="h-[180px] flex flex-col items-center justify-center bg-white">
                  <MessageSquare size={32} strokeWidth={1.5} className="text-slate-400 mb-3 opacity-70" />
                  <p className="text-[14px] font-medium text-slate-400">No messages yet</p>
                </div>
                <div className="p-3 bg-white border-t border-slate-100 text-center rounded-b-2xl">
                  <button className="text-[14px] font-bold text-[#7828F0] hover:text-[#6020c0] transition-colors w-full py-1">See all in Messages</button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown on Hover */}
          <div
            className="relative flex items-center justify-center py-2"
            onMouseEnter={() => { setNotificationsOpen(true); setMessagesOpen(false); setCreateMenuOpen(false); }}
            onMouseLeave={() => setNotificationsOpen(false)}
          >
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`text-slate-500 hover:text-slate-900 relative p-2 rounded-full transition-colors flex items-center justify-center ${notificationsOpen ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100'}`}
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>
            {notificationsOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-[360px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-4"
              >
                <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex justify-between items-center">
                  <h3 className="font-bold text-[16px] text-slate-900 tracking-tight">Notifications</h3>
                </div>
                <div className="h-[200px] flex flex-col items-center justify-center bg-white">
                  <Bell size={32} strokeWidth={1.5} className="text-slate-400 mb-3 opacity-70" />
                  <p className="text-[14px] font-medium text-slate-400">No notifications yet</p>
                </div>
                <div className="p-3 bg-white border-t border-slate-100 text-center rounded-b-2xl">
                  <button className="text-[14px] font-bold text-[#7828F0] hover:text-[#6020c0] transition-colors w-full py-1">See all notifications</button>
                </div>
              </div>
            )}
          </div>

          <div 
            className="relative flex items-center justify-center py-2 ml-1"
            onMouseEnter={() => { setProfileMenuOpen(true); setNotificationsOpen(false); setMessagesOpen(false); setCreateMenuOpen(false); }}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-full bg-[#7828F0] text-white flex items-center justify-center text-[14px] font-bold cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              {user ? (user.name.charAt(0) + (user.name.split(' ')[1]?.[0] || '')).toUpperCase() : 'U'}
            </div>
            
            {profileMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 p-2">
                <div className="flex flex-col gap-1 text-[15px] font-medium text-slate-700">
                  <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors w-full text-left">
                    <Settings size={18} className="text-slate-500" />
                    Preferences
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors w-full text-left">
                    <HelpCircle size={18} className="text-slate-500" />
                    Help
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors w-full text-left">
                    <MessageSquareText size={18} className="text-slate-500" />
                    Send feedback
                  </button>
                </div>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors w-full text-left font-medium"
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full relative">
        {/* Left Sidebar */}
        <aside className={`
          absolute lg:static inset-y-0 left-0 z-40 w-64 bg-[#F8FAFC] 
          transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out
          flex flex-col h-[calc(100vh-4rem)] overflow-y-auto pb-4 no-scrollbar pt-5
        `}>
          {/* User Profile Block */}
          <div className="shrink-0 mx-4 mb-3 p-3.5 rounded-2xl flex items-center gap-3 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-[#7828F0] text-white flex items-center justify-center font-bold text-[19px] shadow-sm shrink-0">
              {user ? (user.name.charAt(0) + (user.name.split(' ')[1]?.[0] || '')).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[15px] text-slate-900 leading-tight truncate">{user ? user.name : 'User'}</span>
              <span className="text-[13px] font-semibold text-[#7828F0] mt-0.5 group-hover:underline">View profile</span>
            </div>
          </div>

          {/* Main Menu Block */}
          <div className="shrink-0 mx-4 mb-3 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col py-2">
            <div className="flex flex-col">
              <NavLink to="/feed" icon={<Home size={20} />} label="Feed" />
              <NavLink to="/welcome" icon={<Hand size={20} />} label="Welcome" />
              <NavLink to="/events" icon={<Calendar size={20} />} label="Events" />
              <NavLink to="/jobs" icon={<Briefcase size={20} />} label="Opportunity Hub" active={location.pathname === '/jobs'} />
              <NavLink to="/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" />
            </div>
          </div>

          {/* Game Arena Block */}
          <div className="shrink-0 mx-4 mb-3 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col py-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-5 py-2 text-[15px] font-bold text-slate-700">
                <span className="flex items-center gap-2.5"><Gamepad2 size={20} className="text-slate-600" /> Game Arena</span>
                <span className="bg-[#7828F0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">New</span>
              </div>
              <div className="pl-11 pr-3 flex flex-col mt-0.5">
                <SubNavLink to="/quiz" icon={<BrainCircuit size={17} />} label="Quiz" />
                <SubNavLink to="/hackathon" icon={<Code2 size={17} />} label="Hackathon" />
                <SubNavLink to="/tournament" icon={<Trophy size={17} />} label="Tournament" />
              </div>
            </div>
          </div>

          {/* Communities Block */}
          <div className="shrink-0 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col py-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-5 py-2 text-[16px] font-bold text-slate-900">
                <span>Communities</span>
                <span className="text-[13px] text-slate-400 font-bold">6</span>
              </div>
              <div className="flex flex-col mt-1">
                <SubNavLink to="/c/ai-founders" icon={<Rocket size={18} strokeWidth={2} />} label="AI Founders" />
                <SubNavLink to="/c/student" icon={<GraduationCap size={18} strokeWidth={2} />} label="Student Benefit" />
                <SubNavLink to="/collab" icon={<Users size={18} strokeWidth={2} />} label="Collab Space" active={location.pathname === '/collab'} />
                <SubNavLink to="/c/learning" icon={<BookOpen size={18} strokeWidth={2} />} label="Learning Community" />
                <SubNavLink to="/c/marketplace" icon={<Store size={18} strokeWidth={2} />} label="Marketplace" />
                <SubNavLink to="/c/retail" icon={<ShoppingBag size={18} strokeWidth={2} />} label="Retail Connect" />
              </div>
            </div>
          </div>

          {/* Bottom Sidebar Box */}
          <div className="shrink-0 mt-auto px-4 pb-6 pt-4">
            <div className="bg-white rounded-2xl p-2 flex flex-col gap-0.5 shadow-sm">
              <SubNavLink to="/saved" icon={<Bookmark size={18} strokeWidth={2.2} />} label="Saved opportunities" />
              <SubNavLink to="/news" icon={<Newspaper size={18} strokeWidth={2.2} />} label="News" />
              <SubNavLink to="/feedback" icon={<MessageSquareText size={18} strokeWidth={2.2} />} label="Send feedback" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3 text-[15px] font-medium transition-colors ${active
        ? 'bg-[#F3E8FF] text-[#7828F0] font-bold border-l-4 border-[#7828F0] pl-4'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent pl-4'
        }`}
    >
      <span className={active ? "text-[#7828F0]" : "text-slate-500"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function SubNavLink({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-2.5 text-[14.5px] transition-colors ${active
        ? 'bg-[#F3E8FF] text-[#7828F0] font-bold border-l-4 border-[#7828F0] pl-4'
        : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent pl-4'
        }`}
    >
      <span className={active ? "text-[#7828F0]" : "text-slate-400"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
