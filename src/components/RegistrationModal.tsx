import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { sound } from '../utils/audio';
import { ShieldCheck, UserCheck, AlertCircle, KeyRound, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  isOpen: boolean;
  onRegister: (name: string, course: string, accessCode: string) => void;
  currentProfile?: StudentProfile;
}

const REQUIRED_ACCESS_CODE = 'UESMJ2026DA';

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onRegister,
  currentProfile,
}) => {
  const [fullName, setFullName] = useState(currentProfile?.name && currentProfile.name !== 'Estudiante Marianita' ? currentProfile.name : '');
  const [course, setCourse] = useState(currentProfile?.course || '2do BGU "A"');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = fullName.trim();
    const parts = clean.split(/\s+/).filter(Boolean);

    // Rule 1: Must be at least 2 names and 2 surnames (4 words)
    if (parts.length < 4) {
      sound.playIncorrect();
      setErrorMsg('Registro obligatorio: Debes ingresar tus dos nombres y tus dos apellidos completos (mínimo 4 palabras). Ejemplo: Carlos Fernando Paredes Morales.');
      return;
    }

    // Check each word has at least 2 characters
    const hasShortWords = parts.some((p) => p.length < 2);
    if (hasShortWords) {
      sound.playIncorrect();
      setErrorMsg('Cada nombre y apellido debe tener al menos 2 letras.');
      return;
    }

    // Rule 2: Access code verification exclusively provided by teacher
    const cleanCode = accessCode.trim().toUpperCase();
    if (cleanCode !== REQUIRED_ACCESS_CODE) {
      sound.playIncorrect();
      setErrorMsg('Código de acceso incorrecto. Solicita el código exclusivo de registro a tu docente Mgs. Diego Aulla para ingresar.');
      return;
    }

    setErrorMsg(null);
    sound.playLevelUp();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0D47A1', '#DC2626', '#F59E0B']
    });

    onRegister(clean, course, cleanCode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-blue-900/30 shadow-2xl space-y-6 animate-scaleUp">
        {/* Header with Official Shield */}
        <div className="text-center space-y-2">
          <img
            src="/MathFunciones/assets/aistudio/image_b65e9819.png"
            alt="Escudo Oficial Santa Mariana de Jesús"
            className="w-16 h-18 object-contain mx-auto drop-shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs font-bold text-[#0D47A1] dark:text-blue-400 uppercase tracking-wider">
              Unidad Educativa Santa Mariana de Jesús · Riobamba
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              Registro Obligatorio de Estudiante
            </h2>
            <div className="font-motto text-amber-600 dark:text-amber-400 text-sm sm:text-base font-bold">
              "Ternura que acompaña, Firmeza que transforma"
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
            Para acceder a las actividades de MATHFUNCIONES debes registrarte
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={validateAndSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
              Nombres y Apellidos Completos (Dos nombres y dos apellidos):
            </label>
            <input
              type="text"
              placeholder="Ejemplo: Carlos Fernando Paredes Morales"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0D47A1] text-xs sm:text-sm"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              * El sistema verificará que contenga tus dos nombres y dos apellidos completos.
            </span>
          </div>

          <div>
            <label className="font-bold block mb-1.5 text-slate-800 dark:text-slate-200">
              Grado / Paralelo Institucional:
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm cursor-pointer"
            >
              <option value='2do BGU "A"'>2do BGU "A"</option>
              <option value='2do BGU "B"'>2do BGU "B"</option>
              <option value='2do BGU "C"'>2do BGU "C"</option>
              <option value='2do "Técnico"'>2do "Técnico"</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Código de Acceso Docente:</span>
              </label>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-900 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Exclusivo Mgs. Diego Aulla
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Ingresa el código proporcionado por el docente..."
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                required
                className="w-full p-3 pl-10 rounded-xl border-2 border-amber-400/60 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white font-mono font-black tracking-widest uppercase text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1] focus:border-[#0D47A1] placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
              />
              <KeyRound className="w-4 h-4 text-amber-500 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              * Código de acceso exclusivo que el docente te indicará en clase para autorizar tu registro.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-slate-600 dark:text-slate-300 text-[11px] space-y-1">
            <div className="font-bold text-[#0D47A1] dark:text-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supervisión Académica Docente</span>
            </div>
            <p>
              Tus participaciones y ejercicios resueltos serán monitoreados por el <strong>Mgs. Diego Aulla - Docente de Matemática</strong> para tu nota de participación en clase.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-[#0D47A1] hover:bg-blue-900 text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-300" />
            <span>Confirmar Registro e Ingresar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
