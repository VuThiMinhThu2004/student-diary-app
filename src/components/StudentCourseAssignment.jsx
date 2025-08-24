import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, addDoc, query, where, deleteDoc } from 'firebase/firestore';

function StudentCourseAssignment({ user }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // State cho form đăng ký
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [totalSessions, setTotalSessions] = useState('30');
  const [tuition, setTuition] = useState('');
  
  // State cho form chỉnh sửa
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [editTotalSessions, setEditTotalSessions] = useState('');
  const [editTuition, setEditTuition] = useState('');
  
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
      
      // Load thông tin đăng ký khóa học của học sinh (studentCourses)
      const studentCoursesRef = collection(db, 'studentCourses');
      const studentCoursesSnapshot = await getDocs(studentCoursesRef);
      const studentCoursesList = studentCoursesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setStudentCourses(studentCoursesList);
      
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [db, user.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Thêm học sinh vào khóa học với thông tin số buổi và học phí
  const enrollStudentToCourse = async (studentId, courseId, sessionsCount, tuitionAmount) => {
    setUpdating(true);
    try {
      // Thêm vào collection studentCourses
      await addDoc(collection(db, 'studentCourses'), {
        studentId: studentId,
        courseId: courseId,
        totalSessions: parseInt(sessionsCount) || 30,
        tuition: parseFloat(tuitionAmount) || 0,
        enrolledAt: new Date(),
        teacherId: user.uid
      });
      
      // Cập nhật danh sách khóa học của học sinh
      await updateDoc(doc(db, 'users', studentId), {
        enrolledCourses: arrayUnion(courseId)
      });
      
      // Reset form và reload data
      setShowEnrollForm(false);
      setEnrollingCourse(null);
      setTotalSessions('30');
      setTuition('');
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
      // Tìm và xóa bản ghi trong studentCourses
      const q = query(
        collection(db, 'studentCourses'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'studentCourses', docSnap.id));
      });
      
      // Cập nhật danh sách khóa học của học sinh
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

  // Cập nhật thông tin số buổi và học phí
  const updateEnrollmentInfo = async (enrollmentId, sessionsCount, tuitionAmount) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'studentCourses', enrollmentId), {
        totalSessions: parseInt(sessionsCount) || 30,
        tuition: parseFloat(tuitionAmount) || 0,
        updatedAt: new Date()
      });
      
      setEditingEnrollment(null);
      setEditTotalSessions('');
      setEditTuition('');
      await loadData();
      alert('Cập nhật thông tin thành công!');
      
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Lỗi: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Lấy thông tin đăng ký của học sinh trong khóa học cụ thể
  const getStudentCourseInfo = (studentId, courseId) => {
    return studentCourses.find(sc => 
      sc.studentId === studentId && sc.courseId === courseId
    );
  };

  // Hiển thị form đăng ký
  const showEnrollmentForm = (courseId) => {
    setEnrollingCourse(courseId);
    setShowEnrollForm(true);
    setTotalSessions('30');
    setTuition('');
  };

  // Hiển thị form chỉnh sửa
  const showEditForm = (enrollment) => {
    setEditingEnrollment(enrollment.id);
    setEditTotalSessions(enrollment.totalSessions.toString());
    setEditTuition(enrollment.tuition.toString());
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
            
            {/* Form đăng ký khóa học */}
            {showEnrollForm && enrollingCourse && (
              <div className="enrollment-form">
                <h5>📝 Đăng ký khóa học</h5>
                <div className="form-group">
                  <div className="form-row">
                    <div>
                      <label>Số buổi học:</label>
                      <input
                        type="number"
                        className="form-input"
                        value={totalSessions}
                        onChange={(e) => setTotalSessions(e.target.value)}
                        placeholder="30"
                        min="1"
                      />
                    </div>
                    <div>
                      <label>Học phí (VNĐ):</label>
                      <input
                        type="number"
                        className="form-input"
                        value={tuition}
                        onChange={(e) => setTuition(e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => enrollStudentToCourse(selectedStudent.id, enrollingCourse, totalSessions, tuition)}
                      disabled={updating}
                    >
                      {updating ? '⏳ Đang xử lý...' : '✅ Xác nhận đăng ký'}
                    </button>
                    <button 
                      className="btn btn-cancel"
                      onClick={() => {
                        setShowEnrollForm(false);
                        setEnrollingCourse(null);
                      }}
                    >
                      ❌ Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="courses-grid">
              {courses.map(course => {
                const isEnrolled = (selectedStudent.enrolledCourses || []).includes(course.id);
                const enrollmentInfo = getStudentCourseInfo(selectedStudent.id, course.id);
                
                return (
                  <div key={course.id} className="course-enrollment-card">
                    <div className="course-info">
                      <h5>{course.name}</h5>
                      {course.description && (
                        <p className="course-description">{course.description}</p>
                      )}
                      
                      {/* Hiển thị thông tin đăng ký */}
                      {isEnrolled && enrollmentInfo && (
                        <div className="enrollment-details">
                          {editingEnrollment === enrollmentInfo.id ? (
                            <div className="edit-enrollment-form">
                              <div className="form-row">
                                <div>
                                  <label>Số buổi:</label>
                                  <input
                                    type="number"
                                    className="form-input"
                                    value={editTotalSessions}
                                    onChange={(e) => setEditTotalSessions(e.target.value)}
                                    min="1"
                                  />
                                </div>
                                <div>
                                  <label>Học phí:</label>
                                  <input
                                    type="number"
                                    className="form-input"
                                    value={editTuition}
                                    onChange={(e) => setEditTuition(e.target.value)}
                                    min="0"
                                  />
                                </div>
                              </div>
                              <div className="edit-actions">
                                <button 
                                  className="btn-save"
                                  onClick={() => updateEnrollmentInfo(enrollmentInfo.id, editTotalSessions, editTuition)}
                                  disabled={updating}
                                >
                                  💾
                                </button>
                                <button 
                                  className="btn-cancel"
                                  onClick={() => setEditingEnrollment(null)}
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="enrollment-info">
                              <p><strong>Số buổi:</strong> {enrollmentInfo.totalSessions} buổi</p>
                              <p><strong>Học phí:</strong> {enrollmentInfo.tuition.toLocaleString()} VNĐ</p>
                              <button 
                                className="btn btn-edit btn-sm"
                                onClick={() => showEditForm(enrollmentInfo)}
                              >
                                ✏️ Sửa
                              </button>
                            </div>
                          )}
                        </div>
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
                          onClick={() => showEnrollmentForm(course.id)}
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
