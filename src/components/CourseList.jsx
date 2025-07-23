import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import DiaryHistory from './DiaryHistory';
import ProgressTracker from './ProgressTracker';

function CourseList({ user }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const db = getFirestore();

  // Load danh sách khóa học đã đăng ký
  useEffect(() => {
    const loadEnrolledCourses = async () => {
      try {
        // Lấy thông tin học sinh
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStudentInfo(userData);
          
          // Lấy danh sách khóa học đã đăng ký
          const enrolledCourseIds = userData.enrolledCourses || [];
          
          // Lấy tất cả khóa học có sẵn
          const allCoursesRef = collection(db, 'courses');
          const allCoursesSnapshot = await getDocs(allCoursesRef);
          const allCoursesData = allCoursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAllCourses(allCoursesData);
          
          if (enrolledCourseIds.length > 0) {
            // Lấy thông tin chi tiết của từng khóa học đã đăng ký
            const coursesPromises = enrolledCourseIds.map(async (courseId) => {
              const courseDoc = await getDoc(doc(db, 'courses', courseId));
              if (courseDoc.exists()) {
                return {
                  id: courseDoc.id,
                  ...courseDoc.data()
                };
              }
              return null;
            });
            
            const coursesData = await Promise.all(coursesPromises);
            const validCourses = coursesData.filter(course => course !== null);
            setEnrolledCourses(validCourses);
          } else {
            // Nếu chưa đăng ký khóa học nào, hiển thị tất cả khóa học có sẵn
            setEnrolledCourses([]);
          }
        }
      } catch (error) {
        console.error('Lỗi tải danh sách khóa học:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrolledCourses();
  }, [user.uid, db]);

  // Load nhật ký của khóa học được chọn
  const loadCourseDiary = async (courseId) => {
    setLoadingLogs(true);
    try {
      const logsRef = collection(db, 'students', user.uid, 'courses', courseId, 'diary');
      const snapshot = await getDocs(logsRef);
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      logsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(logsData);
    } catch (error) {
      console.error('Lỗi tải nhật ký khóa học:', error);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    loadCourseDiary(course.id);
  };

  const backToCourseList = () => {
    setSelectedCourse(null);
    setLogs([]);
  };

  if (loading) {
    return (
      <div className="course-list">
        <div className="loading">⏳ Đang tải danh sách khóa học...</div>
      </div>
    );
  }

  // Hiển thị nhật ký của khóa học được chọn
  if (selectedCourse) {
    const attendedCount = logs.length;
    const paidCount = logs.filter(log => log.isPaid).length;
    const freeCount = attendedCount - paidCount;

    return (
      <div className="course-diary">
        <div className="course-header">
          <button 
            className="btn btn-secondary"
            onClick={backToCourseList}
          >
            ← Quay lại danh sách khóa học
          </button>
          <h2>📖 Nhật ký khóa học: {selectedCourse.name}</h2>
          {selectedCourse.description && (
            <p className="course-description">{selectedCourse.description}</p>
          )}
        </div>

        <ProgressTracker 
          attendedCount={attendedCount}
          paidCount={paidCount}
          freeCount={freeCount}
          totalSessions={studentInfo?.totalSessions || 30}
        />

        {loadingLogs ? (
          <div className="loading">⏳ Đang tải nhật ký...</div>
        ) : logs.length === 0 ? (
          <div className="no-logs">
            <p>📝 Chưa có nhật ký học tập nào cho khóa học này.</p>
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
    );
  }

  // Hiển thị danh sách khóa học
  return (
    <div className="course-list">
      <h2>📚 Khóa học</h2>
      
      {enrolledCourses.length === 0 && allCourses.length === 0 ? (
        <div className="no-courses">
          <p>📝 Chưa có khóa học nào trong hệ thống.</p>
          <p>Liên hệ với giáo viên để tạo khóa học.</p>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="no-enrolled-courses">
          <p>📝 Bạn chưa đăng ký khóa học nào.</p>
          <p>Liên hệ với giáo viên để được đăng ký vào các khóa học sau:</p>
          
          <div className="courses-grid">
            {allCourses.map(course => (
              <div key={course.id} className="course-card">
                <h3>{course.name}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="course-meta">
                  <small>Tạo: {new Date(course.createdAt.toDate()).toLocaleDateString('vi-VN')}</small>
                </div>
                <div className="course-action">
                  <span className="not-enrolled-text">⚠️ Chưa đăng ký</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="enrolled-courses">
          <p>✅ Các khóa học bạn đã đăng ký:</p>
          <div className="courses-grid">
            {enrolledCourses.map(course => (
              <div 
                key={course.id} 
                className="course-card clickable"
                onClick={() => selectCourse(course)}
              >
                <h3>{course.name}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="course-meta">
                  <small>Tạo: {new Date(course.createdAt.toDate()).toLocaleDateString('vi-VN')}</small>
                </div>
                <div className="course-action">
                  <span className="view-diary-text">👆 Click để xem nhật ký</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseList;
