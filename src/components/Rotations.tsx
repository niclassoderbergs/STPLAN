import { useState, useEffect, FormEvent } from 'react';
import { Plus, Calendar, Hospital, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Clock, Edit2, Save, X, ChevronRight } from 'lucide-react';
import { Rotation, Goal, Category } from '../data/goals';
import { motion, AnimatePresence } from 'motion/react';

interface RotationsProps {
  rotations: Rotation[];
  goals: Goal[];
  onAddRotation: (clinic: string, startDate: string, endDate?: string) => string;
  onUpdateRotation: (rotation: Rotation) => void;
  onDeleteRotation: (id: string) => void;
  onToggleActivityInRotation: (rotationId: string, itemId: string, goalId: string, parentActivityId?: string) => void;
  onToggleFulfilledInRotation: (rotationId: string, itemId: string, goalId: string, parentActivityId?: string) => void;
  onSubActivityAdd: (goalId: string, activityId: string, text: string) => void;
  initialIsAdding?: boolean;
  onResetInitialIsAdding?: () => void;
}

export default function Rotations({ 
  rotations, 
  goals, 
  onAddRotation, 
  onUpdateRotation, 
  onDeleteRotation, 
  onToggleActivityInRotation,
  onToggleFulfilledInRotation,
  onSubActivityAdd,
  initialIsAdding,
  onResetInitialIsAdding
}: RotationsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newClinic, setNewClinic] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editClinic, setEditClinic] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Handle initialIsAdding from parent
  useEffect(() => {
    if (initialIsAdding) {
      setIsAdding(true);
      onResetInitialIsAdding?.();
    }
  }, [initialIsAdding, onResetInitialIsAdding]);

  // Goal addition wizard state
  const [addingGoalToRotationId, setAddingGoalToRotationId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<'CATEGORY' | 'GOAL' | 'ACTIVITIES'>('CATEGORY');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [newSubActivityText, setNewSubActivityText] = useState<Record<string, string>>({});

  const findItem = (itemId: string) => {
    for (const g of goals) {
      for (const a of g.activities) {
        if (a.id === itemId) return { goal: g, activity: a, sub: null };
        if (a.subActivities) {
          const sub = a.subActivities.find(sa => sa.id === itemId);
          if (sub) return { goal: g, activity: a, sub };
        }
      }
    }
    return null;
  };

  const getGroupedActivities = (activityIds: string[]) => {
    const groups: Record<Category, Record<string, { goal: Goal; items: string[] }>> = {
      'A': {},
      'B': {},
      'C': {},
      'ALL': {}
    };

    activityIds.forEach(id => {
      const found = findItem(id);
      if (found) {
        const { goal } = found;
        if (!groups[goal.category][goal.id]) {
          groups[goal.category][goal.id] = { goal, items: [] };
        }
        groups[goal.category][goal.id].items.push(id);
      }
    });

    return groups;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newClinic && newStartDate) {
      const newId = onAddRotation(newClinic, newStartDate, newEndDate || undefined);
      setNewClinic('');
      setNewStartDate('');
      setNewEndDate('');
      setIsAdding(false);
      
      // Automatically open wizard for the new rotation
      setAddingGoalToRotationId(newId);
      setWizardStep('CATEGORY');
      setExpandedId(newId);
    }
  };

  const startEditing = (rotation: Rotation) => {
    setEditingId(rotation.id);
    setEditClinic(rotation.clinic);
    setEditStartDate(rotation.startDate);
    setEditEndDate(rotation.endDate || '');
  };

  const handleUpdate = (id: string) => {
    const rotation = rotations.find(r => r.id === id);
    if (rotation) {
      onUpdateRotation({
        ...rotation,
        clinic: editClinic,
        startDate: editStartDate,
        endDate: editEndDate || undefined
      });
    }
    setEditingId(null);
  };

  const resetWizard = () => {
    setAddingGoalToRotationId(null);
    setWizardStep('CATEGORY');
    setSelectedCategory(null);
    setSelectedGoalId(null);
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Randningar</h2>
          <p className="text-slate-500">Registrera dina sidotjänstgöringar och koppla dem till delmål.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm"
        >
          {isAdding ? 'Avbryt' : <><Plus size={18} /> Ny randning</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Klinik / Enhet</label>
                  <div className="relative">
                    <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="T.ex. Medicinkliniken"
                      value={newClinic}
                      onChange={(e) => setNewClinic(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Startdatum</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slutdatum (valfritt)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Spara randning
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {rotations.length > 0 ? (
          rotations.map((rotation) => (
            <div key={rotation.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(expandedId === rotation.id ? null : rotation.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                    <Hospital size={24} />
                  </div>
                  <div className="flex-1">
                    {editingId === rotation.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                          value={editClinic}
                          onChange={(e) => setEditClinic(e.target.value)}
                          className="px-2 py-1 border rounded text-sm font-bold"
                          placeholder="Klinik"
                        />
                        <input 
                          type="date"
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input 
                          type="date"
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-slate-900">{rotation.clinic}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {rotation.startDate} — {rotation.endDate || <span className="text-amber-600 font-bold uppercase tracking-tighter">Pågående</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 font-medium text-emerald-600">
                              <CheckCircle2 size={12} /> {rotation.completedActivityIds?.length || 0}/{rotation.activityIds.length} delmål
                            </div>
                            {rotation.activityIds.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${((rotation.completedActivityIds?.length || 0) / rotation.activityIds.length) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {Math.round(((rotation.completedActivityIds?.length || 0) / rotation.activityIds.length) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === rotation.id ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleUpdate(rotation.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <Save size={18} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(rotation);
                      }}
                      className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRotation(rotation.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="text-slate-400">
                    {expandedId === rotation.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === rotation.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="p-6 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mål i denna randning</h4>
                        <button
                          onClick={() => setAddingGoalToRotationId(rotation.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Plus size={14} /> Lägg till mål
                        </button>
                      </div>

                      {rotation.activityIds.length > 0 ? (
                        <div className="space-y-8">
                          {Object.entries(getGroupedActivities(rotation.activityIds)).map(([cat, goals]) => {
                            if (Object.keys(goals).length === 0) return null;
                            return (
                              <div key={cat} className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                    {cat}
                                  </div>
                                  <h5 className="font-bold text-slate-900">Kategori {cat}</h5>
                                </div>
                                
                                <div className="grid gap-6 pl-4 border-l-2 border-slate-100">
                                  {Object.entries(goals).map(([goalId, { goal, items }]) => (
                                    <div key={goalId} className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                          {goalId}
                                        </span>
                                        <h6 className="text-sm font-bold text-slate-700">{goal.title}</h6>
                                      </div>
                                      
                                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {items.map((itemId) => {
                                          const item = findItem(itemId);
                                          if (!item) return null;
                                          const isFulfilled = rotation.completedActivityIds?.includes(itemId);

                                          return (
                                            <div
                                              key={itemId}
                                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                                isFulfilled 
                                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm' 
                                                  : 'bg-white border-slate-200 text-slate-600'
                                              }`}
                                            >
                                              <button
                                                onClick={() => onToggleFulfilledInRotation(rotation.id, itemId, item.goal.id, item.sub ? item.activity.id : undefined)}
                                                className={isFulfilled ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}
                                              >
                                                {isFulfilled ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                              </button>
                                              <div className="overflow-hidden flex-1">
                                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                                  {item.sub ? `Delmål: ${item.activity.text}` : 'Aktivitet'}
                                                </div>
                                                <div className={`text-sm font-semibold truncate ${isFulfilled ? '' : 'text-slate-500'}`}>
                                                  {item.sub ? item.sub.text : item.activity.text}
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => onToggleActivityInRotation(rotation.id, itemId, item.goal.id, item.sub ? item.activity.id : undefined)}
                                                className="ml-auto p-1 text-slate-300 hover:text-rose-500"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                          Inga mål kopplade än.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Inga randningar registrerade</h3>
            <p className="text-slate-500">Klicka på "Ny randning" för att börja logga dina sidotjänstgöringar.</p>
          </div>
        )}
      </div>

      {/* Goal Addition Wizard Modal */}
      <AnimatePresence>
        {addingGoalToRotationId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Koppla mål till randning</h3>
                  <p className="text-sm text-slate-500">Välj kategori, mål och sedan specifika delmål.</p>
                </div>
                <button onClick={resetWizard} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest">
                  <button 
                    onClick={() => setWizardStep('CATEGORY')}
                    className={wizardStep === 'CATEGORY' ? 'text-emerald-600' : 'text-slate-400'}
                  >
                    Kategori
                  </button>
                  <ChevronRight size={12} className="text-slate-300" />
                  <button 
                    disabled={!selectedCategory}
                    onClick={() => setWizardStep('GOAL')}
                    className={wizardStep === 'GOAL' ? 'text-emerald-600' : 'text-slate-400 disabled:opacity-50'}
                  >
                    Mål
                  </button>
                  <ChevronRight size={12} className="text-slate-300" />
                  <span className={wizardStep === 'ACTIVITIES' ? 'text-emerald-600' : 'text-slate-400'}>
                    Delmål
                  </span>
                </div>

                {wizardStep === 'CATEGORY' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['A', 'B', 'C'] as Category[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setWizardStep('GOAL'); }}
                        className="p-8 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center group"
                      >
                        <div className="text-4xl font-black text-slate-200 group-hover:text-emerald-200 mb-2 transition-colors">{cat}</div>
                        <div className="font-bold text-slate-700">
                          {cat === 'A' ? 'Allmänna' : cat === 'B' ? 'Ledarskap' : 'Kliniska'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 'GOAL' && (
                  <div className="space-y-2">
                    {goals.filter(g => g.category === selectedCategory).map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => { setSelectedGoalId(goal.id); setWizardStep('ACTIVITIES'); }}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            {goal.id.toUpperCase()}
                          </div>
                          <div className="font-bold text-slate-700">{goal.title}</div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 'ACTIVITIES' && selectedGoal && (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Valt mål</div>
                      <div className="font-bold text-emerald-900">{selectedGoal.id}: {selectedGoal.title}</div>
                    </div>
                    
                    <div className="grid gap-2">
                      {selectedGoal.activities.map(activity => {
                        const rotation = rotations.find(r => r.id === addingGoalToRotationId);
                        const isSelected = rotation?.activityIds.includes(activity.id);
                        
                        return (
                          <div key={activity.id} className="space-y-2">
                            <button
                              onClick={() => onToggleActivityInRotation(addingGoalToRotationId!, activity.id, selectedGoal.id)}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                                isSelected 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm' 
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                              }`}
                            >
                              <div className={isSelected ? 'text-emerald-500' : 'text-slate-300'}>
                                {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                              </div>
                              <span className="text-sm font-medium">{activity.text}</span>
                            </button>

                            {/* Sub-activities */}
                            {activity.subActivities && activity.subActivities.length > 0 && (
                              <div className="ml-8 space-y-2 border-l-2 border-slate-100 pl-4 pb-2">
                                {activity.subActivities.map(sub => {
                                  const isSubSelected = rotation?.activityIds.includes(sub.id);
                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => onToggleActivityInRotation(addingGoalToRotationId!, sub.id, selectedGoal.id, activity.id)}
                                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                        isSubSelected 
                                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' 
                                          : 'bg-white border-slate-50 text-slate-500 hover:border-slate-100'
                                      }`}
                                    >
                                      <div className={isSubSelected ? 'text-emerald-500' : 'text-slate-200'}>
                                        {isSubSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                      </div>
                                      <span className="text-xs font-medium">{sub.text}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add sub-activity form */}
                            <div className="ml-8 mt-2">
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const text = newSubActivityText[activity.id];
                                  if (text?.trim()) {
                                    onSubActivityAdd(selectedGoal.id, activity.id, text.trim());
                                    setNewSubActivityText(prev => ({ ...prev, [activity.id]: '' }));
                                  }
                                }}
                                className="flex gap-2"
                              >
                                <input 
                                  placeholder="Lägg till delmål..."
                                  value={newSubActivityText[activity.id] || ''}
                                  onChange={(e) => setNewSubActivityText(prev => ({ ...prev, [activity.id]: e.target.value }))}
                                  className="flex-1 text-[10px] bg-transparent border-b border-slate-100 focus:border-emerald-500 outline-none py-1"
                                />
                                <button type="submit" className="text-emerald-600 hover:text-emerald-700">
                                  <Plus size={12} />
                                </button>
                              </form>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between">
                {wizardStep !== 'CATEGORY' ? (
                  <button 
                    onClick={() => setWizardStep(wizardStep === 'ACTIVITIES' ? 'GOAL' : 'CATEGORY')}
                    className="px-6 py-2 text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors"
                  >
                    Tillbaka
                  </button>
                ) : <div></div>}
                <button 
                  onClick={resetWizard}
                  className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
                >
                  Klar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
