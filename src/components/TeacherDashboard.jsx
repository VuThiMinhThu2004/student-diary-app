import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import UserHeader from './UserHeader';
import DiaryForm from './DiaryForm';
import ProgressTracker from './ProgressTracker';
import DiaryHistory from './DiaryHistory';

function TeacherDashboard({ user, onLogout }) {
  // State cho quản lý học sinh
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState('Nam');
  const [newStudentBirthYear, setNewStudentBirthYear] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('');
  const [newStudentTotalSessions, setNewStudentTotalSessions] = useState('30');
  const [newStudentTuition, setNewStudentTuition] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // State cho chỉnh sửa thông tin học sinh
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentGender, setEditStudentGender] = useState('Nam');
  const [editStudentBirthYear, setEditStudentBirthYear] = useState('');
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

  // Hàm xử lý chọn học sinh
  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    loadStudentLogs(studentId);
  };

  // Hàm xem nhật ký học sinh
  const viewStudentDiary = (studentId) => {
    setSelectedStudentId(studentId);
    loadStudentLogs(studentId);
  };

  // Hàm xóa học sinh
  const deleteStudent = async (studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', studentId));
      setStudents(students.filter(s => s.id !== studentId));
      
      if (selectedStudentId === studentId) {
        setSelectedStudentId(null);
      }

      console.log('Đã xóa học sinh thành công');
    } catch (error) {
      console.error('Lỗi khi xóa học sinh:', error);
      alert('Có lỗi xảy ra khi xóa học sinh: ' + error.message);
    }
  };

  // Bắt đầu chỉnh sửa thông tin học sinh
  const startEditingStudent = (student) => {
    setEditingStudent(student);
    setEditStudentName(student.fullName || '');
    setEditStudentGender(student.gender || 'Nam');
    setEditStudentBirthYear(student.birthYear ? student.birthYear.toString() : '');
    setEditStudentPhone(student.phone || '');
    setEditStudentCourse(student.course || '');
    setEditStudentTotalSessions(student.totalSessions ? student.totalSessions.toString() : '30');
    setEditStudentTuition(student.tuition ? student.tuition.toString() : '');
  };

  // Hủy chỉnh sửa thông tin học sinh
  const cancelEditingStudent = () => {
    setEditingStudent(null);
    setEditStudentName('');
    setEditStudentGender('Nam');
    setEditStudentBirthYear('');
    setEditStudentPhone('');
    setEditStudentCourse('');
    setEditStudentTotalSessions('30');
    setEditStudentTuition('');
  };

  // Lưu thông tin học sinh đã chỉnh sửa
  const saveStudentEdit = async () => {
    if (!editStudentName.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    setIsUpdating(true);

    try {
      const studentRef = doc(db, 'users', editingStudent.id);
      await updateDoc(studentRef, {
        fullName: editStudentName.trim(),
        gender: editStudentGender,
        birthYear: parseInt(editStudentBirthYear) || null,
        phone: editStudentPhone.trim(),
        course: editStudentCourse.trim(),
        totalSessions: parseInt(editStudentTotalSessions) || 30,
        tuition: parseInt(editStudentTuition) || null,
        updatedAt: new Date()
      });

      // Cập nhật danh sách học sinh
      setStudents(students.map(student => 
        student.id === editingStudent.id 
          ? {
              ...student,
              fullName: editStudentName.trim(),
              gender: editStudentGender,
              birthYear: parseInt(editStudentBirthYear) || null,
              phone: editStudentPhone.trim(),
              course: editStudentCourse.trim(),
              totalSessions: parseInt(editStudentTotalSessions) || 30,
              tuition: parseInt(editStudentTuition) || null
            }
          : student
      ));

      cancelEditingStudent();
      alert('Cập nhật thông tin học sinh thành công!');

    } catch (error) {
      console.error('Lỗi cập nhật thông tin học sinh:', error);
      alert('Có lỗi xảy ra khi cập nhật: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Tạo tài khoản học sinh
  const createStudentAccount = async () => {
    if (!newStudentEmail.trim() || !newStudentPassword.trim() || !newStudentName.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc (Email, Mật khẩu, Họ tên)');
      return;
    }

    if (newStudentPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsCreating(true);

    try {
      // Tạo tài khoản Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newStudentEmail, newStudentPassword);
      const newUser = userCredential.user;

      // Tạo mã học sinh tự động
      const studentCount = students.length + 1;
      const studentCode = `HS${studentCount.toString().padStart(3, '0')}`;

      // Lưu thông tin user vào Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newStudentEmail,
        role: 'student',
        fullName: newStudentName,
        gender: newStudentGender,
        birthYear: parseInt(newStudentBirthYear) || null,
        phone: newStudentPhone,
        course: newStudentCourse,
        totalSessions: parseInt(newStudentTotalSessions) || 30,
        tuition: parseInt(newStudentTuition) || null,
        studentCode: studentCode,
        createdAt: new Date()
      });

      // Reset form
      setNewStudentEmail('');
      setNewStudentPassword('');
      setNewStudentName('');
      setNewStudentGender('Nam');
      setNewStudentBirthYear('');
      setNewStudentPhone('');
      setNewStudentCourse('');
      setNewStudentTotalSessions('30');
      setNewStudentTuition('');
      setShowCreateForm(false);

      // Reload danh sách học sinh
      loadStudents();

      alert(`Tạo tài khoản thành công!\nMã học sinh: ${studentCode}\nEmail: ${newStudentEmail}`);

    } catch (error) {
      console.error('Lỗi tạo tài khoản:', error);
      alert('Lỗi tạo tài khoản: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

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

  // Thêm nhật ký mới
  const addLog = async () => {
    if (!selectedStudentId) {
      alert('Vui lòng chọn học sinh');
      return;
    }

    if (!note.trim()) {
      alert('Vui lòng nhập ghi chú');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const logsRef = collection(db, 'students', selectedStudentId, 'diary');
      
      await addDoc(logsRef, {
        date: today,
        note: note.trim(),
        advantages: advantages.trim(),
        errors: errors.trim(),
        homework: homework.trim(),
        isPaid,
        createdAt: new Date()
      });

      // Reset form
      setNote('');
      setAdvantages('');
      setErrors('');
      setHomework('');
      setIsPaid(false);

      // Reload logs
      loadStudentLogs(selectedStudentId);

      alert('Đã thêm nhật ký thành công!');

    } catch (error) {
      console.error('Lỗi thêm nhật ký:', error);
      alert('Lỗi thêm nhật ký: ' + error.message);
    }
  };

  // Bắt đầu chỉnh sửa
  const startEditing = (log) => {
    setEditingLog(log);
    setEditNote(log.note);
    setEditAdvantages(log.advantages);
    setEditErrors(log.errors);
    setEditHomework(log.homework);
    setEditIsPaid(log.isPaid);
  };

  // Lưu chỉnh sửa
  const saveEdit = async () => {
    if (!editingLog) return;

    try {
      const logRef = doc(db, 'students', selectedStudentId, 'diary', editingLog.id);
      await updateDoc(logRef, {
        note: editNote.trim(),
        advantages: editAdvantages.trim(),
        errors: editErrors.trim(),
        homework: editHomework.trim(),
        isPaid: editIsPaid,
        updatedAt: new Date()
      });

      setEditingLog(null);
      loadStudentLogs(selectedStudentId);
      alert('Cập nhật thành công!');

    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Lỗi cập nhật: ' + error.message);
    }
  };

  // Hủy chỉnh sửa
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'students', selectedStudentId, 'diary', logId));
      loadStudentLogs(selectedStudentId);
      alert('Đã xóa nhật ký!');
    } catch (error) {
      console.error('Lỗi xóa nhật ký:', error);
      alert('Lỗi xóa nhật ký: ' + error.message);
    }
  };

  // Lọc học sinh theo tìm kiếm
  const filteredStudents = students.filter(student =>
    (student.fullName || student.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentCode && student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="student-management">
          <div className="section-header">
            <h3>👥 Quản lý học sinh</h3>
            <div className="header-buttons">
              <button 
                className={`btn ${showDashboard ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setShowDashboard(false)}
              >
                👥 Danh sách học sinh
              </button>
              <button 
                className={`btn ${showDashboard ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowDashboard(true)}
              >
                📊 Dashboard tổng quan
              </button>
              {!showDashboard && (
                <button 
                  className="btn btn-success"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? '❌ Hủy' : '➕ Tạo tài khoản học sinh'}
                </button>
              )}
            </div>
          </div>

          {/* Thanh tìm kiếm */}
          {!showDashboard && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm học sinh theo tên hoặc mã số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          {/* Dashboard tổng quan */}
          {showDashboard && (
            <div className="dashboard-overview">
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-number">{students.length}</div>
                    <div className="stat-label">Tổng số học sinh</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {students.reduce((total, student) => total + (student.tuition || 0), 0).toLocaleString()} VNĐ
                    </div>
                    <div className="stat-label">Tổng học phí thu được</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-content">
                    <div className="stat-number">
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
                        <th>Năm sinh</th>
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
                          <td>{student.birthYear || 'N/A'}</td>
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

          {/* Form tạo tài khoản học sinh */}
          {showCreateForm && !showDashboard && (
            <div className="create-student-form">
              <h4>📝 Tạo tài khoản học sinh mới</h4>
              <div className="form-group">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Họ và tên *"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="form-input"
                  />
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value)}
                    className="form-input"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Email học sinh *"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu (tối thiểu 6 ký tự) *"
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Năm sinh"
                    value={newStudentBirthYear}
                    onChange={(e) => setNewStudentBirthYear(e.target.value)}
                    className="form-input"
                    min="1950"
                    max="2010"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Khóa học"
                    value={newStudentCourse}
                    onChange={(e) => setNewStudentCourse(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="number"
                    placeholder="Số buổi học"
                    value={newStudentTotalSessions}
                    onChange={(e) => setNewStudentTotalSessions(e.target.value)}
                    className="form-input"
                    min="1"
                    max="100"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Học phí (VNĐ)"
                    value={newStudentTuition}
                    onChange={(e) => setNewStudentTuition(e.target.value)}
                    className="form-input"
                    min="0"
                  />
                  <div className="form-input-placeholder"></div>
                </div>
                <button 
                  className="btn btn-save"
                  onClick={createStudentAccount}
                  disabled={isCreating}
                >
                  {isCreating ? '⏳ Đang tạo...' : '✅ Tạo tài khoản'}
                </button>
              </div>
            </div>
          )}

          {/* Form chỉnh sửa thông tin học sinh */}
          {editingStudent && !showDashboard && (
            <div className="edit-student-form">
              <h4>✏️ Chỉnh sửa thông tin học sinh</h4>
              <div className="form-group">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Họ và tên *"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="form-input"
                  />
                  <select
                    value={editStudentGender}
                    onChange={(e) => setEditStudentGender(e.target.value)}
                    className="form-input"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Năm sinh"
                    value={editStudentBirthYear}
                    onChange={(e) => setEditStudentBirthYear(e.target.value)}
                    className="form-input"
                    min="1950"
                    max="2010"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Khóa học"
                    value={editStudentCourse}
                    onChange={(e) => setEditStudentCourse(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="number"
                    placeholder="Số buổi học"
                    value={editStudentTotalSessions}
                    onChange={(e) => setEditStudentTotalSessions(e.target.value)}
                    className="form-input"
                    min="1"
                    max="100"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Học phí (VNĐ)"
                    value={editStudentTuition}
                    onChange={(e) => setEditStudentTuition(e.target.value)}
                    className="form-input"
                    min="0"
                  />
                  <div className="form-input-placeholder"></div>
                </div>
                <div className="form-actions">
                  <button 
                    className="btn btn-save"
                    onClick={saveStudentEdit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? '⏳ Đang cập nhật...' : '✅ Lưu thay đổi'}
                  </button>
                  <button 
                    className="btn btn-cancel"
                    onClick={cancelEditingStudent}
                    disabled={isUpdating}
                  >
                    ❌ Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách học sinh */}
          {!showDashboard && (
            <>
              {filteredStudents.length === 0 ? (
            <div className="no-students">
              <p>Không tìm thấy học sinh nào.</p>
            </div>
          ) : (
            <div className="student-grid">
              {filteredStudents.map(student => (
                <div 
                  key={student.id}
                  className={`student-card ${selectedStudentId === student.id ? 'selected' : ''}`}
                  onClick={() => handleSelectStudent(student.id)}
                >
                  <div className="student-header">
                    <div className="student-name">{student.fullName || student.email}</div>
                  </div>
                  <div className="student-details">
                    <div className="student-email">{student.email}</div>
                    {student.studentCode && <div className="student-code">Mã học sinh: {student.studentCode}</div>}
                    {student.gender && <div className="student-gender">Giới tính: {student.gender}</div>}
                    {student.birthYear && <div className="student-birth">Năm sinh: {student.birthYear}</div>}
                    {student.phone && <div className="student-phone">SĐT: {student.phone}</div>}
                    {student.course && <div className="student-course">Khóa: {student.course}</div>}
                    {student.totalSessions && <div className="student-sessions">Buổi học: {student.totalSessions}</div>}
                    {student.tuition && <div className="student-tuition">Học phí: {student.tuition.toLocaleString()} VNĐ</div>}
                  </div>
                  <div className="student-actions">
                    <button 
                      className="btn btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewStudentDiary(student.id);
                      }}
                    >
                      📖 Xem nhật ký
                    </button>
                    <button 
                      className="btn btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingStudent(student);
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStudent(student.id);
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
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
    </div>
  );
}

export default TeacherDashboard;
