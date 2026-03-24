import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, CheckSquare, Settings, Search, Filter, Info, Github } from 'lucide-react';
import { GOALS_DATA, Goal, GoalStatus, Category } from './data/goals';
import GoalCard from './components/GoalCard';
import ProgressBar from './components/ProgressBar';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('st_goals_progress');
    return saved ? JSON.parse(saved) : GOALS_DATA;
  });
  const [activeCategory, setActiveCategory] = useState<'A' | 'B' | 'C' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('st_goals_progress', JSON.stringify(goals));
  }, [goals]);

  const handleStatusChange = (goalId: string, status: GoalStatus) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g));
  };

  const handleActivityToggle = (goalId: string, activityId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newActivities = g.activities.map(a => 
          a.id === activityId ? { ...a, completed: !a.completed } : a
        );
        // Auto-update status if all activities completed? Maybe not, let user decide.
        return { ...g, activities: newActivities };
      }
      return g;
    }));
  };

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      const matchesCategory = activeCategory === 'ALL' || g.category === activeCategory;
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           g.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [goals, activeCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = goals.length;
    const utförda = goals.filter(g => g.status === 'utförd').length;
    const pågående = goals.filter(g => g.status === 'pågående').length;
    
    const totalActivities = goals.reduce((acc, g) => acc + g.activities.length, 0);
    const completedActivities = goals.reduce((acc, g) => acc + g.activities.filter(a => a.completed).length, 0);

    return {
      overall: (utförda / total) * 100,
      activities: (completedActivities / totalActivities) * 100,
      utförda,
      pågående,
      total
    };
  }, [goals]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Sidebar / Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
            <h1 className="font-bold text-lg tracking-tight">Målspåraren</h1>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveCategory('ALL')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'ALL' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} /> Översikt
            </button>
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategorier</div>
            <button 
              onClick={() => setActiveCategory('A')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'A' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center font-bold">A</span> Allmänna delmål
            </button>
            <button 
              onClick={() => setActiveCategory('B')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'B' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center font-bold">B</span> Ledarskap & Komm.
            </button>
            <button 
              onClick={() => setActiveCategory('C')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'C' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center font-bold">C</span> Kliniska delmål
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Din Progress</h4>
            <ProgressBar progress={stats.overall} />
            <p className="text-[10px] text-slate-500 mt-2 font-medium">
              {stats.utförda} av {stats.total} delmål klara
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Välkommen till din ST-plan</h2>
              <p className="text-slate-500 max-w-xl">
                Här kan du enkelt följa din specialiseringstjänstgöring. Bocka av aktiviteter, uppdatera status och se din totala progress i realtid.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="px-4 py-2 text-center border-r border-slate-100">
                <div className="text-xl font-bold text-emerald-600">{stats.utförda}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klara</div>
              </div>
              <div className="px-4 py-2 text-center border-r border-slate-100">
                <div className="text-xl font-bold text-amber-500">{stats.pågående}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pågående</div>
              </div>
              <div className="px-4 py-2 text-center">
                <div className="text-xl font-bold text-slate-400">{stats.total - stats.utförda - stats.pågående}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kvar</div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Sök på delmål eller titel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {(['ALL', 'A', 'B', 'C'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap border ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {cat === 'ALL' ? 'Alla Mål' : `Kategori ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <GoalCard 
                    goal={goal} 
                    onStatusChange={handleStatusChange}
                    onActivityToggle={handleActivityToggle}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Inga mål hittades</h3>
                <p className="text-slate-500">Prova att ändra din sökning eller kategori.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <Info size={16} />
            <span>Baserat på SOSFS 2015:8 och Region Kalmars rekommendationer.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Hjälp & Support</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Exportera Data</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
