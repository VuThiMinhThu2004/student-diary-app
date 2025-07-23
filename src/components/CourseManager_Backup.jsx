import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

function CourseManager({ user }) {
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const db = getFirestore();

  // Load danh sách khóa học
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadCourses = useCallback(async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Chỉ hiển thị khóa học do giáo viên này tạo
      const teacherCourses = coursesData.filter(course => course.teacherId === user.uid);
      setCourses(teacherCourses);
    } catch (error) {
      console.error('Lỗi tải danh sách khóa học:', error);
    }
  }, [db, user.uid]);

  const createCourse = async () => {
    if (!newCourseName.trim()) {
      alert('Vui lòng nhập tên khóa học');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Đang tạo khóa học với user:', user.uid);
      
      const courseData = {
        name: newCourseName.trim(),
        description: newCourseDescription.trim() || '',
        teacherId: user.uid,
        createdAt: new Date()
      };
      
      console.log('Dữ liệu khóa học:', courseData);
      
      const courseRef = await addDoc(collection(db, 'courses'), courseData);
      
      console.log('Tạo khóa học thành công:', courseRef.id);
      
      // Reset form
      setNewCourseName('');
      setNewCourseDescription('');
      setShowCreateForm(false);
      
      // Reload danh sách
      await loadCourses();
      
    } catch (error) {
      console.error('Lỗi tạo khóa học:', error);
      console.error('Error details:', error.code, error.message);
      alert('Lỗi tạo khóa học: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const startEditCourse = (course) => {
    setEditingCourse(course.id);
    setEditCourseName(course.name);
    setEditCourseDescription(course.description || '');
  };

  const saveEditCourse = async () => {
    if (!editCourseName.trim()) {
      alert('Vui lòng nhập tên khóa học');
      return;
    }

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'courses', editingCourse), {
        name: editCourseName.trim(),
        description: editCourseDescription.trim() || '',
        updatedAt: new Date()
      });
      
      setEditingCourse(null);
      setEditCourseName('');
      setEditCourseDescription('');
      await loadCourses();
      
    } catch (error) {
      console.error('Lỗi cập nhật khóa học:', error);
      alert('Lỗi cập nhật khóa học: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteCourse = async (courseId, courseName) => {
    if (!confirm(`Bạn có chắc muốn xóa khóa học "${courseName}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'courses', courseId));
      await loadCourses();
    } catch (error) {
      console.error('Lỗi xóa khóa học:', error);
      alert('Lỗi xóa khóa học: ' + error.message);
    }
  };

  const cancelEditCourse = () => {
    setEditingCourse(null);
    setEditCourseName('');
    setEditCourseDescription('');
  };

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
        {courses.length === 0 ? (
          <div className="no-courses">
            <p>📝 Chưa có khóa học nào.</p>
            <p>Hãy tạo khóa học đầu tiên để bắt đầu quản lý học sinh.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                {editingCourse === course.id ? (
                  <div className="edit-course-form">
                    <div className="form-group">
                      <label>Tên khóa học</label>
                      <input
                        type="text"
                        value={editCourseName}
                        onChange={(e) => setEditCourseName(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Mô tả</label>
                      <textarea
                        value={editCourseDescription}
                        onChange={(e) => setEditCourseDescription(e.target.value)}
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={saveEditCourse}
                        disabled={isUpdating || !editCourseName.trim()}
                      >
                        {isUpdating ? '⏳' : '✅'}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={cancelEditCourse}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4>{course.name}</h4>
                    {course.description && (
                      <p className="course-description">{course.description}</p>
                    )}
                    <div className="course-meta">
                      <small>Tạo: {new Date(course.createdAt.toDate()).toLocaleDateString('vi-VN')}</small>
                    </div>
                    <div className="course-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => startEditCourse(course)}
                      >
                        ✏️ Sửa
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteCourse(course.id, course.name)}
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
    </div>
  );
}

export default CourseManager;
