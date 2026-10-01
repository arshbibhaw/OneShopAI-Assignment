import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, LogIn, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: ''
  });

  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (token) {
      navigate('/portal');
    }
  }, [token, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          email: formData.email, 
          password: formData.password, 
          name: formData.name, 
          username: formData.username 
        };

    fetch(`http://localhost:4000/api/auth${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.token && data.user) {
          login(data.token, data.user);
          navigate('/portal');
        } else {
          setError(data.error || 'Authentication failed');
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('Network error. Please try again.');
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 font-sans selection:bg-[#7828F0] selection:text-white p-6">
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-500 text-[15px]">
              {isLogin ? 'Enter your credentials to access the portal.' : 'Join to explore the evaluator portal.'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0] transition-colors"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
                    Username
                    <span className="text-[12px] font-normal text-slate-500">Only letters, numbers, _</span>
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^[a-zA-Z0-9_]+$"
                    minLength={3}
                    maxLength={30}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0] transition-colors"
                    placeholder="johndoe123"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-1.5">Email / Username (Login)</label>
              <input
                type={isLogin ? 'text' : 'email'}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0] transition-colors"
                placeholder={isLogin ? "you@example.com or username" : "you@example.com"}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7828F0] focus:ring-1 focus:ring-[#7828F0] transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7828F0] hover:bg-[#6020c0] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:pointer-events-none mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-[14px]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-[#7828F0] font-bold hover:underline transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
