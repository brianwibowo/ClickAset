import React from "react";
import { 
  Users, 
  Award, 
  Clock, 
  Check, 
  X, 
  ListOrdered,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { DUMMY_QUIZZES } from "../../data/dummyQuizzes";

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

interface StudentQuizPanelProps {
  user: any;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  recentActivities: any[];
  countdown: number | null;
  participants: Participant[];
  quizState: {
    status: "LOBBY" | "PLAYING" | "FINISHED";
    currentIndex: number;
    score: number;
    selectedOption: number | null;
    answered: boolean;
    timeLeft: number;
    showExplanation: boolean;
    earnedPoints: number;
  };
  correctAnswersCount: number;
  studentAnswers: { [questionId: string]: number | null };
  activeRoomQuestions: Question[];
  myRoom: Room | null;
  handleJoinRoom: (e: React.FormEvent) => void;
  handleStartDummyQuiz: (quizId: string) => void;
  handleSubmitAnswer: (selectedIdx: number, correctIdx: number, timeLimit: number) => void;
  handleNextQuestion: () => void;
  renderQuizIcon: (name: string) => React.ReactNode;
}

const CORRECT_MEMES = [
  { 
    url: "https://i.imgflip.com/9ehk.jpg", 
    topText: "JAWABAN BENAR!", 
    bottomText: "JURNAL LANGSUNG BALANCE ⚖️" 
  },
  { 
    url: "https://i.imgflip.com/26am.jpg", 
    topText: "MUCH SAK", 
    bottomText: "VERY DEPRECIATION 🐕" 
  },
  { 
    url: "https://i.imgflip.com/30b1gx.jpg", 
    topText: "GAYA BIASA: HITUNG MANUAL", 
    bottomText: "GAYA ELIT: PAKAI CLICKASET 😎" 
  }
];

const INCORRECT_MEMES = [
  { 
    url: "https://i.imgflip.com/23ls.jpg", 
    topText: "KETIKA JURNALMU GA BALANCE", 
    bottomText: "TAPI KAMU TINGGAL PULANG 🥲" 
  },
  { 
    url: "https://i.imgflip.com/2fm6x.jpg", 
    topText: "APAKAH INI", 
    bottomText: "BEBAN ATAU ASET TETAP? 🤔" 
  },
  { 
    url: "https://i.imgflip.com/1g8my4.jpg", 
    topText: "BINGUNG GOLONGAN PAJAK", 
    bottomText: "KELOMPOK 1 ATAU 2 😰" 
  }
];

export const StudentQuizPanel: React.FC<StudentQuizPanelProps> = ({
  user,
  roomCodeInput,
  setRoomCodeInput,
  recentActivities,
  countdown,
  participants,
  quizState,
  correctAnswersCount,
  studentAnswers,
  activeRoomQuestions,
  myRoom,
  handleJoinRoom,
  handleStartDummyQuiz,
  handleSubmitAnswer,
  handleNextQuestion,
  renderQuizIcon
}) => {
  return (
    <>
      {/* CASE C: STUDENTS LOBBY JOIN / GUEST SETUP */}
      {!myRoom && (
        <div className="space-y-8 animate-fadeIn">
          {/* A. JOIN FORM or LOCKED BLOCK */}
          {!user ? (
            <div className="max-w-md mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl p-6 shadow-theme-md space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Akses Kuis Terkunci 🔒</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Silakan masuk atau daftar akun ClickAsset terlebih dahulu untuk bergabung ke room kuis kelas atau mencoba latihan kuis mandiri.
                </p>
              </div>
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("show-auth-modal", {
                      detail: { message: "Silakan login atau daftar terlebih dahulu untuk mengakses fitur Kuis Interaktif." }
                    })
                  );
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow transition cursor-pointer"
              >
                Masuk / Daftar Akun
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl p-6 shadow-theme-md space-y-6">
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bergabung ke Kuis</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Masukkan kode room yang dibagikan oleh Guru untuk memulai kuis kelas.</p>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="bg-gray-55 dark:bg-gray-900/40 p-3 rounded-lg text-xs text-gray-650 dark:text-gray-300 border border-gray-150 dark:border-gray-800">
                  Bermain sebagai siswa terdaftar: <strong>{user.username}</strong> ({user.full_name})
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                    Kode Room Kuis
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="6-digit kode room (contoh: 382901)"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-center font-mono font-bold tracking-widest text-brand-600 dark:text-brand-400 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={roomCodeInput.length < 6}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow transition cursor-pointer"
                >
                  Masuk ke Room Kuis
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </div>
          )}

          {/* B. RECENT ACTIVITY SECTION (If logged in & has history) */}
          {user && recentActivities.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                Recent Activity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentActivities.map((act) => {
                  const quizObj = DUMMY_QUIZZES.find(q => q.id === act.quizId);
                  const iconName = quizObj?.iconName || "Coins";
                  return (
                    <div key={act.id} className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl overflow-hidden shadow-theme-xs flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-500 transition duration-350 select-none">
                      {/* Grid Header */}
                      <div className="relative h-32 bg-purple-50 dark:bg-purple-900/10 border-b border-purple-100/50 dark:border-purple-900/20 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{
                          backgroundImage: 'linear-gradient(to right, #8B5CF6 1px, transparent 1px), linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)',
                          backgroundSize: '16px 16px'
                        }} />
                        <div className="relative z-10 w-14 h-14 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-xs border border-purple-100/30 dark:border-purple-900/30">
                          {renderQuizIcon(iconName)}
                        </div>
                        {/* Qs Badge */}
                        <span className="absolute bottom-2.5 left-3 z-25 bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold shadow-xs border border-gray-150 dark:border-gray-800">
                          {act.totalQuestions} Qs
                        </span>
                        
                        <svg className="absolute bottom-0 left-0 right-0 w-full h-4 text-white dark:text-gray-955 fill-current" viewBox="0 0 1440 80" preserveAspectRatio="none">
                          <path d="M0 40 Q 720 80 1440 40 L 1440 80 L 0 80 Z" />
                        </svg>
                      </div>

                      {/* Card Content */}
                      <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 min-h-10 mb-3">
                          {act.title}
                        </h4>
                        
                        {/* Accuracy badge pill */}
                        <div className="w-fit bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800 text-amber-500 font-bold px-3 py-1 rounded-full text-[10px]">
                          {act.accuracy}% accuracy
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. KUIS AKUNTANSI SECTION */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading flex items-center gap-1.5">
              <span>⭐️</span> Kuis Akuntansi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {DUMMY_QUIZZES.map((quiz) => (
                <div 
                  key={quiz.id} 
                  onClick={() => handleStartDummyQuiz(quiz.id)}
                  className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl overflow-hidden shadow-theme-xs flex flex-col justify-between hover:border-brand-350 dark:hover:border-brand-500 transition duration-350 cursor-pointer group"
                >
                  {/* Grid Header */}
                  <div className="relative h-32 bg-purple-50 dark:bg-purple-900/10 border-b border-purple-100/50 dark:border-purple-900/20 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{
                      backgroundImage: 'linear-gradient(to right, #8B5CF6 1px, transparent 1px), linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }} />
                    <div className="relative z-10 w-14 h-14 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-xs border border-purple-100/30 dark:border-purple-900/30 group-hover:scale-110 transition duration-300">
                      {renderQuizIcon(quiz.iconName)}
                    </div>
                    {/* Qs Badge */}
                    <span className="absolute bottom-2.5 left-3 z-25 bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold shadow-xs border border-gray-150 dark:border-gray-800">
                      {quiz.questions.length} Qs
                    </span>
                    {/* Plays Badge */}
                    <span className="absolute bottom-2.5 right-3 z-25 bg-purple-100/90 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold shadow-xs border border-purple-200/30">
                      {quiz.playsCount}
                    </span>
                    
                    <svg className="absolute bottom-0 left-0 right-0 w-full h-4 text-white dark:text-gray-955 fill-current" viewBox="0 0 1440 80" preserveAspectRatio="none">
                      <path d="M0 40 Q 720 80 1440 40 L 1440 80 L 0 80 Z" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 min-h-10 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition">
                        {quiz.title}
                      </h4>
                      <p className="text-[11px] text-gray-450 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASE D.5: STUDENTS COUNTDOWN SCREEN */}
      {myRoom && countdown !== null && (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 text-center rounded-2xl p-12 space-y-6 shadow-theme-md text-white flex flex-col items-center justify-center min-h-[300px] animate-fadeIn">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">KUIS AKAN DIMULAI DALAM</span>
          <div className="text-8xl font-black text-brand-400 animate-ping">
            {countdown === 0 ? "GO!" : countdown}
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Bersiaplah menjawab dengan cepat untuk mendapatkan bonus skor!
          </p>
        </div>
      )}

      {/* CASE D: STUDENTS WAITING LOBBY */}
      {myRoom && quizState.status === "LOBBY" && countdown === null && (
        <div className="max-w-md mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl p-8 text-center space-y-6 shadow-theme-md animate-fadeIn">
          {/* Waiting animated loader */}
          <div className="inline-flex items-center justify-center p-4 bg-brand-50 dark:bg-brand-500/10 rounded-full text-brand-500 animate-pulse mb-2">
            <Users className="size-10" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Berhasil Bergabung!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kode Room: <strong>{myRoom.room_code}</strong>. Menunggu Guru memulai jalannya kuis...
            </p>
          </div>

          <div className="bg-gray-55 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-150 dark:border-gray-800 text-left text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Peserta Terhubung:</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {participants.map(p => (
                <span 
                  key={p.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-0.5 font-semibold text-[10px] text-gray-650 dark:text-gray-400"
                >
                  {p.username}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CASE E: STUDENTS PLAYING QUESTION RUNNER */}
      {myRoom && quizState.status === "PLAYING" && countdown === null && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl p-6 shadow-theme-md space-y-6 animate-fadeIn">
          
          {/* Question Index & Score header */}
          <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800 text-xs">
            <span className="font-bold text-gray-500 uppercase">
              Soal {quizState.currentIndex + 1} dari {activeRoomQuestions.length}
            </span>
            <span className="font-bold text-brand-600 dark:text-brand-400 font-mono text-sm">
              Skor: {quizState.score} pt
            </span>
          </div>

          {activeRoomQuestions[quizState.currentIndex] ? (
            <div className="space-y-6">
              {/* Question text */}
              <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white leading-relaxed">
                {activeRoomQuestions[quizState.currentIndex].question_text}
              </h3>

              {/* Timer Countdown Visual Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> Batas Waktu</span>
                  <span className="font-bold font-mono">{quizState.timeLeft}s</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      quizState.timeLeft <= 5 ? "bg-red-500" : quizState.timeLeft <= 10 ? "bg-warning-500" : "bg-brand-500"
                    }`}
                    style={{ width: `${(quizState.timeLeft / activeRoomQuestions[quizState.currentIndex].time_limit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Multiple Choice Options Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeRoomQuestions[quizState.currentIndex].options.map((opt, oIdx) => {
                  const isCorrect = (oIdx === activeRoomQuestions[quizState.currentIndex].correct_option_index);
                  const isSelected = (quizState.selectedOption === oIdx);
                  const showAnswer = quizState.answered;

                  let btnClass = "";
                  
                  if (!showAnswer) {
                    if (oIdx === 0) {
                      btnClass = "border-red-200 dark:border-red-900/50 bg-red-50/20 text-red-900 dark:text-red-300 hover:border-red-400 hover:bg-red-50/40 hover:shadow-red-500/10 hover:shadow-md dark:bg-red-950/10 dark:hover:bg-red-950/20";
                    } else if (oIdx === 1) {
                      btnClass = "border-blue-200 dark:border-blue-900/50 bg-blue-50/20 text-blue-900 dark:text-blue-300 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-blue-500/10 hover:shadow-md dark:bg-blue-950/10 dark:hover:bg-blue-950/20";
                    } else if (oIdx === 2) {
                      btnClass = "border-amber-200 dark:border-amber-900/50 bg-amber-50/20 text-amber-900 dark:text-amber-300 hover:border-amber-400 hover:bg-amber-50/40 hover:shadow-amber-500/10 hover:shadow-md dark:bg-amber-950/10 dark:hover:bg-amber-950/20";
                    } else {
                      btnClass = "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 text-emerald-900 dark:text-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-emerald-500/10 hover:shadow-md dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20";
                    }
                  } else {
                    if (isCorrect) {
                      btnClass = "border-success-500 bg-success-50/50 text-success-800 dark:bg-success-950/20 dark:text-success-400 font-bold ring-2 ring-success-500/40 shadow-lg scale-[1.02]";
                    } else if (isSelected) {
                      btnClass = "border-red-500 bg-red-50/50 text-red-800 dark:bg-red-950/20 dark:text-red-400 ring-2 ring-red-500/30 shadow-md";
                    } else {
                      btnClass = "border-gray-100 dark:border-gray-900 opacity-40 bg-gray-50/5 text-gray-400";
                    }
                  }

                  const geometricSymbol = oIdx === 0 ? "▲" : oIdx === 1 ? "◆" : oIdx === 2 ? "●" : "■";
                  const badgeColor = oIdx === 0
                    ? "bg-red-500 text-white"
                    : oIdx === 1
                    ? "bg-blue-500 text-white"
                    : oIdx === 2
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500 text-white";

                  return (
                    <button
                      key={oIdx}
                      disabled={quizState.answered}
                      onClick={() => handleSubmitAnswer(oIdx, activeRoomQuestions[quizState.currentIndex].correct_option_index, activeRoomQuestions[quizState.currentIndex].time_limit)}
                      className={`text-left p-4 rounded-xl border transition-all text-xs md:text-sm flex items-center gap-3 cursor-pointer hover:scale-[1.015] duration-200 ${btnClass}`}
                    >
                      <span className={`font-bold rounded-lg size-6 flex items-center justify-center font-heading text-xs shrink-0 shadow-sm ${badgeColor}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="font-bold opacity-60 text-xs md:text-sm select-none">{geometricSymbol}</span>
                      <span className="flex-1 font-semibold">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Show immediate Feedback details and Explanation panel */}
              {quizState.showExplanation && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                    quizState.selectedOption === activeRoomQuestions[quizState.currentIndex].correct_option_index
                      ? "bg-success-50 border-success-100 text-success-800 dark:bg-success-950/20 dark:border-success-900 dark:text-success-400"
                      : "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400"
                  }`}>
                    {quizState.selectedOption === activeRoomQuestions[quizState.currentIndex].correct_option_index ? (
                      <Check className="size-5 shrink-0 mt-0.5 text-success-500 stroke-[3px]" />
                    ) : (
                      <X className="size-5 shrink-0 mt-0.5 text-red-500 stroke-[3px]" />
                    )}
                    <div>
                      <span className="font-bold">
                        {quizState.selectedOption === activeRoomQuestions[quizState.currentIndex].correct_option_index 
                          ? `JAWABAN BENAR! (+${quizState.earnedPoints} Poin)` 
                          : "JAWABAN KURANG TEPAT"}
                      </span>
                      <p className="mt-1 opacity-95">
                        {activeRoomQuestions[quizState.currentIndex].explanation || "Sebutkan alasan penyesuaian penyusutan."}
                      </p>
                    </div>
                  </div>

                  {/* Funny Quizizz Meme Section */}
                  {(() => {
                    const isCorrect = quizState.selectedOption === activeRoomQuestions[quizState.currentIndex].correct_option_index;
                    const memeList = isCorrect ? CORRECT_MEMES : INCORRECT_MEMES;
                    const meme = memeList[quizState.currentIndex % memeList.length];
                    return (
                      <div className="flex flex-col items-center justify-center p-4 bg-gray-55 dark:bg-gray-900/40 rounded-xl border border-gray-150 dark:border-gray-800 animate-zoomIn space-y-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isCorrect ? "bg-success-50 text-success-700 dark:bg-success-950/40 dark:text-success-400" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {isCorrect ? "Meme Sukses ✨" : "Meme Semangat 💡"}
                        </span>
                        
                        {/* Real Meme Card with Overlaid Impact Text */}
                        <div className="relative w-56 h-56 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 shadow-md select-none shrink-0">
                          <img 
                            src={meme.url} 
                            alt="Meme Kuis" 
                            className="w-full h-full object-cover" 
                          />
                          {/* Top Text */}
                          <div 
                            className="absolute top-2.5 left-0 right-0 text-center px-1.5 text-white font-extrabold uppercase tracking-wide text-xs leading-tight"
                            style={{
                              fontFamily: "Impact, 'Arial Black', sans-serif",
                              textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 1.5px 0 #000, 1.5px 0 0 #000, 0 -1.5px 0 #000, -1.5px 0 0 #000"
                            }}
                          >
                            {meme.topText}
                          </div>
                          {/* Bottom Text */}
                          <div 
                            className="absolute bottom-2.5 left-0 right-0 text-center px-1.5 text-white font-extrabold uppercase tracking-wide text-[11px] leading-tight"
                            style={{
                              fontFamily: "Impact, 'Arial Black', sans-serif",
                              textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 1.5px 0 #000, 1.5px 0 0 #000, 0 -1.5px 0 #000, -1.5px 0 0 #000"
                            }}
                          >
                            {meme.bottomText}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Next Question Control button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                    >
                      Lanjut ke Soal Berikutnya
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-xs text-gray-500 animate-pulse">Menyiapkan butir soal...</span>
            </div>
          )}
        </div>
      )}

      {/* CASE F: STUDENTS FINISHED GAME (WAITING / FINAL SCORE) */}
      {myRoom && quizState.status === "FINISHED" && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-2xl p-6 shadow-theme-md space-y-6 text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center p-3.5 bg-brand-50 dark:bg-brand-500/10 rounded-full text-brand-500 mb-2">
            <Award className="size-9 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Kuis Selesai!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kerja bagus! Anda telah menyelesaikan seluruh soal kuis yang diberikan.
            </p>
          </div>

          {/* Performance Feedback Banner */}
          {(() => {
            const totalQ = activeRoomQuestions.length || 1;
            const accuracy = Math.round((correctAnswersCount / totalQ) * 100);
            
            let feedbackText = "📚 Tetap Semangat! Baca kembali modul Penyesuaian Aset Tetap.";
            let feedbackClass = "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-405";
            
            if (accuracy >= 80) {
              feedbackText = "🏆 Hebat! Pemahaman SAK & Pajak Anda sangat kuat.";
              feedbackClass = "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400";
            } else if (accuracy >= 50) {
              feedbackText = "✨ Bagus! Pelajari materi lagi untuk meraih skor sempurna.";
              feedbackClass = "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400";
            }
            
            return (
              <div className={`p-3.5 rounded-xl border text-xs font-semibold ${feedbackClass}`}>
                {feedbackText}
              </div>
            );
          })()}

          {/* Final stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-50/40 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Skor Akhir Anda</span>
              <span className="text-2xl font-mono font-bold text-brand-600 dark:text-brand-400">
                {quizState.score} pt
              </span>
            </div>
            
            <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Akurasi Jawaban</span>
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {correctAnswersCount} / {activeRoomQuestions.length} ({Math.round((correctAnswersCount / (activeRoomQuestions.length || 1)) * 100)}%)
              </span>
            </div>
          </div>

          {/* List final leaderboard rankings */}
          <div className="space-y-2.5 text-left bg-gray-50/50 dark:bg-slate-900/20 p-4 border border-gray-150 dark:border-gray-850 rounded-xl">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block border-b pb-1">Leaderboard Room:</span>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
              {participants.map((p, idx) => (
                <div 
                  key={p.id}
                  className={`flex items-center justify-between p-2 border rounded-lg text-xs ${
                    p.username === user?.username
                      ? "border-brand-300 bg-brand-50/20 dark:bg-brand-500/5 dark:border-brand-500 font-bold"
                      : "border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-950"
                  }`}
                >
                  <span className="text-gray-850 dark:text-gray-300">
                    {idx + 1}. {p.username} {p.username === user?.username && " (Anda)"}
                  </span>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">{p.score} pt</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Board */}
          <div className="space-y-3 text-left pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-1.5">
              <ListOrdered className="size-4.5 text-brand-500" />
              Tinjauan Pertanyaan & Pembahasan
            </h4>
            <p className="text-[11px] text-gray-450">
              Pelajari kembali soal-soal di bawah ini untuk memperdalam pemahaman SAK dan Pajak Anda.
            </p>

            <div className="space-y-4 mt-3">
              {activeRoomQuestions.map((q, qIdx) => {
                const studentAns = studentAnswers[q.id];
                const isCorrect = studentAns === q.correct_option_index;
                const answered = studentAns !== undefined && studentAns !== null;
                
                return (
                  <div 
                    key={q.id} 
                    className={`p-4 rounded-xl border transition-all text-xs space-y-3 bg-white dark:bg-gray-950 ${
                      !answered
                        ? "border-gray-200 dark:border-gray-855"
                        : isCorrect
                        ? "border-emerald-100 dark:border-emerald-950/40 ring-1 ring-emerald-500/10"
                        : "border-red-100 dark:border-red-950/40 ring-1 ring-red-500/10"
                    }`}
                  >
                    {/* Header: Question Number & Result Status */}
                    <div className="flex items-start justify-between gap-3 border-b pb-2 border-gray-100 dark:border-gray-855">
                      <div className="font-bold text-gray-850 dark:text-white flex items-start gap-1">
                        <span>{qIdx + 1}.</span>
                        <span>{q.question_text}</span>
                      </div>
                      
                      {/* Status Badge */}
                      {isCorrect ? (
                        <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 uppercase">
                          <Check className="size-3 stroke-[3px]" /> Benar
                        </span>
                      ) : answered ? (
                        <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 uppercase">
                          <X className="size-3 stroke-[3px]" /> Salah
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-50 text-gray-500 dark:bg-gray-900/40 dark:text-gray-400 uppercase">
                          ⏱️ Lewat
                        </span>
                      )}
                    </div>

                    {/* Option Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pl-3">
                      {q.options.map((opt, oIdx) => {
                        const isThisCorrect = oIdx === q.correct_option_index;
                        const isSelectedByStudent = studentAns === oIdx;

                        let optClass = "border-gray-150 dark:border-gray-855 text-gray-650 dark:text-gray-400 bg-gray-50/10";
                        if (isThisCorrect) {
                          optClass = "border-success-400 bg-success-50/20 text-success-800 dark:bg-success-950/10 dark:text-success-400 font-semibold";
                        } else if (isSelectedByStudent) {
                          optClass = "border-red-400 bg-red-50/20 text-red-800 dark:bg-red-950/10 dark:text-red-400";
                        }

                        return (
                          <div 
                            key={oIdx}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 ${optClass}`}
                          >
                            <span className="font-bold opacity-60 text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                            {isThisCorrect && <Check className="size-3.5 text-success-600 dark:text-success-400 ml-auto shrink-0" />}
                            {!isThisCorrect && isSelectedByStudent && <X className="size-3.5 text-red-600 dark:text-red-400 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100/50 dark:border-amber-900/30 p-2.5 rounded-lg text-[10px] text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 shrink-0 text-xs">💡</span>
                        <div>
                          <span className="font-bold text-amber-700 dark:text-amber-400">Pembahasan:</span> {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
