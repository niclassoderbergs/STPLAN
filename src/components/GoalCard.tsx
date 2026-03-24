import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, Calendar, Plus, Trash2, Edit2, Save, X, Hospital } from 'lucide-react';
import { Goal, GoalStatus, Activity, Rotation } from '../data/goals';

interface GoalCardProps {
  goal: Goal;
  onStatusChange: (goalId: string, status: GoalStatus) => void;
  onActivityToggle: (goalId: string, activityId: string) => void;
  onActivityAdd: (goalId: string, text: string) => void;
  onActivityDelete: (goalId: string, activityId: string) => void;
  onSubActivityToggle: (goalId: string, activityId: string, subActivityId: string) => void;
  onSubActivityAdd: (goalId: string, activityId: string, text: string) => void;
  onSubActivityDelete: (goalId: string, activityId: string, subActivityId: string) => void;
  isAdmin?: boolean;
  onGoalUpdate?: (goal: Goal) => void;
  rotations?: Rotation[];
}

export default function GoalCard({ 
  goal, 
  onStatusChange, 
  onActivityToggle, 
  onActivityAdd, 
  onActivityDelete,
  onSubActivityToggle,
  onSubActivityAdd,
  onSubActivityDelete,
  isAdmin,
  onGoalUpdate,
  rotations = []
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newActivityText, setNewActivityText] = useState('');
  const [newSubActivityText, setNewSubActivityText] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState<Goal>(goal);

  const getRotationForItem = (itemId: string) => {
    return rotations.find(r => r.activityIds.includes(itemId));
  };

  const handleAddActivity = (e: FormEvent) => {
    e.preventDefault();
    if (newActivityText.trim()) {
      onActivityAdd(goal.id, newActivityText.trim());
      setNewActivityText('');
    }
  };

  const handleSave = () => {
    if (onGoalUpdate) {
      onGoalUpdate(editedGoal);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedGoal(goal);
    setIsEditing(false);
  };

  const updateActivityText = (id: string, text: string) => {
    setEditedGoal(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, text } : a)
    }));
  };

  const statusColors = {
    planerad: 'bg-gray-100 text-gray-600 border-gray-200',
    pågående: 'bg-amber-100 text-amber-700 border-amber-200',
    utförd: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const completedActivities = goal.activities.filter(a => a.completed).length;
  const totalActivities = goal.activities.length;

  return (
    <div 
      className={`border rounded-xl overflow-hidden transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
        goal.status === 'utförd' ? 'border-emerald-200' : 'border-gray-200'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
            goal.status === 'utförd' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {goal.id.toUpperCase()}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input 
                value={editedGoal.title}
                onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
                className="w-full font-semibold text-gray-900 border-b border-emerald-500 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${statusColors[goal.status]}`}>
                {goal.status}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle2 size={12} className={completedActivities === totalActivities ? 'text-emerald-500' : 'text-gray-400'} />
                {completedActivities}/{totalActivities} aktiviteter
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center gap-1 mr-2">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Spara">
                    <Save size={18} />
                  </button>
                  <button onClick={handleCancel} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Avbryt">
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Redigera">
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          )}
          <button className="text-gray-400 hover:text-gray-600 p-1" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Beskrivning</h4>
                    {isEditing ? (
                      <textarea 
                        value={editedGoal.description}
                        onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                        className="w-full text-sm text-gray-600 leading-relaxed border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed">{goal.description}</p>
                    )}
                  </section>
                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Regional Tolkning</h4>
                    {isEditing ? (
                      <textarea 
                        value={editedGoal.interpretation}
                        onChange={(e) => setEditedGoal({ ...editedGoal, interpretation: e.target.value })}
                        className="w-full text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500 outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200">
                        {goal.interpretation}
                      </p>
                    )}
                  </section>
                  <section>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hur uppnås målet</h4>
                    {isEditing ? (
                      <textarea 
                        value={editedGoal.howToAchieve}
                        onChange={(e) => setEditedGoal({ ...editedGoal, howToAchieve: e.target.value })}
                        className="w-full text-sm text-gray-600 border rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{goal.howToAchieve}</p>
                    )}
                  </section>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Aktiviteter & Färdigheter</h4>
                  <div className="space-y-2">
                    {goal.activities.map((activity) => (
                      <div 
                        key={activity.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group ${
                          activity.completed 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="flex-1 flex items-start gap-3 cursor-pointer"
                          onClick={() => !isEditing && onActivityToggle(goal.id, activity.id)}
                        >
                          <div className="mt-0.5">
                            {activity.completed ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <Circle size={18} className="text-gray-300" />
                            )}
                          </div>
                          {isEditing ? (
                            <input 
                              value={editedGoal.activities.find(a => a.id === activity.id)?.text || ''}
                              onChange={(e) => updateActivityText(activity.id, e.target.value)}
                              className="flex-1 text-sm font-medium bg-transparent border-b border-emerald-200 focus:outline-none"
                            />
                          ) : (
                            <div className="flex-1 flex flex-col">
                              <span className="text-sm font-medium">{activity.text}</span>
                              {activity.completed && getRotationForItem(activity.id) && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                                  <Hospital size={10} /> {getRotationForItem(activity.id)?.clinic}
                                </span>
                              )}
                              
                              {/* Sub-activities */}
                              {activity.subActivities && activity.subActivities.length > 0 && (
                                <div className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
                                  {activity.subActivities.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-2 group/sub">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); onSubActivityToggle(goal.id, activity.id, sub.id); }}
                                        className={`flex items-center gap-2 text-xs transition-colors ${sub.completed ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}
                                      >
                                        {sub.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        <span>{sub.text}</span>
                                      </button>
                                      {getRotationForItem(sub.id) && (
                                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                                          <Hospital size={8} /> {getRotationForItem(sub.id)?.clinic}
                                        </span>
                                      )}
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); onSubActivityDelete(goal.id, activity.id, sub.id); }}
                                        className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add sub-activity form */}
                              {!isEditing && (
                                <div className="mt-2">
                                  <form 
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const text = newSubActivityText[activity.id];
                                      if (text?.trim()) {
                                        onSubActivityAdd(goal.id, activity.id, text.trim());
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
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <button type="submit" className="text-emerald-600 hover:text-emerald-700">
                                      <Plus size={12} />
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {activity.isCustom && !isEditing && (
                          <button 
                            onClick={() => onActivityDelete(goal.id, activity.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                            title="Ta bort aktivitet"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isEditing && (
                    <form onSubmit={handleAddActivity} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Lägg till egen aktivitet..."
                        value={newActivityText}
                        onChange={(e) => setNewActivityText(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!newActivityText.trim()}
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </form>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ändra Status</h4>
                    <div className="flex gap-2">
                      {(['planerad', 'pågående', 'utförd'] as GoalStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => onStatusChange(goal.id, s)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            goal.status === s
                              ? s === 'utförd' ? 'bg-emerald-500 text-white shadow-sm' :
                                s === 'pågående' ? 'bg-amber-500 text-white shadow-sm' :
                                'bg-gray-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
