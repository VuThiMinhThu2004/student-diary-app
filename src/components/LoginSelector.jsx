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
          ← Quay lại
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
          ← Quay lại
        </button>
        <StudentLogin onLoginSuccess={onLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="login-selector">
      <div className="selector-container">
        <h1>🎓 Hệ thống nhật ký học tập</h1>
        <p className="selector-subtitle">Vui lòng chọn loại tài khoản để đăng nhập</p>
        
        <div className="login-options">
          <div 
            className="login-option teacher-option"
            onClick={() => setLoginType('teacher')}
          >
            <div className="option-icon">👨‍🏫</div>
            <h3>Giáo viên</h3>
            <p>Quản lý học sinh và nhật ký học tập</p>
            <ul>
              <li>✅ Tạo tài khoản học sinh</li>
              <li>✅ Quản lý nhật ký học tập</li>
              <li>✅ Theo dõi tiến độ học</li>
              <li>✅ Quản lý thanh toán</li>
            </ul>
            <button className="btn btn-teacher">Đăng nhập Giáo viên</button>
          </div>

          <div 
            className="login-option student-option"
            onClick={() => setLoginType('student')}
          >
            <div className="option-icon">🎓</div>
            <h3>Học sinh</h3>
            <p>Xem nhật ký và tiến độ học tập</p>
            <ul>
              <li>📖 Xem nhật ký của bản thân</li>
              <li>📊 Theo dõi tiến độ học</li>
              <li>💰 Xem tình trạng thanh toán</li>
              <li>📝 Xem bài tập và ghi chú</li>
            </ul>
            <button className="btn btn-student">Đăng nhập Học sinh</button>
          </div>
        </div>

        <div className="security-note">
          <p>🔒 <strong>Bảo mật:</strong> Mỗi loại tài khoản chỉ có thể truy cập chức năng phù hợp với vai trò</p>
        </div>
      </div>
    </div>
  );
}

export default LoginSelector;
