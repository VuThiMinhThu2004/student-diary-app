import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function StudentLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Đăng nhập Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kiểm tra role trong Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Tài khoản không tồn tại trong hệ thống');
      }

      const userData = userDoc.data();
      
      // Chỉ cho phép role student đăng nhập
      if (userData.role !== 'student') {
        // Đăng xuất ngay lập tức nếu không phải student
        await auth.signOut();
        throw new Error('Tài khoản này không có quyền truy cập hệ thống học sinh');
      }

      // Đăng nhập thành công
      onLoginSuccess(user, userData);
      
    } catch (error) {
      console.error('Lỗi đăng nhập student:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>📚 Đăng nhập Học sinh</h2>
        <p className="login-subtitle">Xem nhật ký học tập của bạn</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email học sinh:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-login"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Đang đăng nhập...' : '🔑 Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>📖 Học sinh chỉ có quyền xem nhật ký của mình</p>
          <p>👨‍🏫 Tài khoản được tạo bởi giáo viên</p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
