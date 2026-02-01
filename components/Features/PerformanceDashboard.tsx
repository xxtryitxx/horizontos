import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { User } from '../../types';

interface PerformanceDashboardProps {
  allUsers: User[];
}

export function PerformanceDashboard({ allUsers }: PerformanceDashboardProps) {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalScore: 0,
    avgScore: 0,
    topScore: 0,
    activeToday: 0,
  });

  useEffect(() => {
    const sorted = [...allUsers]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    setTopUsers(sorted);

    const totalScore = allUsers.reduce((sum, u) => sum + u.score, 0);
    const avgScore = allUsers.length > 0 ? Math.floor(totalScore / allUsers.length) : 0;
    const topScore = Math.max(...allUsers.map(u => u.score));
    const activeToday = allUsers.filter(u => u.isOnline).length;

    setStats({ totalScore, avgScore, topScore, activeToday });

    // Score distribution
    const ranges = [
      { range: '0-50', count: 0 },
      { range: '51-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '200+', count: 0 },
    ];

    allUsers.forEach(u => {
      if (u.score <= 50) ranges[0].count++;
      else if (u.score <= 100) ranges[1].count++;
      else if (u.score <= 200) ranges[2].count++;
      else ranges[3].count++;
    });

    setScoreDistribution(ranges);
  }, [allUsers]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Gesamt Score" value={stats.totalScore} />
        <StatCard title="Ø Score" value={stats.avgScore} />
        <StatCard title="Top Score" value={stats.topScore} />
        <StatCard title="Aktiv Heute" value={stats.activeToday} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        {/* Top Users */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-brand-burgundy mb-4">🏆 Top Mitarbeiter</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#FF8C42" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-brand-burgundy mb-4">📊 Score Verteilung</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B4513" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">👥 Rangliste</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="pb-3 font-black text-xs uppercase">Platz</th>
                <th className="pb-3 font-black text-xs uppercase">Mitarbeiter</th>
                <th className="pb-3 font-black text-xs uppercase">Score</th>
                <th className="pb-3 font-black text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold">#{idx + 1}</td>
                  <td className="py-3 flex items-center gap-2">
                    <img src={user.avatar} className="w-6 h-6 rounded-full" />
                    {user.name}
                  </td>
                  <td className="py-3 font-bold text-brand-orange">{user.score}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-xs font-bold text-slate-400 uppercase mb-1">{title}</p>
      <p className="text-3xl font-black text-brand-burgundy">{value}</p>
    </div>
  );
}
