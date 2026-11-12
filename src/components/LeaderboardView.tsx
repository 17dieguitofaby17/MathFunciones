import React, { useState } from 'react';
import { LeaderboardEntry, StudentProfile } from '../types';
import { Award, Flame, Trophy, Star, Sparkles, User, Check, Edit2, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentProfile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  currentProfile,
  onUpdateProfile,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(currentProfile.name);
  const [editCourse, setEditCourse] = useState<string>(currentProfile.course);

  const filteredEntries = entries.filter((e) => {
    if (selectedCourse === 'all') return true;
    return e.course.includes(selectedCourse);
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    sound.playCorrect();
    onUpdateProfile({
      ...currentProfile,
      name: editName.trim(),
      course: editCourse,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/image_b65e9819.png"
            alt="Escudo"
            className="w-12 h-14 object-contain"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tabla de Clasificación: MATHFUNCIONES
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lema: <span className="font-motto text-[#0D47A1] dark:text-blue-400 font-bold text-sm">"Ternura que acompaña, Firmeza que transforma"</span> · 2do de Bachillerato
            </p>
          </div>
        </div>

        {/* Current User Quick Summary & Edit Button */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-[#0D47A1] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {currentProfile.name.charAt(0) || 'M'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentProfile.name}</span>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-slate-400 hover:text-[#0D47A1] transition-colors cursor-pointer"
                title="Editar mi nombre y paralelo"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {currentProfile.course} · {currentProfile.xp} XP · {currentProfile.stats.exclusiveCount || 0} Retos 2X
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Personalizar mi Perfil Marianita
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Nombre Completo / Apodo:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Curso / Paralelo:
                </label>
                <select
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value='2do BGU "A"'>2do BGU "A"</option>
                  <option value='2do BGU "B"'>2do BGU "B"</option>
                  <option value='2do BGU "C"'>2do BGU "C"</option>
                  <option value='2do "Técnico"'>2do "Técnico"</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0D47A1] text-white font-bold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Filter Tabs (Including 2do Técnico) */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'General (Todos los Cursos)' },
          { id: '2do BGU "A"', label: '2do BGU "A"' },
          { id: '2do BGU "B"', label: '2do BGU "B"' },
          { id: '2do BGU "C"', label: '2do BGU "C"' },
          { id: '2do "Técnico"', label: '2do "Técnico"' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setSelectedCourse(tab.id);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCourse === tab.id
                ? 'bg-[#0D47A1] text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 text-center w-14">Rango</th>
                <th className="py-3 px-4">Estudiante</th>
                <th className="py-3 px-4">Paralelo</th>
                <th className="py-3 px-4">Título Académico</th>
                <th className="py-3 px-4 text-center">Retos 15h & 18h</th>
                <th className="py-3 px-4 text-center">Racha</th>
                <th className="py-3 px-4 text-center">Insignias</th>
                <th className="py-3 px-4 text-right">Puntos XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredEntries.map((entry, index) => {
                const rank = index + 1;
                const isUser = entry.isCurrentUser;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank Position */}
                    <td className="py-3.5 px-4 text-center font-bold">
                      {rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black shadow-sm text-xs">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black shadow-sm text-xs">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white font-black shadow-sm text-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">{rank}</span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{entry.avatar}</span>
                        <div>
                          <div className={`font-semibold ${isUser ? 'text-[#0D47A1] dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                            {entry.name}
                          </div>
                          {isUser && (
                            <span className="text-[10px] text-blue-700 dark:text-blue-400 font-normal">
                              (Tu posición actual)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {entry.course}
                    </td>

                    {/* Academic Rank */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {entry.levelTitle}
                      </span>
                    </td>

                    {/* Exclusive Challenges 2X */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="inline-flex items-center gap-1 text-[#DC2626] font-bold">
                        <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {entry.exclusiveChallengesCount || 0}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {entry.streak}
                      </span>
                    </td>

                    {/* Badges count */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {entry.badgesCount}
                      </span>
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#0D47A1] dark:text-blue-400 tabular-nums">
                      {entry.xp} <span className="text-[10px] text-slate-500 font-normal">XP</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
