import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";
import LoginSelector from "./components/LoginSelector";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('App rendering - loading:', loading, 'user:', user, 'userRole:', userRole);

  // Xử lý đăng nhập thành công từ LoginSelector
  const handleLoginSuccess = (user, userData) => {
    setUser(user);
    setUserRole(userData.role);
    setLoading(false);
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  // Theo dõi trạng thái authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Kiểm tra role trong Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(currentUser);
            setUserRole(userData.role);
          } else {
            // User không tồn tại trong Firestore - đăng xuất
            await signOut(auth);
            setUser(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('Lỗi kiểm tra user role:', error);
          setUser(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Loading state
  if (loading) {
    console.log('Showing loading screen');
    return (
      <div className="container">
        <div className="loading-screen">
          <h2>⏳ Đang tải...</h2>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập - hiện LoginSelector
  if (!user || !userRole) {
    console.log('Showing LoginSelector');
    return <LoginSelector onLoginSuccess={handleLoginSuccess} />;
  }

  // Đã đăng nhập - hiện dashboard theo role
  console.log('Showing dashboard for role:', userRole);
  return (
    <div className="container">
      {userRole === 'teacher' && (
        <TeacherDashboard 
          user={user} 
          onLogout={handleLogout}
        />
      )}
      
      {userRole === 'student' && (
        <StudentDashboard 
          user={user} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
