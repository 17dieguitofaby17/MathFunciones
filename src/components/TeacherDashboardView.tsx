import React, { useState } from 'react';
import { StudentProfile, LeaderboardEntry } from '../types';
import { 
  Users, 
  Activity, 
  Download, 
  Search, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Award, 
  Filter, 
  GraduationCap, 
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TeacherDashboardViewProps {
  currentProfile: StudentProfile;
  leaderboardEntries: LeaderboardEntry[];
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentProfile,
  leaderboardEntries,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'high_participation'>('all');

  // Realistic mock student roster with full 2 names & 2 surnames for 2do BGU A, B, C and 2do Técnico
  const teacherStudents = [
    {
      id: currentProfile.id,
      name: currentProfile.name,
      course: currentProfile.course,
      isConnectedNow: true,
      currentAction: 'Resolviendo ejercicios en tiempo real',
      lastSeenMinutesAgo: 0,
      totalParticipations: (currentProfile.stats.totalCorrect || 0) + (currentProfile.stats.exclusiveCount || 0) * 2 + 5,
      completedExercises: currentProfile.stats.totalCorrect || 0,
      exclusiveRetosCount: currentProfile.stats.exclusiveCount || 0,
      xp: currentProfile.xp,
      accuracyPercent: currentProfile.stats.totalAnswered > 0 
        ? Math.round((currentProfile.stats.totalCorrect / currentProfile.stats.totalAnswered) * 100)
        : 90,
      estimatedScore: 9.5,
      isCurrentUser: true,
    },
    {
      id: 'st_1',
      name: 'María Belén Chimborazo Guamán',
      course: '2do "Técnico"',
      isConnectedNow: true,
      currentAction: 'Practicando Composición (f ∘ g)',
      lastSeenMinutesAgo: 1,
      totalParticipations: 28,
      completedExercises: 22,
      exclusiveRetosCount: 6,
      xp: 1650,
      accuracyPercent: 95,
      estimatedScore: 9.8,
    },
    {
      id: 'st_2',
      name: 'Doménica Sofía Morales Alcocer',
      course: '2do BGU "A"',
      isConnectedNow: true,
      currentAction: 'Resolviendo Reto 15h00 (2X)',
      lastSeenMinutesAgo: 2,
      totalParticipations: 26,
      completedExercises: 20,
      exclusiveRetosCount: 6,
      xp: 1540,
      accuracyPercent: 92,
      estimatedScore: 9.6,
    },
    {
      id: 'st_3',
      name: 'Mateo Sebastián Freire Vinueza',
      course: '2do "Técnico"',
      isConnectedNow: true,
      currentAction: 'Analizando Función Inversa y Simetría',
      lastSeenMinutesAgo: 3,
      totalParticipations: 22,
      completedExercises: 18,
      exclusiveRetosCount: 4,
      xp: 1320,
      accuracyPercent: 88,
      estimatedScore: 9.2,
    },
    {
      id: 'st_4',
      name: 'Camila Estefanía Guamán Paredes',
      course: '2do BGU "B"',
      isConnectedNow: false,
      currentAction: 'Desconectada (hace 15m)',
      lastSeenMinutesAgo: 15,
      totalParticipations: 19,
      completedExercises: 15,
      exclusiveRetosCount: 4,
      xp: 1120,
      accuracyPercent: 86,
      estimatedScore: 8.9,
    },
    {
      id: 'st_5',
      name: 'Nicolás Alejandro Vinueza Silva',
      course: '2do BGU "C"',
      isConnectedNow: false,
      currentAction: 'Desconectada (hace 40m)',
      lastSeenMinutesAgo: 40,
      totalParticipations: 16,
      completedExercises: 12,
      exclusiveRetosCount: 4,
      xp: 940,
      accuracyPercent: 82,
      estimatedScore: 8.5,
    },
    {
      id: 'st_6',
      name: 'Valeria Nicole Alcocer Morales',
      course: '2do "Técnico"',
      isConnectedNow: true,
      currentAction: 'Explorando Gráficas en Laboratorio',
      lastSeenMinutesAgo: 4,
      totalParticipations: 24,
      completedExercises: 19,
      exclusiveRetosCount: 5,
      xp: 1410,
      accuracyPercent: 90,
      estimatedScore: 9.4,
    },
    {
      id: 'st_7',
      name: 'Kevin Gabriel Silva Chimborazo',
      course: '2do BGU "A"',
      isConnectedNow: false,
      currentAction: 'Desconectado (hace 2 horas)',
      lastSeenMinutesAgo: 120,
      totalParticipations: 11,
      completedExercises: 9,
      exclusiveRetosCount: 2,
      xp: 680,
      accuracyPercent: 78,
      estimatedScore: 8.0,
    },
    {
      id: 'st_8',
      name: 'Dayana Carolina Paredes Freire',
      course: '2do "Técnico"',
      isConnectedNow: true,
      currentAction: 'Evaluación en Simulador',
      lastSeenMinutesAgo: 1,
      totalParticipations: 25,
      completedExercises: 21,
      exclusiveRetosCount: 4,
      xp: 1480,
      accuracyPercent: 91,
      estimatedScore: 9.5,
    }
  ];

  // Filtering
  const filtered = teacherStudents
    .filter((s) => {
      const matchCourse = selectedCourse === 'all' || s.course === selectedCourse;
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'connected'
          ? s.isConnectedNow
          : s.totalParticipations >= 20;
      return matchCourse && matchSearch && matchStatus;
    })
    .sort((a, b) => b.totalParticipations - a.totalParticipations);

  const connectedNowCount = teacherStudents.filter((s) => s.isConnectedNow).length;
  const totalParticipationsSum = teacherStudents.reduce((acc, s) => acc + s.totalParticipations, 0);

  const handleExportCSV = () => {
    sound.playClick();
    const headers = 'ID,Nombre Completo,Curso,Estado Conexion,Total Participaciones,Ejercicios Resueltos,Retos 15h y 18h,XP,Nota Estimada (/10)\n';
    const rows = filtered.map((s) => 
      `"${s.id}","${s.name}","${s.course}","${s.isConnectedNow ? '100% Conectado' : 'Desconectado'}","${s.totalParticipations}","${s.completedExercises}","${s.exclusiveRetosCount}","${s.xp}","${s.estimatedScore}"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `reporte_participaciones_mgs_diego_aulla_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Teacher Header Card */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#B91C1C] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <img
              src="/MathFunciones/assets/aistudio/image_b65e9819.png"
              alt="Escudo"
              className="w-14 h-16 object-contain drop-shadow-md shrink-0 bg-white/10 p-1 rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel de Supervisión y Monitoreo Académico</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Mgs. Diego Aulla - Docente de Matemática
              </h2>
              <div className="text-xs text-blue-100 flex items-center gap-2 font-medium">
                <span>U.E. Santa Mariana de Jesús · Riobamba</span>
                <span>·</span>
                <span className="font-motto text-amber-300 text-sm font-bold">
                  "Ternura que acompaña, Firmeza que transforma"
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-white text-[#0D47A1] hover:bg-blue-50 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0D47A1]" />
            <span>Descargar Reporte (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Connected Now 100% */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Conectados Ahora</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-math text-emerald-600 dark:text-emerald-400">
            {connectedNowCount} <span className="text-xs font-normal text-slate-400">alumnas/os</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            100% Activos realizando ejercicios
          </div>
        </div>

        {/* Total Participations */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Participaciones</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-math text-[#0D47A1] dark:text-blue-400">
            {totalParticipationsSum} <span className="text-xs font-normal text-slate-400">registradas</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Incluye Retos 15h & 18h (+2 pts)
          </div>
        </div>

        {/* Cursos Monitoreados */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Paralelos Activos</span>
            <Users className="w-4 h-4 text-[#0D47A1]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            4 Cursos
          </div>
          <div className="text-[11px] text-slate-500">
            2do A, B, C y <strong>2do Técnico</strong>
          </div>
        </div>

        {/* Promedio General */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Promedio Acierto</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-math text-emerald-600 dark:text-emerald-400">
            89.4%
          </div>
          <div className="text-[11px] text-slate-500">
            Dominio, Rango, Composición e Inversas
          </div>
        </div>
      </div>

      {/* Filter and Course Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Course Tabs (Including 2do Técnico) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todos los Cursos' },
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
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Quick Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar estudiante por sus dos nombres o dos apellidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#0D47A1] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('connected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'connected' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>100% Conectados Ahora</span>
            </button>
            <button
              onClick={() => setStatusFilter('high_participation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'high_participation' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Más Participaciones (≥20)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Student Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Estudiante (2 Nombres y 2 Apellidos)</th>
                <th className="py-3 px-4">Curso / Paralelo</th>
                <th className="py-3 px-4">Estado en Vivo</th>
                <th className="py-3 px-4 text-center">Participaciones</th>
                <th className="py-3 px-4 text-center">Ejercicios</th>
                <th className="py-3 px-4 text-center">Retos 15h & 18h</th>
                <th className="py-3 px-4 text-center">Precisión</th>
                <th className="py-3 px-4 text-right">Nota Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    s.isCurrentUser
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0D47A1] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {s.name.charAt(0) || 'E'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.currentAction}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                      s.course === '2do "Técnico"'
                        ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {s.course}
                    </span>
                  </td>

                  {/* Live Status */}
                  <td className="py-3.5 px-4">
                    {s.isConnectedNow ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>100% Conectado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 text-[10px]">
                        <Clock className="w-3 h-3" />
                        <span>Hace {s.lastSeenMinutesAgo}m</span>
                      </span>
                    )}
                  </td>

                  {/* Participations (High Value!) */}
                  <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-[#0D47A1] dark:text-blue-400">
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {s.totalParticipations}
                    </span>
                  </td>

                  {/* Exercises count */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {s.completedExercises}
                  </td>

                  {/* Exclusive Challenges */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#DC2626]">
                    {s.exclusiveRetosCount}
                  </td>

                  {/* Accuracy */}
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {s.accuracyPercent}%
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#0D47A1] dark:text-blue-400">
                    {s.estimatedScore} <span className="text-[10px] text-slate-400">/ 10</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
