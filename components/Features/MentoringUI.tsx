import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, BookOpen } from 'lucide-react';
import { assignMentor, createMentoringTask } from '../../services/featuresService';
import { MentoringTask, User as UserType } from '../../types';

interface MentoringUIProps {
  userId: string;
  userName: string;
  allUsers: UserType[];
  mentoringTasks: MentoringTask[];
}

export function MentoringUI({ userId, userName, allUsers, mentoringTasks }: MentoringUIProps) {
  const [tasks, setTasks] = useState<MentoringTask[]>([]);
  const [selectedMentee, setSelectedMentee] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const myTasks = mentoringTasks.filter(t => t.mentorId === userId || t.menteeId === userId);
    setTasks(myTasks);
  }, [mentoringTasks, userId]);

  const handleCreateTask = async () => {
    if (!selectedMentee || !taskDescription || !dueDate) return;

    setLoading(true);
    try {
      // Stub implementation - adjust based on actual service signature
      // createMentoringTask(mentorId, menteeId, title, description, dueDate)
      await createMentoringTask(userId, selectedMentee, 'Mentoring Task', taskDescription, dueDate);
      console.log('Creating mentoring task:', { userId, selectedMentee, taskDescription, dueDate });
      setSelectedMentee('');
      setTaskDescription('');
      setDueDate('');
    } finally {
      setLoading(false);
    }
  };

  const myMenteeTasks = tasks.filter(t => t.mentorId === userId);
  const myMentorTasks = tasks.filter(t => t.menteeId === userId);

  const isOverdue = (date: any) => new Date(date) < new Date();
  const isCompleted = (task: MentoringTask) => task.completed;

  return (
    <div className="space-y-6">
      {/* Create Task */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">👥 Mentoring Aufgabe erstellen</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold mb-2">Für Mentee</label>
            <select
              value={selectedMentee}
              onChange={(e) => setSelectedMentee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="">-- Mentee wählen --</option>
              {allUsers.filter(u => u.id !== userId).map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Aufgabenbeschreibung</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="z.B. Dokumentation lesen und Quiz machen"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange h-20 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Fälligkeitsdatum</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <button
            onClick={handleCreateTask}
            disabled={!selectedMentee || !taskDescription || !dueDate || loading}
            className="w-full bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {loading ? 'Wird erstellt...' : 'Aufgabe erstellen'}
          </button>
        </div>
      </div>

      {/* My Mentee Tasks */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">📋 Meine Mentees ({myMenteeTasks.length})</h3>
        {myMenteeTasks.length === 0 ? (
          <p className="text-sm text-slate-500">Du hast noch keine Mentee-Aufgaben</p>
        ) : (
          <div className="space-y-3">
            {myMenteeTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border ${
                  isCompleted(task)
                    ? 'bg-green-50 border-green-200'
                    : isOverdue(task.dueDate)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-orange" />
                    <p className="font-bold">
                      {allUsers.find(u => u.id === task.menteeId)?.name || task.menteeId}
                    </p>
                  </div>
                  {isCompleted(task) && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-sm mb-2">{task.description}</p>
                <p className="text-xs text-slate-600">
                  Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Mentor Tasks */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">🎓 Meine Aufgaben ({myMentorTasks.length})</h3>
        {myMentorTasks.length === 0 ? (
          <p className="text-sm text-slate-500">Du hast keine ausstehenden Aufgaben</p>
        ) : (
          <div className="space-y-3">
            {myMentorTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border ${
                  isCompleted(task)
                    ? 'bg-green-50 border-green-200'
                    : isOverdue(task.dueDate)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-600" />
                    <p className="font-bold">
                      von {allUsers.find(u => u.id === task.mentorId)?.name || task.mentorId}
                    </p>
                  </div>
                  {isCompleted(task) ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isOverdue(task.dueDate) ? (
                    <Clock className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
                <p className="text-sm mb-2">{task.description}</p>
                <p className="text-xs text-slate-600">
                  Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
