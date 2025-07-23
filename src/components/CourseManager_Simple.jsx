import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

function CourseManager({ user }) {
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const db = getFirestore();

  // Load danh sách khóa học
  useEffect(() => {
    loadCourses();
  }, [user.uid]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      console.log('Loading courses for user:', user.uid);
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('All courses:', coursesData);
      
      // Chỉ hiển thị khóa học do giáo viên này tạo
      const teacherCourses = coursesData.filter(course => course.teacherId === user.uid);
      console.log('Teacher courses:', teacherCourses);
      setCourses(teacherCourses);
    } catch (error) {
      console.error('Lỗi tải danh sách khóa học:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!newCourseName.trim()) {
      alert('Vui lòng nhập tên khóa học');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating course with user:', user.uid);
      
      const courseData = {
        name: newCourseName.trim(),
        description: newCourseDescription.trim() || '',
        teacherId: user.uid,
        createdAt: new Date()
      };
      
      console.log('Course data:', courseData);
      
      const courseRef = await addDoc(collection(db, 'courses'), courseData);
      
      console.log('Course created successfully:', courseRef.id);
      alert('Tạo khóa học thành công!');
      
      // Reset form
      setNewCourseName('');
      setNewCourseDescription('');
      setShowCreateForm(false);
      
      // Reload danh sách
      await loadCourses();
      
    } catch (error) {
      console.error('Error creating course:', error);
      console.error('Error details:', error.code, error.message);
      alert('Lỗi tạo khóa học: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="course-manager">
        <div className="loading">⏳ Đang tải danh sách khóa học...</div>
      </div>
    );
  }

  return (
    <div className="course-manager">
      <div className="section-header">
        <h3>📚 Quản lý khóa học</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '❌ Hủy' : '➕ Tạo khóa học mới'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-course-form">
          <h4>Tạo khóa học mới</h4>
          <div className="form-group">
            <label>Tên khóa học *</label>
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="VD: Piano cơ bản, Guitar nâng cao..."
              maxLength={100}
            />
          </div>
          
          <div className="form-group">
            <label>Mô tả khóa học</label>
            <textarea
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              placeholder="Mô tả chi tiết về khóa học..."
              rows={3}
              maxLength={500}
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="btn btn-success"
              onClick={createCourse}
              disabled={isCreating || !newCourseName.trim()}
            >
              {isCreating ? '⏳ Đang tạo...' : '✅ Tạo khóa học'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setNewCourseName('');
                setNewCourseDescription('');
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="courses-list">
        <h4>Danh sách khóa học ({courses.length})</h4>
        {courses.length === 0 ? (
          <div className="no-courses">
            <p>📝 Chưa có khóa học nào.</p>
            <p>Hãy tạo khóa học đầu tiên để bắt đầu quản lý học sinh.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <h4>{course.name}</h4>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="course-meta">
                  <small>
                    Tạo: {course.createdAt && course.createdAt.toDate ? 
                      new Date(course.createdAt.toDate()).toLocaleDateString('vi-VN') : 
                      'N/A'
                    }
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseManager;
