import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import UserHeader from './UserHeader';
import CourseList from './CourseList';

function StudentDashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // Load thông tin cá nhân của học sinh
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Lấy thông tin cá nhân từ users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          // setStudentInfo(userDoc.data()); // Không cần thiết nữa vì CourseList sẽ tự load
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu học sinh:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user.uid, db]);

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
        <CourseList user={user} />
      </div>
    </div>
  );
}

export default StudentDashboard;
