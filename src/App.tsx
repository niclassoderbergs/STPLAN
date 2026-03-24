import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, CheckSquare, Settings, Search, Filter, Info, LogOut, UserCircle2, Clock, Hospital, Calendar, Plus } from 'lucide-react';
import { GOALS_DATA, Goal, GoalStatus, Category, User, Rotation } from './data/goals';
import GoalCard from './components/GoalCard';
import ProgressBar from './components/ProgressBar';
import Login from './components/Login';
import Rotations from './components/Rotations';

type View = 'GOALS' | 'ROTATIONS';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('st_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [goals, setGoals] = useState<Goal[]>(GOALS_DATA);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<View>('GOALS');
  const [shouldOpenAddRotation, setShouldOpenAddRotation] = useState(false);

  // Load user specific data when user changes
  useEffect(() => {
    if (currentUser) {
      // First, check if there's a master list edited by admin
      const masterSaved = localStorage.getItem('st_goals_master');
      const baseGoals = masterSaved ? JSON.parse(masterSaved) : GOALS_DATA;

      const storageKey = `st_goals_progress_${currentUser.id}`;
      const savedGoals = localStorage.getItem(storageKey);
      
      const rotationKey = `st_rotations_${currentUser.id}`;
      const savedRotations = localStorage.getItem(rotationKey);
      
      if (savedGoals) {
        const userProgress = JSON.parse(savedGoals);
        // Merge user progress with current base goals (in case admin changed texts)
        const mergedGoals = baseGoals.map((bg: Goal) => {
          const up = userProgress.find((p: Goal) => p.id === bg.id);
          if (up) {
            return {
              ...bg,
              status: up.status,
              activities: bg.activities.map((ba: any) => {
                const ua = up.activities.find((a: any) => a.id === ba.id);
                return ua ? { ...ba, completed: ua.completed, subActivities: ua.subActivities } : ba;
              }).concat(up.activities.filter((ua: any) => ua.isCustom)) // Keep custom activities
            };
          }
          return bg;
        });
        setGoals(mergedGoals);
      } else {
        setGoals(baseGoals);
      }

      if (savedRotations) {
        setRotations(JSON.parse(savedRotations));
      } else {
        setRotations([]);
      }

      localStorage.setItem('st_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('st_current_user');
    }
  }, [currentUser]);

  // Save progress when goals or rotations change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        localStorage.setItem('st_goals_master', JSON.stringify(goals));
      } else {
        const storageKey = `st_goals_progress_${currentUser.id}`;
        localStorage.setItem(storageKey, JSON.stringify(goals));
        
        const rotationKey = `st_rotations_${currentUser.id}`;
        localStorage.setItem(rotationKey, JSON.stringify(rotations));
      }
    }
  }, [goals, rotations, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveCategory('ALL');
    setSearchQuery('');
    setCurrentView('GOALS');
  };

  const handleGoalUpdate = (updatedGoal: Goal) => {
    if (currentUser?.role !== 'admin') return;
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleStatusChange = (goalId: string, status: GoalStatus) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status } : g));
  };

  const handleActivityToggle = (goalId: string, activityId: string, forceValue?: boolean) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newActivities = g.activities.map(a => {
          if (a.id === activityId) {
            const newValue = forceValue !== undefined ? forceValue : !a.completed;
            // If we mark parent as completed, mark all sub-activities as completed too
            const updatedSubActivities = a.subActivities?.map(sa => ({ ...sa, completed: newValue }));
            return { ...a, completed: newValue, subActivities: updatedSubActivities };
          }
          return a;
        });

        // Auto-update goal status based on activities
        const completedCount = newActivities.filter(a => a.completed).length;
        let newStatus: GoalStatus = 'planerad';
        if (completedCount === newActivities.length) {
          newStatus = 'utförd';
        } else if (completedCount > 0) {
          newStatus = 'pågående';
        }

        return { ...g, activities: newActivities, status: newStatus };
      }
      return g;
    }));
  };

  const handleActivityAdd = (goalId: string, text: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newActivity = {
          id: `${goalId}-custom-${Date.now()}`,
          text,
          completed: false,
          isCustom: true
        };
        return { ...g, activities: [...g.activities, newActivity] };
      }
      return g;
    }));
  };

  const handleActivityDelete = (goalId: string, activityId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, activities: g.activities.filter(a => a.id !== activityId) };
      }
      return g;
    }));
  };

  const handleSubActivityToggle = (goalId: string, activityId: string, subActivityId: string, forceValue?: boolean) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newActivities = g.activities.map(a => {
          if (a.id === activityId) {
            const newSubActivities = a.subActivities?.map(sa => 
              sa.id === subActivityId ? { ...sa, completed: forceValue !== undefined ? forceValue : !sa.completed } : sa
            );
            
            // Auto-update parent activity completion if all sub-activities are done
            const allDone = newSubActivities?.every(sa => sa.completed);
            
            return { 
              ...a, 
              subActivities: newSubActivities,
              completed: allDone ?? a.completed 
            };
          }
          return a;
        });

        // Auto-update goal status
        const completedCount = newActivities.filter(a => a.completed).length;
        let newStatus: GoalStatus = 'planerad';
        if (completedCount === newActivities.length) {
          newStatus = 'utförd';
        } else if (completedCount > 0) {
          newStatus = 'pågående';
        }

        return { ...g, activities: newActivities, status: newStatus };
      }
      return g;
    }));
  };

  const handleSubActivityAdd = (goalId: string, activityId: string, text: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newActivities = g.activities.map(a => {
          if (a.id === activityId) {
            const newSubActivity = {
              id: `${activityId}-sub-${Date.now()}`,
              text,
              completed: false
            };
            return { 
              ...a, 
              subActivities: [...(a.subActivities || []), newSubActivity],
              completed: false 
            };
          }
          return a;
        });
        return { ...g, activities: newActivities };
      }
      return g;
    }));
  };

  const handleSubActivityDelete = (goalId: string, activityId: string, subActivityId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newActivities = g.activities.map(a => {
          if (a.id === activityId) {
            const newSubActivities = a.subActivities?.filter(sa => sa.id !== subActivityId);
            const allDone = newSubActivities && newSubActivities.length > 0 ? newSubActivities.every(sa => sa.completed) : a.completed;
            return { 
              ...a, 
              subActivities: newSubActivities,
              completed: allDone
            };
          }
          return a;
        });
        return { ...g, activities: newActivities };
      }
      return g;
    }));
  };

  // Rotation Handlers
  const handleAddRotation = (clinic: string, startDate: string, endDate?: string) => {
    const id = `rot-${Date.now()}`;
    const newRotation: Rotation = {
      id,
      clinic,
      startDate,
      endDate,
      activityIds: []
    };
    setRotations(prev => [...prev, newRotation]);
    return id;
  };

  const handleUpdateRotation = (updatedRotation: Rotation) => {
    setRotations(prev => prev.map(r => r.id === updatedRotation.id ? updatedRotation : r));
  };

  const handleDeleteRotation = (id: string) => {
    setRotations(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleActivityInRotation = (rotationId: string, itemId: string, goalId: string, parentActivityId?: string) => {
    setRotations(prev => prev.map(r => {
      if (r.id === rotationId) {
        const isSelected = r.activityIds.includes(itemId);
        const newActivityIds = isSelected 
          ? r.activityIds.filter(id => id !== itemId)
          : [...r.activityIds, itemId];
        
        let newCompletedIds = r.completedActivityIds || [];
        if (isSelected) {
          // If removed from rotation, also remove from completed if it was there
          const wasCompleted = newCompletedIds.includes(itemId);
          newCompletedIds = newCompletedIds.filter(id => id !== itemId);
          
          if (wasCompleted) {
            // And unmark in main list
            if (parentActivityId) {
              handleSubActivityToggle(goalId, parentActivityId, itemId, false);
            } else {
              handleActivityToggle(goalId, itemId, false);
            }
          }
        }

        return { ...r, activityIds: newActivityIds, completedActivityIds: newCompletedIds };
      }
      return r;
    }));
  };

  const handleToggleFulfilledInRotation = (rotationId: string, itemId: string, goalId: string, parentActivityId?: string) => {
    setRotations(prev => prev.map(r => {
      if (r.id === rotationId) {
        const completedIds = r.completedActivityIds || [];
        const isCompleted = completedIds.includes(itemId);
        const newCompletedIds = isCompleted 
          ? completedIds.filter(id => id !== itemId)
          : [...completedIds, itemId];
        
        // Sync with main goal list
        if (parentActivityId) {
          handleSubActivityToggle(goalId, parentActivityId, itemId, !isCompleted);
        } else {
          handleActivityToggle(goalId, itemId, !isCompleted);
        }

        return { ...r, completedActivityIds: newCompletedIds };
      }
      return r;
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

    const getCategoryStats = (cat: Category) => {
      const catGoals = goals.filter(g => g.category === cat);
      const catActivities = catGoals.flatMap(g => g.activities);
      const catSubActivities = catActivities.flatMap(a => a.subActivities || []);
      
      const allItems = [...catActivities, ...catSubActivities];
      const total = allItems.length;
      const fulfilled = allItems.filter(i => i.completed).length;
      
      // Ongoing = in a rotation AND not completed
      const rotationActivityIds = new Set(rotations.flatMap(r => r.activityIds));
      const ongoing = allItems.filter(i => !i.completed && rotationActivityIds.has(i.id)).length;
      
      return {
        total,
        fulfilled,
        ongoing,
        fulfilledPercent: total > 0 ? (fulfilled / total) * 100 : 0,
        ongoingPercent: total > 0 ? (ongoing / total) * 100 : 0
      };
    };

    return {
      overall: total > 0 ? (utförda / total) * 100 : 0,
      activities: totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0,
      utförda,
      pågående,
      total,
      categories: {
        A: getCategoryStats('A'),
        B: getCategoryStats('B'),
        C: getCategoryStats('C')
      }
    };
  }, [goals, rotations]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Sidebar / Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20 shadow-sm">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">ST</div>
            <h1 className="font-bold text-lg tracking-tight">Målspåraren</h1>
          </div>

          <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <UserCircle2 size={20} />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-semibold">Inloggad</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
            >
              <LogOut size={14} /> Logga ut
            </button>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => { setCurrentView('GOALS'); setActiveCategory('ALL'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'GOALS' && activeCategory === 'ALL' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} /> Översikt
            </button>
            <button 
              onClick={() => setCurrentView('ROTATIONS')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'ROTATIONS' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Clock size={18} /> Randningar
            </button>
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategorier</div>
            <button 
              onClick={() => { setCurrentView('GOALS'); setActiveCategory('A'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'GOALS' && activeCategory === 'A' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center font-bold">A</span> Allmänna delmål
            </button>
            <button 
              onClick={() => { setCurrentView('GOALS'); setActiveCategory('B'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'GOALS' && activeCategory === 'B' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center font-bold">B</span> Ledarskap & Komm.
            </button>
            <button 
              onClick={() => { setCurrentView('GOALS'); setActiveCategory('C'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'GOALS' && activeCategory === 'C' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="w-5 text-center font-bold">C</span> Kliniska delmål
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100">
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
        {/* Mobile Header (User Info) */}
        <div className="lg:hidden flex items-center justify-between mb-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCircle2 size={20} />
            </div>
            <div>
              <div className="font-bold text-sm">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">ST-läkare</div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600">
            <LogOut size={20} />
          </button>
        </div>

        {currentView === 'GOALS' ? (
          <>
            {/* Header */}
            <header className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Hej {currentUser.name.split(' ')[1]}!</h2>
                  <p className="text-slate-500 max-w-xl text-lg">
                    Här är din individuella utbildningsplan. Fortsätt bocka av dina mål för att nå din specialistkompetens.
                  </p>
                  <button 
                    onClick={() => { setCurrentView('ROTATIONS'); setShouldOpenAddRotation(true); }}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Plus size={20} /> Ny randning
                  </button>
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

            {activeCategory === 'ALL' && !searchQuery && (
              <div className="space-y-10 mb-12">
                {/* Ongoing Rotations */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-emerald-600" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Pågående randningar</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rotations.filter(r => !r.endDate || r.endDate >= new Date().toISOString().split('T')[0]).length > 0 ? (
                      rotations
                        .filter(r => !r.endDate || r.endDate >= new Date().toISOString().split('T')[0])
                        .sort((a, b) => b.startDate.localeCompare(a.startDate))
                        .map(rotation => (
                          <div key={rotation.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setCurrentView('ROTATIONS')}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Hospital size={20} />
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-bold text-slate-900 truncate">{rotation.clinic}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  {rotation.startDate} — {rotation.endDate || 'Pågående'}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span>Framsteg</span>
                                <span>{Math.round(((rotation.completedActivityIds?.length || 0) / rotation.activityIds.length) * 100 || 0)}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${((rotation.completedActivityIds?.length || 0) / rotation.activityIds.length) * 100 || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="col-span-full py-8 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">
                        Inga pågående randningar just nu.
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Progress */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <LayoutDashboard className="text-emerald-600" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Kategoriframsteg</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {(['A', 'B', 'C'] as const).map(cat => {
                      const s = stats.categories[cat];
                      return (
                        <div key={cat} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                                {cat}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">Kategori {cat}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  {cat === 'A' ? 'Allmänna' : cat === 'B' ? 'Ledarskap' : 'Kliniska'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-600">{Math.round(s.fulfilledPercent)}%</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Klar</div>
                              {s.ongoingPercent > 0 && (
                                <div className="text-[9px] font-bold text-amber-500 mt-0.5">+{Math.round(s.ongoingPercent)}% pågående</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                              {/* Fulfilled Bar */}
                              <div 
                                className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500 z-10"
                                style={{ width: `${s.fulfilledPercent}%` }}
                              />
                              {/* Ongoing Bar */}
                              <div 
                                className="absolute left-0 top-0 h-full bg-amber-400 transition-all duration-500 opacity-60"
                                style={{ width: `${s.fulfilledPercent + s.ongoingPercent}%` }}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>{s.fulfilled} Uppfyllda</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-amber-600">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>{s.ongoing} Pågående</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

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
                        onActivityAdd={handleActivityAdd}
                        onActivityDelete={handleActivityDelete}
                        onSubActivityToggle={handleSubActivityToggle}
                        onSubActivityAdd={handleSubActivityAdd}
                        onSubActivityDelete={handleSubActivityDelete}
                        isAdmin={currentUser.role === 'admin'}
                        onGoalUpdate={handleGoalUpdate}
                        rotations={rotations}
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
          </>
        ) : (
          <Rotations 
            rotations={rotations}
            goals={goals}
            onAddRotation={handleAddRotation}
            onUpdateRotation={handleUpdateRotation}
            onDeleteRotation={handleDeleteRotation}
            onToggleActivityInRotation={handleToggleActivityInRotation}
            onToggleFulfilledInRotation={handleToggleFulfilledInRotation}
            onSubActivityAdd={handleSubActivityAdd}
            initialIsAdding={shouldOpenAddRotation}
            onResetInitialIsAdding={() => setShouldOpenAddRotation(false)}
          />
        )}

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
