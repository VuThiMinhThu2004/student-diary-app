import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import UserHeader from './UserHeader';
import ProgressTracker from './ProgressTracker';
import DiaryHistory from './DiaryHistory';

function StudentDashboard({ user, onLogout }) {
  const [logs, setLogs] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // Load nhật ký của học sinh và thông tin cá nhân
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Lấy thông tin cá nhân từ users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setStudentInfo(userDoc.data());
        }

        // Lấy nhật ký từ students collection
        const logsRef = collection(db, 'students', user.uid, 'diary');
        const snapshot = await getDocs(logsRef);
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        logsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLogs(logsData);
      } catch (error) {
        console.error('Lỗi tải dữ liệu học sinh:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user.uid, db]);

  // Tính toán thống kê
  const attendedCount = logs.length;
  const paidCount = logs.filter(log => log.isPaid).length;
  const freeCount = attendedCount - paidCount;

  if (loading) {
    return (
      <div className="student-dashboard">
        <UserHeader 
          user={user} 
          role="student" 
          handleLogout={onLogout}
        />
        <div className="loading">⏳ Đang tải nhật ký...</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <UserHeader 
        user={user} 
        role="student" 
        handleLogout={onLogout}
      />

      <div className="dashboard-content">
        <h2>📖 Nhật ký học tập của bạn</h2>
        
        <ProgressTracker 
          attendedCount={attendedCount}
          paidCount={paidCount}
          freeCount={freeCount}
          totalSessions={studentInfo?.totalSessions || 30}
        />

        {logs.length === 0 ? (
          <div className="no-logs">
            <p>📝 Chưa có nhật ký học tập nào.</p>
            <p>Giáo viên sẽ cập nhật nhật ký sau mỗi buổi học.</p>
          </div>
        ) : (
          <DiaryHistory
            logs={logs}
            userRole="student"
            // Student không có quyền chỉnh sửa
            editingLog={null}
            editNote=""
            setEditNote={() => {}}
            editAdvantages=""
            setEditAdvantages={() => {}}
            editErrors=""
            setEditErrors={() => {}}
            editHomework=""
            setEditHomework={() => {}}
            editIsPaid={false}
            setEditIsPaid={() => {}}
            startEditing={() => {}}
            saveEdit={() => {}}
            cancelEditing={() => {}}
            deleteLog={() => {}}
          />
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
