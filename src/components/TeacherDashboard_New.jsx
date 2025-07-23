import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import UserHeader from './UserHeader';
import DiaryForm from './DiaryForm';
import ProgressTracker from './ProgressTracker';
import DiaryHistory from './DiaryHistory';
import CourseManager from './CourseManager';

function TeacherDashboard({ user, onLogout }) {
  // State cho quản lý tab
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'dashboard', 'courses'
  
  // State cho quản lý học sinh
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState('Nam');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('');
  const [newStudentTotalSessions, setNewStudentTotalSessions] = useState('30');
  const [newStudentTuition, setNewStudentTuition] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // State cho chỉnh sửa thông tin học sinh
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentGender, setEditStudentGender] = useState('Nam');
  const [editStudentBirthDate, setEditStudentBirthDate] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentCourse, setEditStudentCourse] = useState('');
  const [editStudentTotalSessions, setEditStudentTotalSessions] = useState('30');
  const [editStudentTuition, setEditStudentTuition] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State cho quản lý nhật ký
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [note, setNote] = useState('');
  const [advantages, setAdvantages] = useState('');
  const [errors, setErrors] = useState('');
  const [homework, setHomework] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editAdvantages, setEditAdvantages] = useState('');
  const [editErrors, setEditErrors] = useState('');
  const [editHomework, setEditHomework] = useState('');
  const [editIsPaid, setEditIsPaid] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  // Load danh sách học sinh
  const loadStudents = useCallback(async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const studentList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student');
      setStudents(studentList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách học sinh:', error);
    }
  }, [db]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Load nhật ký của học sinh
  const loadStudentLogs = async (studentId) => {
    try {
      const logsRef = collection(db, 'students', studentId, 'diary');
      const snapshot = await getDocs(logsRef);
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      logsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(logsData);
    } catch (error) {
      console.error('Lỗi tải nhật ký:', error);
      setLogs([]);
    }
  };

  // Hàm tạo mã học sinh tự động
  const generateStudentCode = () => {
    const maxCode = students.reduce((max, student) => {
      if (student.studentCode) {
        const num = parseInt(student.studentCode.replace('HS', ''));
        return Math.max(max, num);
      }
      return max;
    }, 0);
    return `HS${String(maxCode + 1).padStart(3, '0')}`;
  };

  // Tạo tài khoản học sinh mới
  const createStudent = async () => {
    if (!newStudentEmail || !newStudentPassword || !newStudentName) {
      alert('Vui lòng điền đầy đủ thông tin email, mật khẩu và họ tên');
      return;
    }

    setIsCreating(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, newStudentEmail, newStudentPassword);
      
      const studentData = {
        email: newStudentEmail,
        role: 'student',
        fullName: newStudentName,
        gender: newStudentGender,
        birthDate: newStudentBirthDate.trim() || null,
        phone: newStudentPhone,
        course: newStudentCourse,
        totalSessions: parseInt(newStudentTotalSessions) || 30,
        tuition: parseInt(newStudentTuition) || 0,
        studentCode: generateStudentCode(),
        enrolledCourses: [], // Mảng rỗng ban đầu
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', newUser.uid), studentData);
      
      // Reset form
      setNewStudentEmail('');
      setNewStudentPassword('');
      setNewStudentName('');
      setNewStudentGender('Nam');
      setNewStudentBirthDate('');
      setNewStudentPhone('');
      setNewStudentCourse('');
      setNewStudentTotalSessions('30');
      setNewStudentTuition('');
      setShowCreateForm(false);
      
      await loadStudents();
      alert('Tạo tài khoản học sinh thành công!');
      
    } catch (error) {
      console.error('Lỗi tạo tài khoản:', error);
      alert('Lỗi tạo tài khoản: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Hàm chỉnh sửa thông tin học sinh
  const startEditStudent = (student) => {
    setEditingStudent(student.id);
    setEditStudentName(student.fullName || '');
    setEditStudentGender(student.gender || 'Nam');
    setEditStudentBirthDate(student.birthDate || '');
    setEditStudentPhone(student.phone || '');
    setEditStudentCourse(student.course || '');
    setEditStudentTotalSessions(student.totalSessions ? student.totalSessions.toString() : '30');
    setEditStudentTuition(student.tuition ? student.tuition.toString() : '');
  };

  const saveEditStudent = async () => {
    if (!editStudentName.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        fullName: editStudentName.trim(),
        gender: editStudentGender,
        birthDate: editStudentBirthDate.trim() || null,
        phone: editStudentPhone.trim(),
        course: editStudentCourse.trim(),
        totalSessions: parseInt(editStudentTotalSessions) || 30,
        tuition: parseInt(editStudentTuition) || 0,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', editingStudent), updateData);
      
      setEditingStudent(null);
      await loadStudents();
      
    } catch (error) {
      console.error('Lỗi cập nhật thông tin học sinh:', error);
      alert('Lỗi cập nhật: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEditStudent = () => {
    setEditingStudent(null);
    setEditStudentName('');
    setEditStudentGender('Nam');
    setEditStudentBirthDate('');
    setEditStudentPhone('');
    setEditStudentCourse('');
    setEditStudentTotalSessions('30');
    setEditStudentTuition('');
  };

  // Xóa học sinh
  const deleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa học sinh "${studentName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', studentId));
      await loadStudents();
      
      if (selectedStudentId === studentId) {
        setSelectedStudentId(null);
        setLogs([]);
      }
    } catch (error) {
      console.error('Lỗi xóa học sinh:', error);
      alert('Lỗi xóa học sinh: ' + error.message);
    }
  };

  // Thêm nhật ký mới
  const addLog = async () => {
    if (!note.trim()) {
      alert('Vui lòng nhập nội dung nhật ký');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, 'students', selectedStudentId, 'diary'), {
        date: today,
        note: note.trim(),
        advantages: advantages.trim(),
        errors: errors.trim(),
        homework: homework.trim(),
        isPaid: isPaid,
        createdAt: new Date()
      });

      setNote('');
      setAdvantages('');
      setErrors('');
      setHomework('');
      setIsPaid(false);
      await loadStudentLogs(selectedStudentId);
    } catch (error) {
      console.error('Lỗi thêm nhật ký:', error);
      alert('Lỗi thêm nhật ký: ' + error.message);
    }
  };

  // Chỉnh sửa nhật ký
  const startEditing = (log) => {
    setEditingLog(log.id);
    setEditNote(log.note || '');
    setEditAdvantages(log.advantages || '');
    setEditErrors(log.errors || '');
    setEditHomework(log.homework || '');
    setEditIsPaid(log.isPaid || false);
  };

  const saveEdit = async () => {
    if (!editNote.trim()) {
      alert('Vui lòng nhập nội dung nhật ký');
      return;
    }

    try {
      await updateDoc(doc(db, 'students', selectedStudentId, 'diary', editingLog), {
        note: editNote.trim(),
        advantages: editAdvantages.trim(),
        errors: editErrors.trim(),
        homework: editHomework.trim(),
        isPaid: editIsPaid,
        updatedAt: new Date()
      });

      setEditingLog(null);
      await loadStudentLogs(selectedStudentId);
    } catch (error) {
      console.error('Lỗi cập nhật nhật ký:', error);
      alert('Lỗi cập nhật: ' + error.message);
    }
  };

  const cancelEditing = () => {
    setEditingLog(null);
    setEditNote('');
    setEditAdvantages('');
    setEditErrors('');
    setEditHomework('');
    setEditIsPaid(false);
  };

  // Xóa nhật ký
  const deleteLog = async (logId) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'students', selectedStudentId, 'diary', logId));
      await loadStudentLogs(selectedStudentId);
    } catch (error) {
      console.error('Lỗi xóa nhật ký:', error);
      alert('Lỗi xóa nhật ký: ' + error.message);
    }
  };

  // Lọc học sinh theo tìm kiếm
  const filteredStudents = students.filter(student =>
    (student.fullName && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.studentCode && student.studentCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Tính toán thống kê
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const attendedCount = logs.length;
  const paidCount = logs.filter(log => log.isPaid).length;
  const freeCount = attendedCount - paidCount;

  return (
    <div className="teacher-dashboard">
      <UserHeader 
        user={user} 
        role="teacher" 
        handleLogout={onLogout}
      />

      <div className="dashboard-content">
        <div className="teacher-navigation">
          <div className="section-header">
            <h3>🎓 Dashboard Giáo viên</h3>
            <div className="header-buttons">
              <button 
                className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('students');
                  setShowCreateForm(false);
                }}
              >
                👥 Quản lý học sinh
              </button>
              <button 
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('dashboard');
                  setShowCreateForm(false);
                }}
              >
                📊 Dashboard tổng quan
              </button>
              <button 
                className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('courses');
                  setShowCreateForm(false);
                }}
              >
                📚 Quản lý khóa học
              </button>
            </div>
          </div>
        </div>

        {/* Tab Quản lý khóa học */}
        {activeTab === 'courses' && (
          <CourseManager user={user} />
        )}

        {/* Tab Dashboard tổng quan */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <div className="dashboard-stats">
              <div className="stats-grid">
                <div className="stat-card students-count">
                  <div className="stat-value">
                    {students.length}
                  </div>
                  <div className="stat-label">Tổng số học sinh</div>
                </div>
                <div className="stat-card revenue">
                  <div className="stat-value">
                    {students.reduce((total, student) => total + (student.tuition || 0), 0).toLocaleString()} VNĐ
                  </div>
                  <div className="stat-label">Tổng doanh thu</div>
                </div>
                <div className="stat-card sessions">
                  <div className="stat-value">
                    {students.reduce((total, student) => total + (student.totalSessions || 0), 0)}
                  </div>
                  <div className="stat-label">Tổng số buổi học</div>
                </div>
              </div>
            </div>

            <div className="dashboard-table">
              <h4>📋 Bảng tổng hợp thông tin học sinh</h4>
              <div className="table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>Mã học sinh</th>
                      <th>Ngày sinh</th>
                      <th>SĐT</th>
                      <th>Khóa</th>
                      <th>Buổi học</th>
                      <th>Học phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.fullName || student.email}</td>
                        <td>{student.studentCode || 'N/A'}</td>
                        <td>{student.birthDate || 'N/A'}</td>
                        <td>{student.phone || 'N/A'}</td>
                        <td>{student.course || 'N/A'}</td>
                        <td>{student.totalSessions || 'N/A'}</td>
                        <td>{student.tuition ? `${student.tuition.toLocaleString()} VNĐ` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Quản lý học sinh */}
        {activeTab === 'students' && (
          <div className="student-management">
            <div className="section-header">
              <h3>👥 Quản lý học sinh</h3>
              <div className="header-buttons">
                <button 
                  className="btn btn-success"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? '❌ Hủy' : '➕ Tạo tài khoản học sinh'}
                </button>
              </div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm học sinh theo tên hoặc mã số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Form tạo tài khoản học sinh */}
            {showCreateForm && (
              <div className="create-student-form">
                <h4>📝 Tạo tài khoản học sinh mới</h4>
                <div className="form-group">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Họ và tên *"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                    />
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value)}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="email"
                      placeholder="Email đăng nhập *"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Mật khẩu *"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Ngày sinh (VD: 01/02/2010 hoặc 01-02-2010)"
                      value={newStudentBirthDate}
                      onChange={(e) => setNewStudentBirthDate(e.target.value)}
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Khóa học"
                      value={newStudentCourse}
                      onChange={(e) => setNewStudentCourse(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Số buổi học"
                      value={newStudentTotalSessions}
                      onChange={(e) => setNewStudentTotalSessions(e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Học phí (VNĐ)"
                      value={newStudentTuition}
                      onChange={(e) => setNewStudentTuition(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="btn btn-success"
                    onClick={createStudent}
                    disabled={isCreating}
                  >
                    {isCreating ? '⏳ Đang tạo...' : '✅ Tạo tài khoản'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Danh sách học sinh */}
            <div className="students-list">
              {filteredStudents.length === 0 ? (
                <div className="no-students">
                  <p>👥 Không tìm thấy học sinh nào.</p>
                </div>
              ) : (
                <div className="students-grid">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="student-card">
                      {editingStudent === student.id ? (
                        <div className="edit-student-form">
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Họ và tên"
                              value={editStudentName}
                              onChange={(e) => setEditStudentName(e.target.value)}
                            />
                            <select
                              value={editStudentGender}
                              onChange={(e) => setEditStudentGender(e.target.value)}
                            >
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Ngày sinh (VD: 01/02/2010)"
                              value={editStudentBirthDate}
                              onChange={(e) => setEditStudentBirthDate(e.target.value)}
                            />
                            <input
                              type="tel"
                              placeholder="SĐT"
                              value={editStudentPhone}
                              onChange={(e) => setEditStudentPhone(e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Khóa học"
                              value={editStudentCourse}
                              onChange={(e) => setEditStudentCourse(e.target.value)}
                            />
                            <input
                              type="number"
                              placeholder="Số buổi"
                              value={editStudentTotalSessions}
                              onChange={(e) => setEditStudentTotalSessions(e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <input
                              type="number"
                              placeholder="Học phí"
                              value={editStudentTuition}
                              onChange={(e) => setEditStudentTuition(e.target.value)}
                            />
                          </div>
                          
                          <div className="form-actions">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={saveEditStudent}
                              disabled={isUpdating}
                            >
                              {isUpdating ? '⏳' : '✅'}
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={cancelEditStudent}
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4>{student.fullName || student.email}</h4>
                          <p><strong>Mã:</strong> {student.studentCode || 'N/A'}</p>
                          <p><strong>Email:</strong> {student.email}</p>
                          <p><strong>Ngày sinh:</strong> {student.birthDate || 'N/A'}</p>
                          <p><strong>SĐT:</strong> {student.phone || 'N/A'}</p>
                          <p><strong>Khóa:</strong> {student.course || 'N/A'}</p>
                          <p><strong>Buổi học:</strong> {student.totalSessions || 'N/A'}</p>
                          <p><strong>Học phí:</strong> {student.tuition ? `${student.tuition.toLocaleString()} VNĐ` : 'N/A'}</p>
                          
                          <div className="student-actions">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                loadStudentLogs(student.id);
                              }}
                            >
                              📖 Xem nhật ký
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => startEditStudent(student)}
                            >
                              ✏️ Sửa
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteStudent(student.id, student.fullName || student.email)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hiển thị nhật ký của học sinh được chọn */}
            {selectedStudentId && selectedStudent && (
              <div className="student-diary-section">
                <h3>📖 Nhật ký học tập - {selectedStudent.fullName || selectedStudent.email}</h3>
                
                <ProgressTracker 
                  attendedCount={attendedCount}
                  paidCount={paidCount}
                  freeCount={freeCount}
                  totalSessions={selectedStudent.totalSessions || 30}
                />

                <DiaryForm
                  note={note}
                  setNote={setNote}
                  advantages={advantages}
                  setAdvantages={setAdvantages}
                  errors={errors}
                  setErrors={setErrors}
                  homework={homework}
                  setHomework={setHomework}
                  isPaid={isPaid}
                  setIsPaid={setIsPaid}
                  addLog={addLog}
                />

                <DiaryHistory
                  logs={logs}
                  userRole="teacher"
                  editingLog={editingLog}
                  editNote={editNote}
                  setEditNote={setEditNote}
                  editAdvantages={editAdvantages}
                  setEditAdvantages={setEditAdvantages}
                  editErrors={editErrors}
                  setEditErrors={setEditErrors}
                  editHomework={editHomework}
                  setEditHomework={setEditHomework}
                  editIsPaid={editIsPaid}
                  setEditIsPaid={setEditIsPaid}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  cancelEditing={cancelEditing}
                  deleteLog={deleteLog}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
