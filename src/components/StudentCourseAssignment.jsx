import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

function StudentCourseAssignment({ user }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const db = getFirestore();

  // Load danh sách học sinh và khóa học
  const loadData = useCallback(async () => {
    try {
      // Load học sinh
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const studentList = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student');
      setStudents(studentList);

      // Load khóa học của giáo viên này
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesList = coursesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(course => course.teacherId === user.uid);
      setCourses(coursesList);
      
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [db, user.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Thêm học sinh vào khóa học
  const enrollStudentToCourse = async (studentId, courseId) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', studentId), {
        enrolledCourses: arrayUnion(courseId)
      });
      
      // Reload data
      await loadData();
      alert('Đăng ký học sinh vào khóa học thành công!');
      
    } catch (error) {
      console.error('Lỗi đăng ký khóa học:', error);
      alert('Lỗi: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Xóa học sinh khỏi khóa học
  const unenrollStudentFromCourse = async (studentId, courseId) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', studentId), {
        enrolledCourses: arrayRemove(courseId)
      });
      
      // Reload data
      await loadData();
      alert('Hủy đăng ký khóa học thành công!');
      
    } catch (error) {
      console.error('Lỗi hủy đăng ký:', error);
      alert('Lỗi: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="course-assignment">
        <div className="loading">⏳ Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="course-assignment">
        <div className="no-courses">
          <h3>📚 Đăng ký học sinh vào khóa học</h3>
          <p>⚠️ Bạn chưa tạo khóa học nào.</p>
          <p>Hãy tạo khóa học trước khi đăng ký học sinh.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-assignment">
      <h3>📚 Đăng ký học sinh vào khóa học</h3>
      
      <div className="assignment-content">
        {/* Danh sách học sinh */}
        <div className="students-section">
          <h4>👥 Danh sách học sinh</h4>
          {students.length === 0 ? (
            <p>Chưa có học sinh nào trong hệ thống.</p>
          ) : (
            <div className="students-list">
              {students.map(student => (
                <div 
                  key={student.id} 
                  className={`student-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-info">
                    <strong>{student.fullName || student.email}</strong>
                    <small>{student.email}</small>
                  </div>
                  <div className="enrolled-count">
                    {(student.enrolledCourses || []).length} khóa học
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chi tiết đăng ký của học sinh được chọn */}
        {selectedStudent && (
          <div className="course-enrollment">
            <h4>📖 Khóa học của {selectedStudent.fullName || selectedStudent.email}</h4>
            
            <div className="courses-grid">
              {courses.map(course => {
                const isEnrolled = (selectedStudent.enrolledCourses || []).includes(course.id);
                
                return (
                  <div key={course.id} className="course-enrollment-card">
                    <div className="course-info">
                      <h5>{course.name}</h5>
                      {course.description && (
                        <p className="course-description">{course.description}</p>
                      )}
                    </div>
                    
                    <div className="enrollment-action">
                      {isEnrolled ? (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => unenrollStudentFromCourse(selectedStudent.id, course.id)}
                          disabled={updating}
                        >
                          {updating ? '⏳' : '❌ Hủy đăng ký'}
                        </button>
                      ) : (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => enrollStudentToCourse(selectedStudent.id, course.id)}
                          disabled={updating}
                        >
                          {updating ? '⏳' : '✅ Đăng ký'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCourseAssignment;
