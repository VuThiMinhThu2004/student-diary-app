import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import "./App.css";
import LoginForm from "./components/LoginForm";
import StudentDashboard from "./components/StudentDashboard";

const firebaseConfig = {
  apiKey: "AIzaSyBUwmSg7ISNIy6yUXXE44F4dq2M__z4PI4",
  authDomain: "study-journal-de130.firebaseapp.com",
  projectId: "study-journal-de130",
  storageBucket: "study-journal-de130.appspot.com",
  messagingSenderId: "91822596522",
  appId: "1:91822596522:web:8c1233cbe4571ce6a14bd3",
  measurementId: "G-J4Z75VG3XS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const TOTAL_CLASSES = 30; // Ví dụ học sinh học 30 buổi là xong chương trình

function App() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingLog, setEditingLog] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [editFeedback, setEditFeedback] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        loadLogs(u.uid);
      } else {
        setUser(null);
        setLogs([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLogs = async (uid) => {
    const colRef = collection(db, `students/${uid}/diary`);
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sắp xếp theo ngày mới nhất
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLogs(data);
  };

  const handleLogin = async () => {
    const email = prompt("Email:");
    const password = prompt("Password:");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const addLog = async () => {
    if (!note.trim()) {
      alert("Vui lòng nhập ghi chú bài học");
      return;
    }
    
    const date = new Date().toISOString().split("T")[0];
    await addDoc(collection(db, `students/${user.uid}/diary`), {
      date,
      note,
      feedback
    });
    setNote("");
    setFeedback("");
    loadLogs(user.uid);
  };

  const startEditing = (log) => {
    setEditingLog(log);
    setEditNote(log.note);
    setEditFeedback(log.feedback || "");
  };

  const cancelEditing = () => {
    setEditingLog(null);
    setEditNote("");
    setEditFeedback("");
  };

  const saveEdit = async () => {
    if (!editNote.trim()) {
      alert("Ghi chú không được để trống");
      return;
    }

    try {
      const logRef = doc(db, `students/${user.uid}/diary/${editingLog.id}`);
      await updateDoc(logRef, {
        note: editNote,
        feedback: editFeedback
      });
      
      cancelEditing();
      loadLogs(user.uid);
    } catch (error) {
      alert("Lỗi khi cập nhật: " + error.message);
    }
  };

  const deleteLog = async (logId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhật ký này?")) {
      try {
        const logRef = doc(db, `students/${user.uid}/diary/${logId}`);
        await deleteDoc(logRef);
        loadLogs(user.uid);
      } catch (error) {
        alert("Lỗi khi xóa: " + error.message);
      }
    }
  };

  const attendedCount = logs.length;
  const progressPercent = ((attendedCount / TOTAL_CLASSES) * 100).toFixed(1);
  const remaining = TOTAL_CLASSES - attendedCount;

  return (
    <div className="container">
      <h1>📘 Nhật ký học tập</h1>

      {!user ? (
        <LoginForm handleLogin={handleLogin} />
      ) : (
        <StudentDashboard
          user={user}
          handleLogout={handleLogout}
          note={note}
          setNote={setNote}
          feedback={feedback}
          setFeedback={setFeedback}
          addLog={addLog}
          attendedCount={attendedCount}
          TOTAL_CLASSES={TOTAL_CLASSES}
          progressPercent={progressPercent}
          remaining={remaining}
          logs={logs}
          editingLog={editingLog}
          editNote={editNote}
          setEditNote={setEditNote}
          editFeedback={editFeedback}
          setEditFeedback={setEditFeedback}
          startEditing={startEditing}
          saveEdit={saveEdit}
          cancelEditing={cancelEditing}
          deleteLog={deleteLog}
        />
      )}
    </div>
  );
}

export default App;