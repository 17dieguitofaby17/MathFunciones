import React, { useState } from 'react';
import { Question, FunctionCategory, MathTopic } from '../types';
import { FunctionPlotter } from './FunctionPlotter';
import { MathFormula } from './MathFormula';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  FileText, 
  Eye, 
  Filter, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audio';

interface QuestionBankManagerProps {
  questions: Question[];
  onAddQuestion: (newQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onImportQuestions: (imported: Question[]) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onImportQuestions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New question form state
  const [formData, setFormData] = useState({
    level: 1,
    topic: 'tipo' as MathTopic,
    title: '',
    functionFormula: 'f(x) = 2x + 1',
    functionType: 'Lineal' as FunctionCategory,
    domain: 'ℝ',
    range: 'ℝ',
    xIntercepts: '( -0.5, 0 )',
    yIntercept: '( 0, 1 )',
    prompt: '',
    opt1: '',
    opt2: '',
    opt3: '',
    opt4: '',
    correctIndex: 0,
    solutionFormula: '',
    solutionTip: '',
    evalCode: '2 * x + 1',
  });

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.functionFormula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || q.level.toString() === selectedLevel;
    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    return matchesSearch && matchesLevel && matchesTopic;
  });

  const handleExportJSON = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `banco_preguntas_marianita_funciones_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportQuestions(parsed);
          sound.playLevelUp();
          alert(`¡Se importaron exitosamente ${parsed.length} ejercicios al banco!`);
        } else {
          alert('El archivo no contiene un arreglo válido de preguntas.');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.prompt || !formData.opt1 || !formData.opt2) {
      alert('Por favor completa los campos principales de la pregunta.');
      return;
    }

    const options = [
      { id: 'opt_1', text: formData.opt1, isCorrect: formData.correctIndex === 0 },
      { id: 'opt_2', text: formData.opt2, isCorrect: formData.correctIndex === 1 },
      { id: 'opt_3', text: formData.opt3 || 'Opción alternativa', isCorrect: formData.correctIndex === 2 },
      { id: 'opt_4', text: formData.opt4 || 'Opción alternativa', isCorrect: formData.correctIndex === 3 },
    ];

    const newQ: Question = {
      id: 'custom_' + Date.now(),
      level: Number(formData.level),
      topic: formData.topic,
      title: formData.title,
      functionFormula: formData.functionFormula,
      functionType: formData.functionType,
      domain: formData.domain,
      range: formData.range,
      xIntercepts: formData.xIntercepts ? [formData.xIntercepts] : ['No tiene'],
      yIntercept: formData.yIntercept || '(0, 0)',
      prompt: formData.prompt,
      questionType: 'multiple-choice',
      difficulty: 'Medio',
      xpReward: 40,
      options,
      stepByStepSolution: {
        title: `Solución: ${formData.title}`,
        formulaBreakdown: formData.solutionFormula || `Análisis de ${formData.functionFormula}`,
        domainExplanation: `Dominio: ${formData.domain}.`,
        rangeExplanation: `Rango: ${formData.range}.`,
        interceptsExplanation: `Corte con Y: ${formData.yIntercept}. Cortes con X: ${formData.xIntercepts}.`,
        graphObservation: `Representación de ${formData.functionType}.`,
        pedagogicalTip: formData.solutionTip || 'Recuerda verificar analíticamente los puntos de corte igualando a cero.',
      },
      graphConfig: {
        xMin: -6,
        xMax: 6,
        yMin: -6,
        yMax: 6,
        evalFunctionCode: formData.evalCode || 'x',
      },
    };

    onAddQuestion(newQ);
    sound.playCorrect();
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Bank Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Banco Académico de Preguntas</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {questions.length} ejercicios registrados
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administra, visualiza, agrega nuevos reactivos o importa/exporta en formato JSON tu banco detallado para 2do BGU.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Question Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#881337] hover:bg-rose-900 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Ejercicio</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            title="Descargar banco completo en archivo JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar JSON</span>
          </button>

          {/* Import JSON Button */}
          <label className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, fórmula f(x), o enunciado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#881337]/30 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Todos los Niveles</option>
            <option value="1">Nivel 1 (Lineales/Afines)</option>
            <option value="2">Nivel 2 (Cuadráticas)</option>
            <option value="3">Nivel 3 (Racionales/Radicales)</option>
            <option value="4">Nivel 4 (Exponenciales/Log)</option>
            <option value="5">Nivel 5 (A trozos/Absoluto)</option>
            <option value="6">Nivel 6 (Desafíos Integradores)</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">Todos los Temas</option>
            <option value="tipo">Tipo de Función</option>
            <option value="dominio">Dominio</option>
            <option value="rango">Rango</option>
            <option value="cortes">Puntos de Corte</option>
            <option value="grafica">Gráficas</option>
            <option value="composicion">Composición (f ∘ g)</option>
            <option value="inversa">Función Inversa (f⁻¹)</option>
            <option value="integral">Integrador</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0D47A1] dark:text-blue-400">
                  Nivel {q.level} · {q.topic.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  {q.functionType}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-center">
                <div className="font-math font-bold text-base text-[#0D47A1] dark:text-blue-400">
                  <MathFormula formula={q.functionFormula} />
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                {q.prompt}
              </h4>

              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div>Dom: <strong className="font-math text-slate-700 dark:text-slate-300">{q.domain}</strong></div>
                <div>Ran: <strong className="font-math text-slate-700 dark:text-slate-300">{q.range}</strong></div>
                <div>Corte Y: <strong className="font-math text-slate-700 dark:text-slate-300">{q.yIntercept}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sound.playClick();
                  setPreviewQuestion(q);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Gráfica & Solución</span>
              </button>

              {q.id.startsWith('custom_') && (
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar este reactivo del banco personalizado?')) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                  title="Eliminar pregunta personalizada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
          No se encontraron preguntas que coincidan con la búsqueda.
        </div>
      )}

      {/* Modal: Preview Question with Math Graph */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#0D47A1] text-white">
                  Nivel {previewQuestion.level}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewQuestion.title}
                </span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-lg font-bold font-math text-[#0D47A1] dark:text-blue-400">
                <MathFormula formula={previewQuestion.functionFormula} />
              </div>
            </div>

            <FunctionPlotter
              config={previewQuestion.graphConfig}
              height={240}
              interactive={true}
              title={`Gráfica de ${previewQuestion.functionFormula}`}
            />

            <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div><strong>Dominio:</strong> {previewQuestion.domain}</div>
              <div><strong>Rango:</strong> {previewQuestion.range}</div>
              <div><strong>Corte con Y:</strong> {previewQuestion.yIntercept}</div>
              <div><strong>Cortes con X:</strong> {previewQuestion.xIntercepts.join(', ')}</div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <strong>Solución Pedagógica:</strong> {previewQuestion.stepByStepSolution.formulaBreakdown}
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Tip Marianita: {previewQuestion.stepByStepSolution.pedagogicalTip}
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Question */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Agregar Ejercicio al Banco de Funciones
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Nivel (1 al 6):</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={1}>Nivel 1: Lineales & Afines</option>
                    <option value={2}>Nivel 2: Cuadráticas & Parábolas</option>
                    <option value={3}>Nivel 3: Racionales & Radicales</option>
                    <option value={4}>Nivel 4: Exponenciales & Logarítmicas</option>
                    <option value={5}>Nivel 5: Especiales & A Trozos</option>
                    <option value={6}>Nivel 6: Desafío Integrador</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Tema Principal:</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value as MathTopic })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="tipo">Tipo de Función</option>
                    <option value="dominio">Dominio</option>
                    <option value="rango">Rango</option>
                    <option value="cortes">Puntos de Corte</option>
                    <option value="grafica">Gráfica</option>
                    <option value="integral">Desafío Integral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Título Breve:</label>
                <input
                  type="text"
                  placeholder="ej. Análisis de raíces y corte vertical"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Fórmula de la Función:</label>
                  <input
                    type="text"
                    placeholder="f(x) = 2x - 4"
                    value={formData.functionFormula}
                    onChange={(e) => setFormData({ ...formData, functionFormula: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-math font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Expresión JS para Gráfica:</label>
                  <input
                    type="text"
                    placeholder="2 * x - 4"
                    value={formData.evalCode}
                    onChange={(e) => setFormData({ ...formData, evalCode: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-math"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Dominio:</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-math"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Rango:</label>
                  <input
                    type="text"
                    value={formData.range}
                    onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-math"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Corte Y:</label>
                  <input
                    type="text"
                    value={formData.yIntercept}
                    onChange={(e) => setFormData({ ...formData, yIntercept: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-math"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Cortes X:</label>
                  <input
                    type="text"
                    value={formData.xIntercepts}
                    onChange={(e) => setFormData({ ...formData, xIntercepts: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-math"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Enunciado / Pregunta:</label>
                <textarea
                  rows={2}
                  placeholder="¿Cuáles son las coordenadas del corte con el eje Y y el dominio de f(x)?"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  required
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Opciones (Marca el botón redondo de la correcta):
                </label>
                {[1, 2, 3, 4].map((num, idx) => (
                  <div key={num} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctIndex === idx}
                      onChange={() => setFormData({ ...formData, correctIndex: idx })}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                      value={(formData as any)[`opt${num}`]}
                      onChange={(e) => setFormData({ ...formData, [`opt${num}`]: e.target.value })}
                      required={idx < 2}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Consejo / Tip Pedagógico:</label>
                <input
                  type="text"
                  placeholder="Recuerda evaluar f(0) para hallar el corte vertical con el eje Y."
                  value={formData.solutionTip}
                  onChange={(e) => setFormData({ ...formData, solutionTip: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#881337] hover:bg-rose-900 text-white font-bold cursor-pointer"
                >
                  Guardar en Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
