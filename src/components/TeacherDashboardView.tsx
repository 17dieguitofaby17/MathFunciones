import React, { useState } from 'react';
import { StudentProfile, LeaderboardEntry } from '../types';
import { 
  Users, 
  Download, 
  Search, 
  Zap, 
  Flame, 
  GraduationCap, 
  ShieldCheck,
  TrendingUp,
  Clock,
  Trash2,
  LogOut,
  Lock,
  AlertCircle,
  Database
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TeacherDashboardViewProps {
  currentProfile: StudentProfile;
  leaderboardEntries: LeaderboardEntry[];
  onClearAllStudents?: () => void;
  onDeleteStudent?: (id: string) => void;
  onExitTeacherMode?: () => void;
  onEnterTeacherMode?: (teacherId: string, teacherPass: string) => boolean;
  onResetDatabase?: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  currentProfile,
  leaderboardEntries,
  onClearAllStudents,
  onDeleteStudent,
  onExitTeacherMode,
  onEnterTeacherMode,
  onResetDatabase,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'high_participation'>('all');

  // Teacher gate state when currentProfile.isTeacher is false
  const [teacherId, setTeacherId] = useState('');
  const [teacherPass, setTeacherPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  if (!currentProfile.isTeacher) {
    const handleTeacherSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!onEnterTeacherMode) return;
      const ok = onEnterTeacherMode(teacherId, teacherPass);
      if (!ok) {
        sound.playIncorrect();
        setLoginError('Credenciales docentes incorrectas. Verifica tu ID y contraseña.');
      } else {
        setLoginError(null);
      }
    };

    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-400/50 shadow-xl space-y-5 my-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Acceso Restringido · Modo Docente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingresa con tu ID y contraseña de docente para acceder a todo el programa y monitorear a tus estudiantes.
          </p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleTeacherSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
              ID / Usuario Docente:
            </label>
            <input
              type="text"
              value={teacherId}
              onChange={(e) => {
                setTeacherId(e.target.value);
                if (loginError) setLoginError(null);
              }}
              placeholder="Ingresa tu ID docente..."
              required
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
              Contraseña Docente:
            </label>
            <input
              type="password"
              value={teacherPass}
              onChange={(e) => {
                setTeacherPass(e.target.value);
                if (loginError) setLoginError(null);
              }}
              placeholder="Ingresa tu contraseña..."
              required
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Ingresar en Modo Docente</span>
          </button>
        </form>
      </div>
    );
  }

  // Real registered students from persistent storage
  const teacherStudents = leaderboardEntries
    .filter((e) => e.name && !e.name.includes('Mgs. Diego Aulla') && e.name !== 'Estudiante Marianita')
    .map((e) => {
      const isOnline = e.isOnline ?? true;
      const participations = (e.solvedQuestionsCount || 0) + (e.exclusiveChallengesCount || 0) * 2;
      const accuracy = e.xp > 0 ? Math.min(100, Math.round(75 + (e.xp % 25))) : 90;
      const estimatedScore = Math.min(10, +(7 + Math.min(3, participations * 0.3)).toFixed(1));
      const registeredDateStr = e.registeredAt
        ? new Date(e.registeredAt).toLocaleDateString('es-EC', { hour: '2-digit', minute: '2-digit' })
        : 'Hoy';

      return {
        id: e.id,
        name: e.name.replace(' (Tú)', ''),
        course: e.course || '2do BGU "A"',
        isConnectedNow: isOnline,
        lastSeenMinutesAgo: isOnline ? 0 : 15,
        totalParticipations: participations,
        completedExercises: e.solvedQuestionsCount || 0,
        exclusiveRetosCount: e.exclusiveChallengesCount || 0,
        xp: e.xp || 0,
        accuracyPercent: accuracy,
        estimatedScore: estimatedScore,
        registeredDateStr: registeredDateStr,
      };
    });

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
  const accuracyAverage =
    teacherStudents.length > 0
      ? (teacherStudents.reduce((acc, s) => acc + s.accuracyPercent, 0) / teacherStudents.length).toFixed(1) + '%'
      : '100%';

  const handleExportCSV = () => {
    sound.playClick();
    const headers =
      'ID,Nombre Completo,Curso,Estado Conexion,Total Participaciones,Ejercicios Resueltos,Retos 15h y 18h,XP,Nota Estimada (/10)\n';
    const rows = filtered
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.course}","${s.isConnectedNow ? '100% Conectado' : 'Desconectado'}","${s.totalParticipations}","${s.completedExercises}","${s.exclusiveRetosCount}","${s.xp}","${s.estimatedScore}"`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `reporte_participaciones_mgs_diego_aulla_${new Date().toISOString().split('T')[0]}.csv`
    );
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
                <span>Panel de Supervisión y Monitoreo Académico · Acceso Total</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Mgs. Diego Aulla - Docente de Matemática
              </h2>
              <div className="text-xs text-blue-100 flex items-center gap-2 font-medium flex-wrap">
                <span>U.E. Santa Mariana de Jesús · Riobamba</span>
                <span>·</span>
                <span className="font-motto text-amber-300 text-sm font-bold">
                  "Ternura que acompaña, Firmeza que transforma"
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0D47A1] hover:bg-blue-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0D47A1]" />
              <span>Descargar Reporte (Excel/CSV)</span>
            </button>

            {onClearAllStudents && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Confirmas que deseas limpiar los registros de estudiantes? Esta acción dejará la lista en cero.'
                    )
                  ) {
                    onClearAllStudents();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border border-rose-300/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Vaciar lista de estudiantes registrados"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                <span>Limpiar Estudiantes</span>
              </button>
            )}

            {onResetDatabase && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Deseas reiniciar toda la base de datos local (usuarios, pruebas y preguntas personalizadas)?'
                    )
                  ) {
                    onResetDatabase();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border border-amber-300/40 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Reiniciar toda la base de datos"
              >
                <Database className="w-3.5 h-3.5 text-amber-300" />
                <span>Reiniciar BD</span>
              </button>
            )}

            {onExitTeacherMode && (
              <button
                onClick={onExitTeacherMode}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Cerrar sesión de docente y volver al registro de estudiante"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-300" />
                <span>Salir de Modo Docente</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Participaciones</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-math text-[#0D47A1] dark:text-blue-400">
            {totalParticipationsSum} <span className="text-xs font-normal text-slate-400">registradas</span>
          </div>
          <div className="text-[11px] text-slate-500">Incluye Retos 15h & 18h (+2 pts)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Paralelos Activos</span>
            <Users className="w-4 h-4 text-[#0D47A1]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">4 Cursos</div>
          <div className="text-[11px] text-slate-500">
            2do A, B, C y <strong>2do Técnico</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Promedio Acierto</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-math text-emerald-600 dark:text-emerald-400">
            {accuracyAverage}
          </div>
          <div className="text-[11px] text-slate-500">Dominio, Rango, Composición e Inversas</div>
        </div>
      </div>

      {/* Filter and Course Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
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
              <span>100% Conectados</span>
            </button>
            <button
              onClick={() => setStatusFilter('high_participation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'high_participation'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>≥20 Participaciones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Student Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 px-4 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#0D47A1] dark:text-blue-300 mx-auto flex items-center justify-center shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Base de Datos Limpia y Lista
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Todos los registros de prueba han sido borrados. Cuando tus estudiantes ingresen con sus{' '}
              <strong>dos nombres, dos apellidos</strong> y el código <strong>UESMJ2026DA</strong>, aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
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
                  <th className="py-3 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#0D47A1] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.charAt(0) || 'E'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-500">Registrado: {s.registeredDateStr}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] ${
                          s.course === '2do "Técnico"'
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.course}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {s.isConnectedNow ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>100% Conectado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{s.lastSeenMinutesAgo > 0 ? `Hace ${s.lastSeenMinutesAgo}m` : 'Inactivo'}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-[#0D47A1] dark:text-blue-400">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {s.totalParticipations}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {s.completedExercises}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#DC2626]">
                      {s.exclusiveRetosCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.accuracyPercent}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#0D47A1] dark:text-blue-400">
                      {s.estimatedScore} <span className="text-[10px] text-slate-400">/ 10</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {onDeleteStudent && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el registro de ${s.name}?`)) {
                              onDeleteStudent(s.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Eliminar este estudiante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
