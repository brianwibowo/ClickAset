import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { 
  Users, 
  Play, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Award, 
  Clock, 
  HelpCircle, 
  Check, 
  X, 
  ListOrdered,
  PlusCircle,
  LogOut,
  ChevronRight
} from "lucide-react";

// Types
interface Quiz {
  id: string;
  title: string;
  description: string;
  teacher_id?: string;
  created_at?: string;
}

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  time_limit: number;
  explanation: string;
  order_index: number;
}

interface Room {
  id: string;
  quiz_id: string;
  room_code: string;
  status: "LOBBY" | "PLAYING" | "FINISHED";
}

interface Participant {
  id: string;
  room_id: string;
  username: string;
  score: number;
  current_question_index: number;
}

const defaultQuizzes: Quiz[] = [
  {
    id: "quiz-std-1",
    title: "Penyusutan Aset Tetap - SAK vs Pajak",
    description: "Evaluasi pemahaman konsep masa manfaat kelompok harta, tarif PPh, dan metode depresiasi komersial vs fiskal."
  }
];

const defaultQuestions: Question[] = [
  {
    id: "q-1",
    quiz_id: "quiz-std-1",
    question_text: "Menurut UU PPh Pasal 11 di Indonesia, manakah metode penyusutan yang diperbolehkan secara perpajakan?",
    options: [
      "Metode Garis Lurus & Saldo Menurun",
      "Metode Garis Lurus & Satuan Jam Kerja",
      "Metode Jumlah Angka Tahun & Saldo Menurun",
      "Semua metode akuntansi diperbolehkan"
    ],
    correct_option_index: 0,
    time_limit: 30,
    explanation: "Secara aturan perpajakan (fiskal) di Indonesia, hanya Metode Garis Lurus (Straight Line) dan Saldo Menurun (Declining Balance) yang diperkenankan untuk menghitung penyusutan harta berwujud.",
    order_index: 1
  },
  {
    id: "q-2",
    quiz_id: "quiz-std-1",
    question_text: "Aset tetap berwujud berupa Mobil Pick-up Operasional masuk ke kelompok penyusutan pajak berapa?",
    options: [
      "Kelompok 1 (Masa manfaat 4 tahun)",
      "Kelompok 2 (Masa manfaat 8 tahun)",
      "Kelompok 3 (Masa manfaat 16 tahun)",
      "Bangunan Tidak Permanen (Masa manfaat 10 tahun)"
    ],
    correct_option_index: 1,
    time_limit: 30,
    explanation: "Kendaraan bermotor/alat angkutan roda 4 operasional dikategorikan masuk Kelompok 2 dengan masa manfaat pajak selama 8 tahun.",
    order_index: 2
  },
  {
    id: "q-3",
    quiz_id: "quiz-std-1",
    question_text: "Berapakah asumsi nilai sisa (residu) akhir yang diakui dalam formula penyusutan perpajakan (fiskal) di Indonesia?",
    options: [
      "Rp10.000.000",
      "Taksiran realistis perusahaan",
      "Rp0 (diabaikan)",
      "10% dari harga perolehan"
    ],
    correct_option_index: 2,
    time_limit: 30,
    explanation: "Dalam perpajakan (fiskal), nilai sisa akhir masa manfaat diabaikan dan dianggap bernilai Rp0, berbeda dengan SAK komersial yang memperbolehkan adanya nilai taksiran sisa.",
    order_index: 3
  },
  {
    id: "q-4",
    quiz_id: "quiz-std-1",
    question_text: "Aset tetap jenis Gedung Kantor (Bangunan Permanen) disusutkan menurut pajak menggunakan metode...",
    options: [
      "Wajib Metode Saldo Menurun",
      "Wajib Metode Garis Lurus",
      "Boleh memilih antara Garis Lurus dan Saldo Menurun",
      "Tidak diperbolehkan disusutkan menurut pajak"
    ],
    correct_option_index: 1,
    time_limit: 30,
    explanation: "Kelompok aset Bangunan (baik permanen 20 tahun maupun semi-permanen 10 tahun) wajib disusutkan menggunakan Metode Garis Lurus. Metode Saldo Menurun dilarang untuk bangunan.",
    order_index: 4
  }
];

const Kuis: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [studentGuestName, setStudentGuestName] = useState("");
  
  // Data lists
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Guru creation views
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<Quiz | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQText, setNewQText] = useState("");
  const [newQOpts, setNewQOpts] = useState<string[]>(["", "", "", ""]);
  const [newQCorrect, setNewQCorrect] = useState<number>(0);
  const [newQTimer, setNewQTimer] = useState<number>(30);
  const [newQExpl, setNewQExpl] = useState("");

  // Room states
  const [myRoom, setMyRoom] = useState<Room | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Student Quiz playing states
  const [quizState, setQuizState] = useState<{
    status: "LOBBY" | "PLAYING" | "FINISHED";
    currentIndex: number;
    score: number;
    selectedOption: number | null;
    answered: boolean;
    timeLeft: number;
    showExplanation: boolean;
    earnedPoints: number;
  }>({
    status: "LOBBY",
    currentIndex: 0,
    score: 0,
    selectedOption: null,
    answered: false,
    timeLeft: 30,
    showExplanation: false,
    earnedPoints: 0
  });

  const timerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Fetch user session
    const userJson = localStorage.getItem("clickaset_user");
    if (userJson) {
      setUser(JSON.parse(userJson));
    }

    // 2. Initialize default templates to DB if empty
    initializeDb();

    // 3. Fetch list quizzes & questions
    fetchQuizzesAndQuestions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Realtime synchronization listeners
  useEffect(() => {
    let subscription: any = null;

    if (myRoom) {
      // Listen to DB changes in active room or participants
      subscription = supabase
        .channel(`room-channel-${myRoom.room_code}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => {
          refreshRoomState();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
          refreshParticipants();
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [myRoom]);

  // Handle countdown timer during gameplay
  useEffect(() => {
    if (quizState.status === "PLAYING" && !quizState.answered && quizState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Handle timeout
            return {
              ...prev,
              timeLeft: 0,
              answered: true,
              selectedOption: null,
              showExplanation: true,
              earnedPoints: 0
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState.status, quizState.currentIndex, quizState.answered]);

  // Initializing databases tables
  const initializeDb = async () => {
    // Try listing quizzes
    const { data: qData } = await supabase.from("quizzes").select("*");
    if (!qData || qData.length === 0) {
      // Seed default quiz
      await supabase.from("quizzes").insert(defaultQuizzes);
      await supabase.from("questions").insert(defaultQuestions);
    }
  };

  const fetchQuizzesAndQuestions = async () => {
    const { data: qData } = await supabase.from("quizzes").select("*");
    if (qData) setQuizzes(qData);

    const { data: questData } = await supabase.from("questions").select("*").order("order_index", { ascending: true });
    if (questData) setQuestions(questData);
  };

  const refreshRoomState = async () => {
    if (!myRoom) return;
    const { data } = await supabase.from("rooms").select("*").eq("id", myRoom.id).single();
    if (data) {
      setMyRoom(data);
      if (data.status === "PLAYING" && quizState.status === "LOBBY") {
        // Start playing for student!
        setQuizState(prev => ({ ...prev, status: "PLAYING", currentIndex: 0, score: 0 }));
      }
      if (data.status === "FINISHED") {
        setQuizState(prev => ({ ...prev, status: "FINISHED" }));
      }
    }
  };

  const refreshParticipants = async () => {
    if (!myRoom) return;
    const { data } = await supabase.from("participants").select("*").eq("room_id", myRoom.id).order("score", { ascending: false });
    if (data) {
      setParticipants(data);
    }
  };

  // ----------------------------------------------------
  // GURU OPERATIONS
  // ----------------------------------------------------
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle) return;

    const newQuiz = {
      title: newQuizTitle,
      description: newQuizDesc,
      teacher_id: user?.id || "guru-default-id"
    };

    await supabase.from("quizzes").insert(newQuiz);
    fetchQuizzesAndQuestions();
    setShowCreateQuiz(false);
    setNewQuizTitle("");
    setNewQuizDesc("");
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kuis ini beserta soal-soalnya?")) {
      await supabase.from("quizzes").delete().eq("id", id);
      fetchQuizzesAndQuestions();
      if (activeQuizForQuestions?.id === id) {
        setActiveQuizForQuestions(null);
      }
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizForQuestions || !newQText || newQOpts.some(o => !o)) {
      alert("Mohon isi semua kolom pertanyaan dan pilihan jawaban!");
      return;
    }

    const newQuest = {
      quiz_id: activeQuizForQuestions.id,
      question_text: newQText,
      options: newQOpts,
      correct_option_index: newQCorrect,
      time_limit: newQTimer,
      explanation: newQExpl,
      order_index: questions.filter(q => q.quiz_id === activeQuizForQuestions.id).length + 1
    };

    await supabase.from("questions").insert(newQuest);
    fetchQuizzesAndQuestions();
    setShowAddQuestion(false);
    setNewQText("");
    setNewQOpts(["", "", "", ""]);
    setNewQCorrect(0);
    setNewQTimer(30);
    setNewQExpl("");
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm("Hapus soal ini?")) {
      await supabase.from("questions").delete().eq("id", id);
      fetchQuizzesAndQuestions();
    }
  };

  const handleOpenRoom = async (quizId: string) => {
    // Create random 6 digit room code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newRoom = {
      quiz_id: quizId,
      room_code: code,
      status: "LOBBY"
    };

    await supabase.from("rooms").insert(newRoom);
    // Fetch newly created room
    const { data: dbRooms } = await supabase.from("rooms").select("*").eq("room_code", code).single();
    if (dbRooms) {
      setMyRoom(dbRooms);
      setParticipants([]);
    }
  };

  const handleStartQuiz = async () => {
    if (!myRoom) return;
    await supabase.from("rooms").update({ status: "PLAYING" }).eq("id", myRoom.id);
    refreshRoomState();
  };

  const handleEndQuiz = async () => {
    if (!myRoom) return;
    await supabase.from("rooms").update({ status: "FINISHED" }).eq("id", myRoom.id);
    refreshRoomState();
  };

  // ----------------------------------------------------
  // SISWA & GUEST OPERATIONS
  // ----------------------------------------------------
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput) return;

    if (!user) {
      window.dispatchEvent(new CustomEvent("show-auth-modal", {
        detail: { message: "Ingin bergabung ke kuis interaktif bersama teman-teman? Yuk, login terlebih dahulu!" }
      }));
      return;
    }

    const nickname = user ? user.username : studentGuestName;
    if (!nickname) {
      alert("Silakan masukkan nama panggilan terlebih dahulu!");
      return;
    }

    // Check if room exists and is in LOBBY
    const { data: dbRoom } = await supabase.from("rooms").select("*").eq("room_code", roomCodeInput).single();
    
    if (!dbRoom) {
      alert("Kode Room tidak ditemukan! Periksa kembali kode dari Guru.");
      return;
    }

    if (dbRoom.status === "FINISHED") {
      alert("Kuis ini telah selesai diselenggarakan.");
      return;
    }

    // Join room as participant
    const newParticipant = {
      room_id: dbRoom.id,
      user_id: user?.id || null,
      username: nickname,
      score: 0,
      current_question_index: 0
    };

    await supabase.from("participants").insert(newParticipant);
    setMyRoom(dbRoom);
    setQuizState({
      status: "LOBBY",
      currentIndex: 0,
      score: 0,
      selectedOption: null,
      answered: false,
      timeLeft: 30,
      showExplanation: false,
      earnedPoints: 0
    });
    
    // Refresh participant list
    const { data: parts } = await supabase.from("participants").select("*").eq("room_id", dbRoom.id);
    if (parts) setParticipants(parts);
  };

  const handleSubmitAnswer = async (selectedIdx: number, correctIdx: number, timeLimit: number) => {
    if (quizState.answered) return;

    const isCorrect = (selectedIdx === correctIdx);
    let points = 0;
    
    if (isCorrect) {
      // Calculation points: 100 flat + bonus speed (up to 50 pts)
      const bonus = Math.round((quizState.timeLeft / timeLimit) * 50);
      points = 100 + bonus;
    }

    const newScore = quizState.score + points;

    setQuizState(prev => ({
      ...prev,
      answered: true,
      selectedOption: selectedIdx,
      showExplanation: true,
      earnedPoints: points,
      score: newScore
    }));

    if (timerRef.current) clearInterval(timerRef.current);

    // Update participant score in DB/localStorage
    const nickname = user ? user.username : studentGuestName;
    if (myRoom) {
      const { data: myPart } = await supabase.from("participants")
        .select("*")
        .eq("room_id", myRoom.id)
        .eq("username", nickname)
        .single();

      if (myPart) {
        await supabase.from("participants")
          .update({ 
            score: newScore,
            current_question_index: quizState.currentIndex + 1 
          })
          .eq("id", myPart.id);
      }
    }
  };

  const handleNextQuestion = () => {
    const roomQuests = questions.filter(q => q.quiz_id === myRoom?.quiz_id);
    const hasNext = quizState.currentIndex + 1 < roomQuests.length;

    if (hasNext) {
      const nextIndex = quizState.currentIndex + 1;
      const nextQuest = roomQuests[nextIndex];
      setQuizState({
        status: "PLAYING",
        currentIndex: nextIndex,
        score: quizState.score,
        selectedOption: null,
        answered: false,
        timeLeft: nextQuest.time_limit,
        showExplanation: false,
        earnedPoints: 0
      });
    } else {
      // Completed all questions
      setQuizState(prev => ({ ...prev, status: "FINISHED" }));
    }
  };

  const handleLeaveRoom = () => {
    setMyRoom(null);
    setQuizState({
      status: "LOBBY",
      currentIndex: 0,
      score: 0,
      selectedOption: null,
      answered: false,
      timeLeft: 30,
      showExplanation: false,
      earnedPoints: 0
    });
    setRoomCodeInput("");
  };

  const isGuru = user && user.role === "GURU";
  const activeRoomQuestions = myRoom ? questions.filter(q => q.quiz_id === myRoom.quiz_id) : [];

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading dark:text-white">
            Kuis Edukasi Interaktif
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isGuru 
              ? "Kelola kuis kelas Anda, buka ruangan kelas, dan pantau leaderboard secara live." 
              : "Masukkan kode room yang diberikan guru Anda untuk memulai kuis evaluasi."}
          </p>
        </div>
        {myRoom && (
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 transition"
          >
            <LogOut className="size-3.5" />
            Keluar Room
          </button>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* CASE A: USER GURU VIEW (DASHBOARD & MANAGEMENT) */}
      {/* ---------------------------------------------------- */}
      {isGuru && !myRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
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
                  className="p-1 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-md transition"
                >
                  <PlusCircle className="size-5" />
                </button>
              </div>

              {/* Create Quiz Form toggle */}
              {showCreateQuiz && (
                <form onSubmit={handleCreateQuiz} className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 animate-fadeIn">
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
                      className="px-2.5 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-150"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-brand-500 text-white rounded hover:bg-brand-600 font-semibold"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              {/* Quiz list rendering */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {quizzes.map(q => (
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
                      className="p-1 hover:bg-red-50 text-red-500 rounded dark:hover:bg-red-500/10"
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
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold shadow transition"
                    >
                      <Plus className="size-3.5" />
                      Tambah Soal
                    </button>
                    <button
                      onClick={() => handleOpenRoom(activeQuizForQuestions.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition"
                    >
                      <Play className="size-3.5" />
                      Buka Room Kelas
                    </button>
                  </div>
                </div>

                {/* Add Question Inline Form */}
                {showAddQuestion && (
                  <form onSubmit={handleAddQuestion} className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Butir Pertanyaan</label>
                      <textarea
                        required
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="Masukkan pertanyaan kuis..."
                        rows={2}
                        className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Option arrays */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {newQOpts.map((opt, oIdx) => (
                        <div key={oIdx}>
                          <label className="block text-[9px] text-gray-400 uppercase mb-0.5">Opsi {String.fromCharCode(65 + oIdx)}</label>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const newArr = [...newQOpts];
                              newArr[oIdx] = e.target.value;
                              setNewQOpts(newArr);
                            }}
                            placeholder={`Ketik pilihan jawaban ${String.fromCharCode(65 + oIdx)}`}
                            className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct index & timer */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] text-gray-400 uppercase mb-1">Pilihan Kunci Benar</label>
                        <select
                          value={newQCorrect}
                          onChange={(e) => setNewQCorrect(Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                        >
                          <option value={0}>Opsi A</option>
                          <option value={1}>Opsi B</option>
                          <option value={2}>Opsi C</option>
                          <option value={3}>Opsi D</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[9px] text-gray-400 uppercase mb-1">Timer (Detik)</label>
                        <input
                          type="number"
                          value={newQTimer}
                          min={5}
                          onChange={(e) => setNewQTimer(Math.max(5, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Pembahasan Pembelajaran (Edukasi)</label>
                      <textarea
                        value={newQExpl}
                        onChange={(e) => setNewQExpl(e.target.value)}
                        placeholder="Ketik penjelasan jawaban yang benar..."
                        rows={2}
                        className="w-full px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setShowAddQuestion(false)}
                        className="px-3 py-1.5 border border-gray-200 rounded text-gray-500 hover:bg-gray-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-brand-500 text-white rounded hover:bg-brand-600 font-semibold shadow"
                      >
                        Simpan Pertanyaan
                      </button>
                    </div>
                  </form>
                )}

                {/* List questions of active quiz */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-gray-500 dark:text-gray-400">
                    Butir Soal Kuis ({questions.filter(q => q.quiz_id === activeQuizForQuestions.id).length}):
                  </h4>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {questions.filter(q => q.quiz_id === activeQuizForQuestions.id).map((q, idx) => (
                      <div key={q.id} className="p-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-lg text-xs space-y-2 flex justify-between gap-3">
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
                          className="text-red-500 hover:bg-red-50 p-1 rounded h-fit self-center dark:hover:bg-red-500/10"
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

      {/* ---------------------------------------------------- */}
      {/* CASE B: ROOM LOBBY (TEACHER VIEW) */}
      {/* ---------------------------------------------------- */}
      {isGuru && myRoom && (
        <div className="bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md space-y-6">
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
              <div className="text-4xl md:text-5xl font-mono font-bold text-brand-400 tracking-wider">
                {myRoom.room_code}
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
                      className="p-3 border border-gray-200 dark:border-gray-850 rounded-lg flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40 text-xs"
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
                    <Award className="size-4.5" /> Live Podium CLICKASET
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

      {/* ---------------------------------------------------- */}
      {/* CASE C: STUDENTS LOBBY JOIN / GUEST SETUP */}
      {/* ---------------------------------------------------- */}
      {!isGuru && !myRoom && (
        <div className="max-w-md mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md space-y-6">
          <div className="text-center">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bergabung ke Kuis</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Masukkan nama panggilan Anda dan kode room yang dibagikan oleh Guru.</p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            {/* Display Guest Nickname input if user not signed in */}
            {!user ? (
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Nama Panggilan (Siswa)
                </label>
                <input
                  type="text"
                  required
                  value={studentGuestName}
                  onChange={(e) => setStudentGuestName(e.target.value)}
                  placeholder="Ketik nama panggilan Anda..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-xs text-gray-650 dark:text-gray-300 border border-gray-150 dark:border-gray-850">
                Bermain sebagai siswa terdaftar: <strong>{user.username}</strong> ({user.full_name})
              </div>
            )}

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
              disabled={(!user && !studentGuestName) || roomCodeInput.length < 6}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow transition"
            >
              Masuk ke Room Kuis
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CASE D: STUDENTS WAITING LOBBY */}
      {/* ---------------------------------------------------- */}
      {!isGuru && myRoom && quizState.status === "LOBBY" && (
        <div className="max-w-md mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-8 text-center space-y-6 shadow-theme-md">
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

          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-left text-xs">
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

      {/* ---------------------------------------------------- */}
      {/* CASE E: STUDENTS PLAYING QUESTION RUNNER */}
      {/* ---------------------------------------------------- */}
      {!isGuru && myRoom && quizState.status === "PLAYING" && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md space-y-6">
          
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

                  let btnClass = "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-300";

                  if (showAnswer) {
                    if (isCorrect) {
                      btnClass = "border-success-500 bg-success-50/50 text-success-800 dark:bg-success-950/20 dark:text-success-400 font-semibold";
                    } else if (isSelected) {
                      btnClass = "border-red-500 bg-red-50/50 text-red-800 dark:bg-red-950/20 dark:text-red-400";
                    } else {
                      btnClass = "border-gray-100 dark:border-gray-900 opacity-50 bg-gray-50/10 text-gray-400";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={quizState.answered}
                      onClick={() => handleSubmitAnswer(oIdx, activeRoomQuestions[quizState.currentIndex].correct_option_index, activeRoomQuestions[quizState.currentIndex].time_limit)}
                      className={`text-left p-4 rounded-xl border transition-all text-xs md:text-sm flex items-start gap-3 cursor-pointer hover:scale-[1.01] ${btnClass}`}
                    >
                      <span className="font-bold rounded-full size-5 bg-white/10 flex items-center justify-center border border-current shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
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

      {/* ---------------------------------------------------- */}
      {/* CASE F: STUDENTS FINISHED GAME (WAITING / FINAL SCORE) */}
      {/* ---------------------------------------------------- */}
      {!isGuru && myRoom && quizState.status === "FINISHED" && (
        <div className="max-w-md mx-auto bg-white border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-2xl p-6 shadow-theme-md space-y-6 text-center">
          <div className="inline-flex items-center justify-center p-3.5 bg-brand-50 dark:bg-brand-500/10 rounded-full text-brand-500 mb-2">
            <Award className="size-9 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Kuis Selesai!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kerja bagus! Anda telah menyelesaikan seluruh soal kuis yang diberikan.
            </p>
          </div>

          {/* Student Final score */}
          <div className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900 rounded-xl p-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Skor Akhir Anda</span>
            <span className="text-3xl font-mono font-bold text-brand-600 dark:text-brand-400">
              {quizState.score} pt
            </span>
          </div>

          {/* List final leaderboard rankings */}
          <div className="space-y-2.5 text-left">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block border-b pb-1">Leaderboard Room:</span>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
              {participants.map((p, idx) => (
                <div 
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 border rounded-lg text-xs ${
                    p.username === (user ? user.username : studentGuestName)
                      ? "border-brand-300 bg-brand-50/20 dark:bg-brand-500/5 dark:border-brand-500 font-bold"
                      : "border-gray-150 dark:border-gray-850"
                  }`}
                >
                  <span className="text-gray-850 dark:text-gray-300">
                    {idx + 1}. {p.username} {p.username === (user ? user.username : studentGuestName) && " (Anda)"}
                  </span>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">{p.score} pt</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Kuis;
