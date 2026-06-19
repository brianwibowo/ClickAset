import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { showLoading, hideLoading } from "../utils/loader";
import { 
  LogOut,
  Coins,
  Building2,
  Calculator,
  Shield
} from "lucide-react";
import { DUMMY_QUIZZES } from "../data/dummyQuizzes";
import { GuruQuizPanel } from "../components/kuis/GuruQuizPanel";
import { StudentQuizPanel } from "../components/kuis/StudentQuizPanel";

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
  const [loading, setLoading] = useState(true);
  
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
  const [myParticipantId, setMyParticipantId] = useState<string>("");
  const [studentAnswers, setStudentAnswers] = useState<{ [questionId: string]: number | null }>({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
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
  const refreshRoomStateRef = useRef<any>(null);
  const refreshParticipantsRef = useRef<any>(null);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const loadRecentActivities = (userId: string) => {
    const key = `clickaset_recent_activity_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setRecentActivities(JSON.parse(raw));
      } catch (e) {
        setRecentActivities([]);
      }
    } else {
      setRecentActivities([]);
    }
  };

  const saveRecentActivity = (quizId: string, correctCount: number, totalQuestions: number) => {
    if (!user) return;
    const key = `clickaset_recent_activity_${user.id}`;
    const raw = localStorage.getItem(key);
    let activities = [];
    if (raw) {
      try {
        activities = JSON.parse(raw);
      } catch (e) {
        activities = [];
      }
    }
    
    const accuracy = Math.round((correctCount / (totalQuestions || 1)) * 100);
    const quizObj = DUMMY_QUIZZES.find(q => q.id === quizId);
    if (!quizObj) return;
    
    const newActivity = {
      id: `${quizId}_${Date.now()}`,
      quizId,
      title: quizObj.title,
      accuracy,
      totalQuestions,
      timestamp: new Date().toISOString()
    };
    
    activities = [newActivity, ...activities.filter((a: any) => a.quizId !== quizId)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(activities));
    setRecentActivities(activities);
  };

  // Keep refresh function references up-to-date to avoid stale closure issues
  useEffect(() => {
    refreshRoomStateRef.current = refreshRoomState;
    refreshParticipantsRef.current = refreshParticipants;
  });

  useEffect(() => {
    // 1. Fetch user session
    const userJson = localStorage.getItem("clickaset_user");
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      setUser(parsedUser);
      loadRecentActivities(parsedUser.id);
    }

    // 2. Initialize default templates to DB if empty
    initializeDb();

    // 3. Fetch list quizzes & questions
    fetchQuizzesAndQuestions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Realtime synchronization listeners & polling fallback
  useEffect(() => {
    let subscription: any = null;
    let interval: any = null;

    if (myRoom?.id) {
      // Setup Supabase Realtime channel
      subscription = supabase
        .channel(`room-channel-${myRoom.room_code}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => {
          if (refreshRoomStateRef.current) refreshRoomStateRef.current();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
          if (refreshParticipantsRef.current) refreshParticipantsRef.current();
        })
        .subscribe();

      // Setup 3-second polling interval as a fallback (especially when Supabase Realtime replication is not enabled)
      interval = setInterval(() => {
        if (refreshRoomStateRef.current) refreshRoomStateRef.current();
        if (refreshParticipantsRef.current) refreshParticipantsRef.current();
      }, 3000);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [myRoom?.id, myRoom?.room_code]);

  // Handle countdown timer during gameplay
  useEffect(() => {
    if (quizState.status === "PLAYING" && !quizState.answered && quizState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Handle timeout
            const activeRoomQuests = myRoom 
              ? (myRoom.room_code === "LATIHAN" 
                 ? DUMMY_QUIZZES.find(q => q.id === myRoom.quiz_id)?.questions || [] 
                 : questions.filter(q => q.quiz_id === myRoom.quiz_id))
              : [];
            const activeQuest = activeRoomQuests[prev.currentIndex];
            if (activeQuest) {
              setStudentAnswers(sa => ({
                ...sa,
                [activeQuest.id]: null
              }));
            }
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

  const handleCopyCode = () => {
    if (!myRoom) return;
    navigator.clipboard.writeText(myRoom.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const restoreActiveRoom = async (loadedQuestions: Question[]) => {
    const activeRoomId = sessionStorage.getItem("clickaset_active_room_id");
    if (!activeRoomId) return;

    try {
      const { data: dbRoom } = await supabase.from("rooms").select("*").eq("id", activeRoomId).single();
      if (!dbRoom) {
        sessionStorage.removeItem("clickaset_active_room_id");
        sessionStorage.removeItem("clickaset_active_participant_id");
        return;
      }

      if (dbRoom.status === "FINISHED") {
        sessionStorage.removeItem("clickaset_active_room_id");
        sessionStorage.removeItem("clickaset_active_participant_id");
        return;
      }

      setMyRoom(dbRoom);

      const { data: parts } = await supabase.from("participants").select("*").eq("room_id", dbRoom.id).order("score", { ascending: false });
      if (parts) {
        setParticipants(parts);
      }

      const activeParticipantId = sessionStorage.getItem("clickaset_active_participant_id");
      if (activeParticipantId) {
        setMyParticipantId(activeParticipantId);
        
        const { data: myPart } = await supabase.from("participants").select("*").eq("id", activeParticipantId).single();
        if (myPart) {
          const roomQuests = loadedQuestions.filter(q => q.quiz_id === dbRoom.quiz_id);
          const currentIdx = myPart.current_question_index || 0;
          const isDone = currentIdx >= roomQuests.length;

          if (dbRoom.status === "LOBBY") {
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
          } else if (dbRoom.status === "PLAYING") {
            if (isDone) {
              setQuizState(prev => ({
                ...prev,
                status: "FINISHED",
                currentIndex: currentIdx,
                score: myPart.score
              }));
            } else {
              const currentQuest = roomQuests[currentIdx];
              setQuizState({
                status: "PLAYING",
                currentIndex: currentIdx,
                score: myPart.score,
                selectedOption: null,
                answered: false,
                timeLeft: currentQuest?.time_limit || 30,
                showExplanation: false,
                earnedPoints: 0
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to restore active room:", err);
    }
  };

  // Handle countdown before quiz starts
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const activeRoomQuests = myRoom ? questions.filter(q => q.quiz_id === myRoom.quiz_id) : [];
      const firstQuestLimit = activeRoomQuests[0]?.time_limit || 30;
      
      setQuizState(prev => ({
        ...prev,
        status: "PLAYING",
        currentIndex: 0,
        score: 0,
        selectedOption: null,
        answered: false,
        timeLeft: firstQuestLimit,
        showExplanation: false,
        earnedPoints: 0
      }));
      setCountdown(null);
    }
  }, [countdown, myRoom, questions]);

  const fetchQuizzesAndQuestions = async () => {
    setLoading(true);
    try {
      const { data: qData } = await supabase.from("quizzes").select("*");
      if (qData) setQuizzes(qData);

      const { data: questData } = await supabase.from("questions").select("*").order("order_index", { ascending: true });
      if (questData) {
        setQuestions(questData);
        // Restore active room session if any
        await restoreActiveRoom(questData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshRoomState = async () => {
    if (!myRoom || myRoom.room_code === "LATIHAN") return;
    const { data } = await supabase.from("rooms").select("*").eq("id", myRoom.id).single();
    if (data) {
      setMyRoom(data);
      if (data.status === "PLAYING" && quizState.status === "LOBBY" && countdown === null) {
        // Trigger countdown first
        setCountdown(3);
      }
      if (data.status === "FINISHED") {
        setQuizState(prev => ({ ...prev, status: "FINISHED" }));
      }
    }
  };

  const refreshParticipants = async () => {
    if (!myRoom || myRoom.room_code === "LATIHAN") return;
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

    showLoading("Membuat kuis baru...");
    try {
      await supabase.from("quizzes").insert(newQuiz);
      await fetchQuizzesAndQuestions();
      setShowCreateQuiz(false);
      setNewQuizTitle("");
      setNewQuizDesc("");
    } catch (err: any) {
      alert("Gagal membuat kuis: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kuis ini beserta soal-soalnya?")) {
      showLoading("Menghapus kuis...");
      try {
        await supabase.from("quizzes").delete().eq("id", id);
        await fetchQuizzesAndQuestions();
        if (activeQuizForQuestions?.id === id) {
          setActiveQuizForQuestions(null);
        }
      } catch (err: any) {
        alert("Gagal menghapus kuis: " + err.message);
      } finally {
        hideLoading();
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

    showLoading("Menambahkan soal...");
    try {
      await supabase.from("questions").insert(newQuest);
      await fetchQuizzesAndQuestions();
      setShowAddQuestion(false);
      setNewQText("");
      setNewQOpts(["", "", "", ""]);
      setNewQCorrect(0);
      setNewQTimer(30);
      setNewQExpl("");
    } catch (err: any) {
      alert("Gagal menambahkan soal: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm("Hapus soal ini?")) {
      showLoading("Menghapus soal...");
      try {
        await supabase.from("questions").delete().eq("id", id);
        await fetchQuizzesAndQuestions();
      } catch (err: any) {
        alert("Gagal menghapus soal: " + err.message);
      } finally {
        hideLoading();
      }
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

    showLoading("Membuka room kuis baru...");
    try {
      await supabase.from("rooms").insert(newRoom);
      // Fetch newly created room
      const { data: dbRooms } = await supabase.from("rooms").select("*").eq("room_code", code).single();
      if (dbRooms) {
        setMyRoom(dbRooms);
        setParticipants([]);
        sessionStorage.setItem("clickaset_active_room_id", dbRooms.id);
      }
    } catch (err: any) {
      alert("Gagal membuka room kuis: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleStartQuiz = async () => {
    if (!myRoom) return;
    showLoading("Memulai kuis...");
    try {
      await supabase.from("rooms").update({ status: "PLAYING" }).eq("id", myRoom.id);
      await refreshRoomState();
    } catch (err: any) {
      alert("Gagal memulai kuis: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleEndQuiz = async () => {
    if (!myRoom) return;
    showLoading("Mengakhiri kuis...");
    try {
      await supabase.from("rooms").update({ status: "FINISHED" }).eq("id", myRoom.id);
      await refreshRoomState();
    } catch (err: any) {
      alert("Gagal mengakhiri kuis: " + err.message);
    } finally {
      hideLoading();
    }
  };

  // ----------------------------------------------------
  // SISWA & GUEST OPERATIONS
  // ----------------------------------------------------
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput) return;

    if (!user) {
      window.dispatchEvent(
        new CustomEvent("show-auth-modal", {
          detail: { message: "Silakan login terlebih dahulu untuk bergabung ke room kuis." }
        })
      );
      return;
    }

    const nickname = user.username;
    if (!nickname) {
      alert("Silakan lengkapi profil Anda terlebih dahulu!");
      return;
    }

    showLoading("Bergabung ke room kuis...");
    try {
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

      // Fetch the inserted participant ID for unique tracking
      const { data: searchPart } = await supabase.from("participants")
        .select("*")
        .eq("room_id", dbRoom.id)
        .eq("username", nickname)
        .order("created_at", { ascending: false });

      const joinedPart = searchPart && searchPart.length > 0 ? searchPart[0] : null;
      if (joinedPart) {
        setMyParticipantId(joinedPart.id);
        sessionStorage.setItem("clickaset_active_participant_id", joinedPart.id);
      }

      setMyRoom(dbRoom);
      sessionStorage.setItem("clickaset_active_room_id", dbRoom.id);
      setStudentAnswers({});
      setCorrectAnswersCount(0);
      setQuizState({
        status: "LOBBY",
        currentIndex: 0,
        score: 0,
        selectedOption: null,
        answered: false,
        timeLeft: 35, // default buffer
        showExplanation: false,
        earnedPoints: 0
      });
      
      // Refresh participant list
      const { data: parts } = await supabase.from("participants").select("*").eq("room_id", dbRoom.id);
      if (parts) setParticipants(parts);
    } catch (err: any) {
      alert("Gagal bergabung ke room: " + err.message);
    } finally {
      hideLoading();
    }
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

    const activeQuest = activeRoomQuestions[quizState.currentIndex];
    if (activeQuest) {
      setStudentAnswers(prev => ({
        ...prev,
        [activeQuest.id]: selectedIdx
      }));
      if (isCorrect) {
        setCorrectAnswersCount(prev => prev + 1);
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);

    // Update participant score in DB/localStorage using unique participant ID
    if (myParticipantId && myRoom?.room_code !== "LATIHAN") {
      try {
        await supabase.from("participants")
          .update({ 
            score: newScore,
            current_question_index: quizState.currentIndex + 1 
          })
          .eq("id", myParticipantId);
      } catch (err) {
        console.error("Gagal memperbarui skor kuis:", err);
      }
    } else if (myRoom?.room_code === "LATIHAN" && user) {
      setParticipants([
        {
          id: "local-user",
          room_id: myRoom.id,
          username: user.username,
          score: newScore,
          current_question_index: quizState.currentIndex + 1
        }
      ]);
    }
  };

  const handleNextQuestion = () => {
    const roomQuests = activeRoomQuestions;
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
      
      // Save recent activity if it's a dummy quiz
      if (myRoom?.room_code === "LATIHAN" && user) {
        saveRecentActivity(myRoom.quiz_id, correctAnswersCount, roomQuests.length);
      }
    }
  };

  const handleLeaveRoom = () => {
    setMyRoom(null);
    setMyParticipantId("");
    sessionStorage.removeItem("clickaset_active_room_id");
    sessionStorage.removeItem("clickaset_active_participant_id");
    setStudentAnswers({});
    setCorrectAnswersCount(0);
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

  const handleStartDummyQuiz = (quizId: string) => {
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("show-auth-modal", {
          detail: { message: "Silakan masuk atau daftar terlebih dahulu untuk mencoba kuis mandiri." }
        })
      );
      return;
    }
    
    // Initialize dummy quiz
    const quizObj = DUMMY_QUIZZES.find(q => q.id === quizId);
    if (!quizObj) return;
    
    const mockRoom: Room = {
      id: `room_${quizId}`,
      quiz_id: quizId,
      room_code: "LATIHAN",
      status: "PLAYING"
    };
    
    setMyRoom(mockRoom);
    setMyParticipantId("local-user");
    setParticipants([
      {
        id: "local-user",
        room_id: mockRoom.id,
        username: user.username,
        score: 0,
        current_question_index: 0
      }
    ]);
    setStudentAnswers({});
    setCorrectAnswersCount(0);
    setQuizState({
      status: "PLAYING",
      currentIndex: 0,
      score: 0,
      selectedOption: null,
      answered: false,
      timeLeft: quizObj.questions[0].time_limit,
      showExplanation: false,
      earnedPoints: 0
    });
  };

  const renderQuizIcon = (name: string) => {
    switch (name) {
      case "Coins":
        return <Coins className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case "Building2":
        return <Building2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case "Calculator":
        return <Calculator className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case "Shield":
        return <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      default:
        return <Coins className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
    }
  };

  const isGuru = user && user.role === "GURU";
  const activeRoomQuestions = myRoom 
    ? (myRoom.room_code === "LATIHAN" 
       ? DUMMY_QUIZZES.find(q => q.id === myRoom.quiz_id)?.questions || [] 
       : questions.filter(q => q.quiz_id === myRoom.quiz_id))
    : [];

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

      {isGuru ? (
        <GuruQuizPanel
          quizzes={quizzes}
          questions={questions}
          loading={loading}
          showCreateQuiz={showCreateQuiz}
          setShowCreateQuiz={setShowCreateQuiz}
          newQuizTitle={newQuizTitle}
          setNewQuizTitle={setNewQuizTitle}
          newQuizDesc={newQuizDesc}
          setNewQuizDesc={setNewQuizDesc}
          activeQuizForQuestions={activeQuizForQuestions}
          setActiveQuizForQuestions={setActiveQuizForQuestions}
          showAddQuestion={showAddQuestion}
          setShowAddQuestion={setShowAddQuestion}
          newQText={newQText}
          setNewQText={setNewQText}
          newQOpts={newQOpts}
          setNewQOpts={setNewQOpts}
          newQCorrect={newQCorrect}
          setNewQCorrect={setNewQCorrect}
          newQTimer={newQTimer}
          setNewQTimer={setNewQTimer}
          newQExpl={newQExpl}
          setNewQExpl={setNewQExpl}
          myRoom={myRoom}
          copied={copied}
          participants={participants}
          activeRoomQuestions={activeRoomQuestions}
          handleCreateQuiz={handleCreateQuiz}
          handleDeleteQuiz={handleDeleteQuiz}
          handleAddQuestion={handleAddQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
          handleOpenRoom={handleOpenRoom}
          handleStartQuiz={handleStartQuiz}
          handleEndQuiz={handleEndQuiz}
          handleCopyCode={handleCopyCode}
        />
      ) : (
        <StudentQuizPanel
          user={user}
          roomCodeInput={roomCodeInput}
          setRoomCodeInput={setRoomCodeInput}
          recentActivities={recentActivities}
          countdown={countdown}
          participants={participants}
          quizState={quizState}
          correctAnswersCount={correctAnswersCount}
          studentAnswers={studentAnswers}
          activeRoomQuestions={activeRoomQuestions}
          myRoom={myRoom}
          handleJoinRoom={handleJoinRoom}
          handleStartDummyQuiz={handleStartDummyQuiz}
          handleSubmitAnswer={handleSubmitAnswer}
          handleNextQuestion={handleNextQuestion}
          renderQuizIcon={renderQuizIcon}
        />
      )}

    </div>
  );
};

export default Kuis;
