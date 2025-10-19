import React, { useState } from 'react';
import TeacherLogin from './TeacherLogin';
import StudentLogin from './StudentLogin';

function LoginSelector({ onLoginSuccess }) {
  const [loginType, setLoginType] = useState(null); // null, 'teacher', 'student'

  if (loginType === 'teacher') {
    return (
      <div>
        <button 
          className="back-button"
          onClick={() => setLoginType(null)}
        >
          ← Quay lại (Back)
        </button>
        <TeacherLogin onLoginSuccess={onLoginSuccess} />
      </div>
    );
  }

  if (loginType === 'student') {
    return (
      <div>
        <button 
          className="back-button"
          onClick={() => setLoginType(null)}
        >
          ← Quay lại (Back)
        </button>
        <StudentLogin onLoginSuccess={onLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="login-selector">
      <div className="selector-container">
        <h1>🎹 Nhật ký học tập (Study Diary)</h1>
        <p className="english-subtitle">Study Diary</p>
        <p className="selector-subtitle">Vui lòng chọn loại tài khoản để đăng nhập (Please select an account type to log in)</p>
        
        <div className="login-options">
          <div 
            className="login-option teacher-option"
            onClick={() => setLoginType('teacher')}
          >
            <div className="option-icon">👨‍🏫</div>
            <h3>Giáo viên (Teacher)</h3>
            <p>Quản lý học sinh và nhật ký học tập (Manage students and study diaries)</p>
            {/* <ul>
              <li>✅ Tạo tài khoản học sinh</li>
              <li>✅ Quản lý nhật ký học tập</li>
              <li>✅ Theo dõi tiến độ học</li>
              <li>✅ Quản lý thanh toán</li>
            </ul> */}
            <button className="btn btn-teacher">Đăng nhập Giáo viên (Teacher Login)</button>
          </div>

          <div 
            className="login-option student-option"
            onClick={() => setLoginType('student')}
          >
            <div className="option-icon">🎓</div>
            <h3>Học sinh (Student)</h3>
            <p>Xem nhật ký và tiến độ học tập (View diaries and progress)</p>
            {/* <ul>
              <li>📖 Xem nhật ký của bản thân</li>
              <li>📊 Theo dõi tiến độ học</li>
              <li>💰 Xem tình trạng thanh toán</li>
              <li>📝 Xem bài tập và ghi chú</li>
            </ul> */}
            <button className="btn btn-student">Đăng nhập Học sinh (Student Login)</button>
          </div>
        </div>

        <div className="security-note">
          <p>🔒 <strong>Bảo mật (Security):</strong> Mỗi loại tài khoản chỉ có thể truy cập chức năng phù hợp với vai trò (Each account type can only access functions appropriate to its role)</p>
        </div>
      </div>
    </div>
  );
}

export default LoginSelector;
