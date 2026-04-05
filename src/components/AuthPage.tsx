import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Zap, Search, BarChart3, Filter, Bell } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, name: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, isSignUp ? name : email.split('@')[0]);
    }
  };

  const features = [
    { icon: Search, title: 'Chartlink-style Scan Builder', desc: 'Create custom scans with 50+ indicators' },
    { icon: BarChart3, title: 'Real-time NSE Charts', desc: 'Interactive charts with technical analysis' },
    { icon: Filter, title: 'Smart Stock Screener', desc: 'Filter stocks by any criteria instantly' },
    { icon: Bell, title: 'Price Alerts', desc: 'Get notified when conditions are met' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">FluxNSE</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase">Stock Scanner Platform</p>
          </div>
        </div>

        <h2 className="text-5xl font-bold text-white mb-2">Powerful NSE</h2>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">Stock Scanner</h2>
        
        <p className="text-gray-400 text-lg mb-12 max-w-md leading-relaxed">
          Build custom scans like Chartlink, analyze with real-time data, and discover winning trades with advanced technical indicators.
        </p>

        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4 bg-[#1a1a2e]/60 border border-gray-800/50 rounded-xl px-5 py-4 backdrop-blur-sm hover:border-gray-700/60 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-[#0d0d14]">
        <div className="w-full max-w-md">
          <div className="bg-[#13131d] border border-gray-800/60 rounded-2xl p-8 shadow-2xl">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">FluxNSE</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✨</span>
              <span className="text-cyan-400 text-sm font-medium">Welcome back!</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-8">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-[#0a0a12] border border-gray-700/60 rounded-xl text-white placeholder-gray-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a12] border border-gray-700/60 rounded-xl text-white placeholder-gray-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a12] border border-gray-700/60 rounded-xl text-white placeholder-gray-600 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          <p className="text-center text-gray-600 text-xs mt-4">
            Demo: Use any email/password to register
          </p>
        </div>
      </div>
    </div>
  );
}
