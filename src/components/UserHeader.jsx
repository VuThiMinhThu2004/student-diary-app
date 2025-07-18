import React from 'react';

function UserHeader({ user, handleLogout }) {
  return (
    <div className="user-info">
      <p>Xin chào, <span className="user-email">{user.email}</span></p>
      <button
        onClick={handleLogout}
        className="btn btn-logout"
      >
        Đăng xuất
      </button>
    </div>
  );
}

export default UserHeader;