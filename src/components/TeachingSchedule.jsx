import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const TeachingSchedule = ({ userEmail }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [dailySchedules, setDailySchedules] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    time: '',
    students: '',
    course: ''
  });

  // Load schedules for current month
  const loadMonthSchedules = useCallback(async () => {
    if (!userEmail) return;
    
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const q = query(
        collection(db, 'teachingSchedule'),
        where('teacherEmail', '==', userEmail),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth),
        orderBy('date'),
        orderBy('time')
      );
      
      const querySnapshot = await getDocs(q);
      const scheduleData = [];
      querySnapshot.forEach((doc) => {
        scheduleData.push({ id: doc.id, ...doc.data() });
      });
      
      setSchedules(scheduleData);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  }, [userEmail, currentDate]);

  useEffect(() => {
    loadMonthSchedules();
  }, [loadMonthSchedules]);

  // Load daily schedules when date is selected
  const loadDailySchedules = useCallback(async () => {
    if (!selectedDate || !userEmail) return;
    
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const q = query(
        collection(db, 'teachingSchedule'),
        where('teacherEmail', '==', userEmail),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        orderBy('time')
      );
      
      const querySnapshot = await getDocs(q);
      const dailyData = [];
      querySnapshot.forEach((doc) => {
        dailyData.push({ id: doc.id, ...doc.data() });
      });
      
      setDailySchedules(dailyData);
    } catch (error) {
      console.error('Error loading daily schedules:', error);
    }
  }, [selectedDate, userEmail]);

  useEffect(() => {
    loadDailySchedules();
  }, [loadDailySchedules]);

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  const handleAddSchedule = async () => {
    if (!selectedDate || !newSchedule.time || !newSchedule.students) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const scheduleData = {
        teacherEmail: userEmail,
        date: selectedDate,
        time: newSchedule.time,
        students: newSchedule.students,
        course: newSchedule.course,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'teachingSchedule'), scheduleData);
      
      setNewSchedule({ time: '', students: '', course: '' });
      setShowAddForm(false);
      loadDailySchedules();
      loadMonthSchedules();
      alert('Thêm lịch dạy thành công!');
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Lỗi khi thêm lịch dạy!');
    }
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule.time || !editingSchedule.students) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const scheduleRef = doc(db, 'teachingSchedule', editingSchedule.id);
      await updateDoc(scheduleRef, {
        time: editingSchedule.time,
        students: editingSchedule.students,
        course: editingSchedule.course,
        updatedAt: new Date()
      });

      setEditingSchedule(null);
      loadDailySchedules();
      loadMonthSchedules();
      alert('Cập nhật lịch dạy thành công!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Lỗi khi cập nhật lịch dạy!');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch dạy này?')) return;

    try {
      await deleteDoc(doc(db, 'teachingSchedule', scheduleId));
      loadDailySchedules();
      loadMonthSchedules();
      alert('Xóa lịch dạy thành công!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Lỗi khi xóa lịch dạy!');
    }
  };

  // Calendar rendering functions
  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  };

  const getSchedulesForDay = (day) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return schedules.filter(schedule => {
      const scheduleDate = schedule.date.toDate ? schedule.date.toDate() : new Date(schedule.date);
      return scheduleDate.toDateString() === dayDate.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatStudentsList = (students) => {
    return students.split('\n').filter(s => s.trim()).map((student, index) => 
      `${index + 1}. ${student.trim()}`
    ).join('\n');
  };

  return (
    <div className="teaching-schedule">
      <div className="schedule-header">
        <h2>📅 Lịch Dạy</h2>
        <p className="english-subtitle">Teaching Schedule</p>
      </div>

      {/* Calendar Navigation */}
      <div className="calendar-navigation">
        <button className="btn btn-secondary" onClick={() => navigateMonth(-1)}>
          ← Tháng trước
        </button>
        <h3>
          {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
        </h3>
        <button className="btn btn-secondary" onClick={() => navigateMonth(1)}>
          Tháng sau →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="day-header">CN</div>
            <div className="day-header">T2</div>
            <div className="day-header">T3</div>
            <div className="day-header">T4</div>
            <div className="day-header">T5</div>
            <div className="day-header">T6</div>
            <div className="day-header">T7</div>
          </div>
          
          <div className="calendar-days">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: getFirstDayOfMonth() }, (_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: getDaysInMonth() }, (_, index) => {
              const day = index + 1;
              const daySchedules = getSchedulesForDay(day);
              const isSelected = selectedDate && selectedDate.getDate() === day;
              
              return (
                <div
                  key={day}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${daySchedules.length > 0 ? 'has-schedule' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <span className="day-number">{day}</span>
                  {daySchedules.length > 0 && (
                    <div className="schedule-indicator">
                      {daySchedules.length} lịch
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Schedule View */}
      {selectedDate && (
        <div className="daily-schedule">
          <div className="daily-header">
            <h3>Lịch dạy ngày {formatDate(selectedDate)}</h3>
            <button 
              className="btn btn-add"
              onClick={() => setShowAddForm(true)}
            >
              + Thêm lịch dạy
            </button>
          </div>

          {/* Add Schedule Form */}
          {showAddForm && (
            <div className="schedule-form">
              <h4>Thêm lịch dạy mới</h4>
              <div className="form-row">
                <div>
                  <label>Giờ dạy:</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                  />
                </div>
                <div>
                  <label>Lớp/Khóa học:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSchedule.course}
                    onChange={(e) => setNewSchedule({...newSchedule, course: e.target.value})}
                    placeholder="Ví dụ: Piano cơ bản"
                  />
                </div>
              </div>
              <div>
                <label>Danh sách học sinh (mỗi học sinh một dòng):</label>
                <textarea
                  className="form-input students-textarea"
                  value={newSchedule.students}
                  onChange={(e) => setNewSchedule({...newSchedule, students: e.target.value})}
                  placeholder="Nhập tên học sinh, mỗi học sinh một dòng&#10;Ví dụ:&#10;Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C"
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-add" onClick={handleAddSchedule}>
                  Thêm lịch
                </button>
                <button 
                  className="btn btn-cancel" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSchedule({ time: '', students: '', course: '' });
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Daily Schedule Table */}
          {dailySchedules.length > 0 ? (
            <div className="schedule-table">
              <table>
                <thead>
                  <tr>
                    <th>Thứ/Ngày</th>
                    <th>Giờ dạy</th>
                    <th>Lớp/Khóa học</th>
                    <th>Học sinh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        {selectedDate.toLocaleDateString('vi-VN', { 
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </td>
                      <td>
                        {editingSchedule?.id === schedule.id ? (
                          <input
                            type="time"
                            className="edit-input"
                            value={editingSchedule.time}
                            onChange={(e) => setEditingSchedule({...editingSchedule, time: e.target.value})}
                          />
                        ) : (
                          schedule.time
                        )}
                      </td>
                      <td>
                        {editingSchedule?.id === schedule.id ? (
                          <input
                            type="text"
                            className="edit-input"
                            value={editingSchedule.course}
                            onChange={(e) => setEditingSchedule({...editingSchedule, course: e.target.value})}
                          />
                        ) : (
                          schedule.course
                        )}
                      </td>
                      <td>
                        {editingSchedule?.id === schedule.id ? (
                          <textarea
                            className="edit-textarea"
                            value={editingSchedule.students}
                            onChange={(e) => setEditingSchedule({...editingSchedule, students: e.target.value})}
                            rows="3"
                          />
                        ) : (
                          <div className="students-list">
                            {formatStudentsList(schedule.students)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingSchedule?.id === schedule.id ? (
                            <div className="edit-buttons">
                              <button 
                                className="btn-save"
                                onClick={handleEditSchedule}
                                title="Lưu"
                              >
                                💾
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => setEditingSchedule(null)}
                                title="Hủy"
                              >
                                ❌
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                className="btn-edit"
                                onClick={() => setEditingSchedule({...schedule})}
                                title="Sửa"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-delete"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-schedule">
              <p>Không có lịch dạy nào trong ngày này.</p>
              <p>Nhấn "Thêm lịch dạy" để tạo lịch mới.</p>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="schedule-instruction">
          <p>📍 Chọn một ngày trên lịch để xem và quản lý lịch dạy</p>
          <p>• Những ngày có lịch dạy sẽ hiển thị số lượng lịch</p>
          <p>• Nhấn vào ngày để xem chi tiết và thêm/sửa lịch</p>
        </div>
      )}
    </div>
  );
};

export default TeachingSchedule;
