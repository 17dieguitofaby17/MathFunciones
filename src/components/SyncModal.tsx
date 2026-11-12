import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { DEFAULT_PROFILE } from '../utils/storage';
import { 
  X, 
  Cloud, 
  CloudOff, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Laptop
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  profile: StudentProfile;
  onRestoreProfile: (profile: StudentProfile) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  profile,
  onRestoreProfile,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    sound.playClick();
    const backupData = {
      profile,
      exportedAt: new Date().toISOString(),
      institution: 'U.E. SANTA MARIANA DE JESUS - RIOBAMBA',
      version: '2.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `respaldo_marianita_math_${profile.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) {
          onRestoreProfile(parsed.profile);
          sound.playLevelUp();
          alert('¡Respaldo restaurado con éxito!');
          onClose();
        } else {
          alert('Archivo de respaldo no reconocido.');
        }
      } catch {
        alert('Error al leer el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('¿Deseas reiniciar tu progreso? Esto restablecerá tu nivel a 1 y reiniciará tus estadísticas.')) {
      onRestoreProfile(DEFAULT_PROFILE);
      sound.playClick();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image_b65e9819.png"
              alt="Escudo"
              className="w-7 h-7 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sincronización & Modo Offline
              </h3>
              <div className="font-motto text-amber-600 dark:text-amber-400 text-xs font-semibold">
                "Ternura que acompaña, Firmeza que transforma"
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connection Status Card */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isOnline
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
            : 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
        }`}>
          {isOnline ? (
            <Cloud className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <CloudOff className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div className="text-xs">
            <div className="font-bold">
              {isOnline ? 'Conexión a Internet Activa' : 'Modo Offline Activado'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {isOnline
                ? 'Tus datos se guardan en tu dispositivo y se sincronizan automáticamente.'
                : 'Puedes seguir resolviendo todos los ejercicios y usando el graficador sin internet.'}
            </div>
          </div>
        </div>

        {/* Compatibility Info */}
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#881337]" />
            <span>Almacenamiento Local Seguro</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Esta aplicación está optimizada tanto para teléfonos móviles como computadoras de escritorio. Todo tu avance en <strong>2do de Bachillerato</strong> se preserva de manera permanente en este navegador.
          </p>
        </div>

        {/* Backup Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#881337]" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <label className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-[#1E3A8A]" />
            <span>Restaurar Copia en otro Dispositivo</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Option */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <button
            onClick={handleReset}
            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Progreso</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
