import React from 'react';

function LoginForm({ handleLogin }) {
  return (
    <div className="login-container">
      <button
        onClick={handleLogin}
        className="btn btn-login"
      >
        Đăng nhập học sinh
      </button>
    </div>
  );
}

export default LoginForm;