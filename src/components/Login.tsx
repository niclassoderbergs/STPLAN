import { motion } from 'motion/react';
import { User, DUMMY_USERS } from '../data/goals';
import { LogIn, UserCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center"
      >
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-emerald-200">
          ST
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Välkommen tillbaka</h1>
        <p className="text-slate-500 mb-10">Välj din profil för att fortsätta med din ST-planering.</p>

        <div className="space-y-4">
          {DUMMY_USERS.map((user) => (
            <motion.button
              key={user.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLogin(user)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-emerald-200 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <UserCircle2 size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-slate-900">{user.name}</div>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">Admin</span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
              <LogIn size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </motion.button>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 text-xs text-slate-400">
          Detta är en demo-version. All data sparas lokalt i din webbläsare.
        </div>
      </motion.div>
    </div>
  );
}
