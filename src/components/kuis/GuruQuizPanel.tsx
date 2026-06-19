import React from "react";
import { 
  Users, 
  Play, 
  Plus, 
  Trash2, 
  Award, 
  Check, 
  ListOrdered,
  PlusCircle,
  Copy,
  HelpCircle
} from "lucide-react";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  teacher_id?: string;
  created_at?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit: number;
  explanation: string;
  order_index: number;
}

export interface Room {
  id: string;
  quiz_id: string;
  room_code: string;
  status: "LOBBY" | "PLAYING" | "FINISHED";
}

export interface Participant {
  id: string;
  room_id: string;
  username: string;
  score: number;
  current_question_index: number;
}

interface GuruQuizPanelProps {
  quizzes: Quiz[];
  questions: Question[];
  loading: boolean;
  showCreateQuiz: boolean;
  setShowCreateQuiz: (show: boolean) => void;
  newQuizTitle: string;
  setNewQuizTitle: (title: string) => void;
  newQuizDesc: string;
  setNewQuizDesc: (desc: string) => void;
  activeQuizForQuestions: Quiz | null;
  setActiveQuizForQuestions: (quiz: Quiz | null) => void;
  showAddQuestion: boolean;
  setShowAddQuestion: (show: boolean) => void;
  newQText: string;
  setNewQText: (text: string) => void;
  newQOpts: string[];
  setNewQOpts: (opts: string[]) => void;
  newQCorrect: number;
  setNewQCorrect: (correct: number) => void;
  newQTimer: number;
  setNewQTimer: (timer: number) => void;
  newQExpl: string;
  setNewQExpl: (expl: string) => void;
  myRoom: Room | null;
  copied: boolean;
  participants: Participant[];
  activeRoomQuestions: Question[];
  handleCreateQuiz: (e: React.FormEvent) => void;
  handleDeleteQuiz: (id: string) => void;
  handleAddQuestion: (e: React.FormEvent) => void;
  handleDeleteQuestion: (id: string) => void;
  handleOpenRoom: (quizId: string) => void;
  handleStartQuiz: () => void;
  handleEndQuiz: () => void;
  handleCopyCode: () => void;
}

export const GuruQuizPanel: React.FC<GuruQuizPanelProps> = ({
  quizzes,
  questions,
  loading,
  showCreateQuiz,
  setShowCreateQuiz,
  newQuizTitle,
  setNewQuizTitle,
  newQuizDesc,
  setNewQuizDesc,
  activeQuizForQuestions,
  setActiveQuizForQuestions,
  showAddQuestion,
  setShowAddQuestion,
  newQText,
  setNewQText,
  newQOpts,
  setNewQOpts,
  newQCorrect,
  setNewQCorrect,
  newQTimer,
  setNewQTimer,
  newQExpl,
  setNewQExpl,
  myRoom,
  copied,
  participants,
  activeRoomQuestions,
  handleCreateQuiz,
  handleDeleteQuiz,
  handleAddQuestion,
  handleDeleteQuestion,
  handleOpenRoom,
  handleStartQuiz,
  handleEndQuiz,
  handleCopyCode
}) => {
  return (
    <>
      {/* CASE A: USER GURU VIEW (DASHBOARD & MANAGEMENT) */}
      {!myRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Left Column: Quiz Lists & Create */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl p-5 space-y-4 shadow-theme-xs">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5">
                  <ListOrdered className="size-4.5 text-brand-500" />
                  Daftar Kuis Kelas
                </h4>
                <button
                  onClick={() => setShowCreateQuiz(!showCreateQuiz)}
                  className="p-1 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-md transition cursor-pointer"
                >
                  <PlusCircle className="size-5" />
                </button>
              </div>

              {/* Create Quiz Form toggle */}
              {showCreateQuiz && (
                <form onSubmit={handleCreateQuiz} className="space-y-3 bg-gray-55 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 animate-fadeIn">
                  <input
                    type="text"
                    required
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    placeholder="Judul Kuis (misal: Kuis Aset)"
                    className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newQuizDesc}
                    onChange={(e) => setNewQuizDesc(e.target.value)}
                    placeholder="Deskripsi singkat..."
                    className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuiz(false)}
                      className="px-2.5 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-150 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-brand-500 text-white rounded hover:bg-brand-600 font-semibold cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              {/* Quiz list rendering */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  /* Skeleton List Loading */
                  <div className="space-y-2 animate-pulse">
                    {[1, 2].map(i => (
                      <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-gray-900/40 space-y-2">
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                    ))}
                  </div>
                ) : quizzes.map(q => (
                  <div 
                    key={q.id}
                    className={`p-3 rounded-lg border transition-all text-left flex items-start justify-between gap-2 cursor-pointer ${
                      activeQuizForQuestions?.id === q.id 
                        ? "border-brand-500 bg-brand-50/20 dark:bg-brand-500/5 dark:border-brand-500" 
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                    onClick={() => setActiveQuizForQuestions(q)}
                  >
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-gray-800 dark:text-white">{q.title}</h5>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{q.description}</p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuiz(q.id);
                      }}
                      className="p-1 hover:bg-red-50 text-red-500 rounded dark:hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle & Right Column: Questions Builder & Opening Room */}
          <div className="lg:col-span-2 space-y-4">
            {activeQuizForQuestions ? (
              <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl p-5 space-y-4 shadow-theme-xs">
                {/* Active Quiz Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 border-gray-100 dark:border-gray-800 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded uppercase">Kuis Terpilih</span>
                    <h3 className="font-bold text-base text-gray-800 dark:text-white mt-1">{activeQuizForQuestions.title}</h3>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowAddQuestion(!showAddQuestion)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold shadow transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Tambah Soal
                    </button>
                    <button
                      onClick={() => handleOpenRoom(activeQuizForQuestions.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition cursor-pointer"
                    >
                      <Play className="size-3.5" />
                      Buka Room Kelas
                    </button>
                  </div>
                </div>

                {/* Add Question Form with Live Preview Layout */}
                {showAddQuestion && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 bg-gray-55 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 animate-fadeIn">
                    <form onSubmit={handleAddQuestion} className="xl:col-span-2 space-y-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Butir Pertanyaan</label>
                        <textarea
                          required
                          value={newQText}
                          onChange={(e) => setNewQText(e.target.value)}
                          placeholder="Masukkan pertanyaan kuis..."
                          rows={2.5}
                          className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white focus:border-brand-500"
                        />
                      </div>

                      {/* Option arrays */}
                      <div className="grid grid-cols-1 gap-2.5">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase -mb-1">
                          Pilihan Jawaban & Tentukan Kunci Jawaban
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {newQOpts.map((opt, oIdx) => {
                            const isCorrect = newQCorrect === oIdx;
                            const labelChar = String.fromCharCode(65 + oIdx);
                            return (
                              <div key={oIdx} className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    oIdx === 0 ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" :
                                    oIdx === 1 ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" :
                                    oIdx === 2 ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" :
                                    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  }`}>
                                    Opsi {labelChar}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setNewQCorrect(oIdx)}
                                    className={`ml-auto flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                                      isCorrect 
                                        ? "bg-emerald-600 text-white" 
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
                                    }`}
                                  >
                                    {isCorrect ? (
                                      <>
                                        <Check className="size-3 stroke-[3px]" /> Kunci Benar
                                      </>
                                    ) : (
                                      "Set Kunci"
                                    )}
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => {
                                    const newArr = [...newQOpts];
                                    newArr[oIdx] = e.target.value;
                                    setNewQOpts(newArr);
                                  }}
                                  placeholder={`Ketik pilihan jawaban ${labelChar}`}
                                  className={`w-full px-2.5 py-1.5 border rounded text-xs text-gray-800 dark:text-white bg-white dark:bg-gray-800 transition ${
                                    isCorrect 
                                      ? "border-emerald-500 ring-1 ring-emerald-500/30" 
                                      : "border-gray-200 dark:border-gray-700 focus:border-brand-500"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Timer settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Durasi Timer Soal</label>
                          <select
                            value={newQTimer}
                            onChange={(e) => setNewQTimer(Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                          >
                            <option value={10}>10 Detik (Sangat Cepat)</option>
                            <option value={20}>20 Detik (Cepat)</option>
                            <option value={30}>30 Detik (Standar)</option>
                            <option value={45}>45 Detik (Sedang)</option>
                            <option value={60}>60 Detik (1 Menit)</option>
                            <option value={90}>90 Detik (1.5 Menit)</option>
                            <option value={120}>120 Detik (2 Menit - Analitis)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Pembahasan Pembelajaran (Edukasi)</label>
                        <textarea
                          value={newQExpl}
                          onChange={(e) => setNewQExpl(e.target.value)}
                          placeholder="Ketik penjelasan jawaban yang benar..."
                          rows={2.5}
                          className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white focus:border-brand-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 text-[10px] pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddQuestion(false)}
                          className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-100 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-brand-500 text-white rounded hover:bg-brand-600 font-semibold shadow cursor-pointer"
                        >
                          Simpan Pertanyaan
                        </button>
                      </div>
                    </form>

                    {/* Live Preview Column */}
                    <div className="flex flex-col space-y-3">
                      <label className="block text-[10px] text-gray-400 font-bold uppercase">
                        Pratinjau Soal (Layar Siswa)
                      </label>
                      
                      <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-950 flex flex-col justify-between h-full min-h-[260px] shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              🔴 Live Student Preview
                            </span>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                              Soal {questions.filter(q => q.quiz_id === activeQuizForQuestions.id).length + 1}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white leading-relaxed line-clamp-4">
                            {newQText || "Ketik pertanyaan Anda di panel sebelah kiri untuk melihat pratinjau..."}
                          </h4>

                          {/* Options Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                            {newQOpts.map((opt, oIdx) => {
                              const isCorrect = (newQCorrect === oIdx);
                              const geom = oIdx === 0 ? "▲" : oIdx === 1 ? "◆" : oIdx === 2 ? "●" : "■";
                              const theme = oIdx === 0
                                ? "border-red-200 bg-red-50/20 text-red-800 dark:border-red-900/40 dark:bg-red-950/5 dark:text-red-400"
                                : oIdx === 1
                                ? "border-blue-200 bg-blue-50/20 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/5 dark:text-blue-400"
                                : oIdx === 2
                                ? "border-amber-200 bg-amber-50/20 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/5 dark:text-amber-400"
                                : "border-emerald-200 bg-emerald-50/20 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/5 dark:text-emerald-400";
                              
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg border text-left flex items-start gap-1.5 font-medium transition-all ${theme} ${
                                    isCorrect ? "ring-2 ring-emerald-500 shadow-sm" : ""
                                  }`}
                                >
                                  <span className="opacity-70 font-semibold">{geom}</span>
                                  <span className="truncate">{opt || `Pilihan ${String.fromCharCode(65 + oIdx)}...`}</span>
                                  {isCorrect && <Check className="size-3 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-gray-400 pt-2 border-t border-gray-150 dark:border-gray-800 mt-3 font-mono">
                          <span className="flex items-center gap-1 font-bold">⏱️ Batas Waktu: {newQTimer}s</span>
                          {newQExpl && (
                            <span className="truncate max-w-[120px] text-slate-400 italic" title={newQExpl}>
                              💡 Pembahasan terisi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* List questions of active quiz */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-gray-500 dark:text-gray-400">
                    Butir Soal Kuis ({questions.filter(q => q.quiz_id === activeQuizForQuestions.id).length}):
                  </h4>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {questions.filter(q => q.quiz_id === activeQuizForQuestions.id).map((q, idx) => (
                      <div key={q.id} className="p-3 bg-gray-55 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-lg text-xs space-y-2 flex justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-bold text-gray-800 dark:text-white flex items-start gap-1">
                            <span>{idx + 1}.</span> 
                            <span>{q.question_text}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-4 text-gray-500 mt-1">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx}
                                className={oIdx === q.correct_option_index ? "text-success-600 dark:text-success-400 font-semibold" : ""}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </div>
                            ))}
                          </div>
                          
                          {q.explanation && (
                            <p className="text-[10px] text-slate-400 pl-4 italic">💡 Pembahasan: {q.explanation}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded h-fit self-center dark:hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl p-12 text-center shadow-theme-xs">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 dark:text-white">Pilih Kuis Terlebih Dahulu</h3>
                <p className="text-gray-400 text-xs mt-1">Klik salah satu kuis kelas di daftar sebelah kiri untuk mengelola soal.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* CASE B: ROOM LOBBY (TEACHER VIEW) */}
      {myRoom && (
        <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-800 gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Room Kuis Aktif</span>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white mt-1">
                Lobby: {quizzes.find(q => q.id === myRoom.quiz_id)?.title}
              </h3>
            </div>
            
            {myRoom.status === "LOBBY" ? (
              <button
                onClick={handleStartQuiz}
                disabled={participants.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-md transition cursor-pointer"
              >
                <Play className="size-4" />
                Mulai Jalannya Kuis
              </button>
            ) : myRoom.status === "PLAYING" ? (
              <button
                onClick={handleEndQuiz}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-md transition cursor-pointer"
              >
                Akhiri Kuis
              </button>
            ) : (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">KUIS FINISHED</span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Room Code Banner & Info */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 text-center rounded-xl p-6 flex flex-col justify-center space-y-4">
              <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">KODE GAME SISWA</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl md:text-5xl font-mono font-bold text-brand-400 tracking-wider">
                  {myRoom.room_code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0 border-none"
                  title="Salin Kode Room"
                >
                  {copied ? <Check className="size-5 text-emerald-400" /> : <Copy className="size-5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed px-4">
                Siswa dapat bergabung dengan masuk ke menu Kuis lalu mengetik kode 6-digit di atas.
              </p>
            </div>

            {/* Participants Grid / Live Score Monitor */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800 text-xs">
                <span className="font-bold text-gray-750 dark:text-gray-200 flex items-center gap-1">
                  <Users className="size-4 text-brand-500" />
                  Siswa Tergabung ({participants.length})
                </span>
                <span className="text-gray-450 dark:text-gray-500">Real-time status</span>
              </div>

              {participants.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <span className="text-xs text-gray-450 dark:text-gray-500 block animate-pulse">Menunggu siswa memasukkan kode...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {participants.map(p => (
                    <div 
                      key={p.id}
                      className="p-3 border border-gray-200 dark:border-gray-805 rounded-lg flex items-center justify-between bg-gray-55 dark:bg-gray-900/40 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-800 dark:text-white block">{p.username}</span>
                        <span className="text-[10px] text-gray-450 dark:text-gray-500">Soal: {p.current_question_index}/{activeRoomQuestions.length}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-600 dark:text-brand-400 block font-mono">{p.score} pt</span>
                        {p.current_question_index === activeRoomQuestions.length && (
                          <span className="text-[9px] text-success-600 dark:text-success-400 font-bold">Done ✅</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show final leaderboard podium if finished */}
              {myRoom.status === "FINISHED" && participants.length > 0 && (
                <div className="bg-brand-50/30 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900 p-5 rounded-xl space-y-4 text-center mt-4">
                  <h4 className="font-bold text-brand-800 dark:text-brand-400 text-sm flex items-center justify-center gap-1">
                    <Award className="size-4.5" /> Live Podium ClickAsset
                  </h4>
                  <div className="flex justify-center items-end gap-3 pt-6 pb-2">
                    {/* 2nd Place */}
                    {participants[1] && (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{participants[1].username}</span>
                        <span className="text-[10px] font-mono text-gray-500 mb-1">{participants[1].score} pt</span>
                        <div className="w-16 h-16 bg-gray-300 border-2 border-gray-400 rounded-t-lg flex items-center justify-center text-gray-800 font-bold text-sm">
                          2nd
                        </div>
                      </div>
                    )}
                    {/* 1st Place */}
                    {participants[0] && (
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">👑 {participants[0].username}</span>
                        <span className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400 mb-1.5">{participants[0].score} pt</span>
                        <div className="w-20 h-24 bg-yellow-400 border-2 border-yellow-500 rounded-t-lg flex items-center justify-center text-yellow-900 font-bold text-lg shadow-lg">
                          1st
                        </div>
                      </div>
                    )}
                    {/* 3rd Place */}
                    {participants[2] && (
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{participants[2].username}</span>
                        <span className="text-[10px] font-mono text-gray-500 mb-1">{participants[2].score} pt</span>
                        <div className="w-16 h-12 bg-amber-600 border-2 border-amber-700 rounded-t-lg flex items-center justify-center text-amber-100 font-bold text-xs">
                          3rd
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
