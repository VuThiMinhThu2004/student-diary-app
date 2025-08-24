import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const TeachingSchedule = ({ userEmail }) => {
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

  // Load schedules for all days
  const loadAllSchedules = useCallback(async () => {
    if (!userEmail) return;
    
    try {
      const q = query(
        collection(db, 'teachingSchedule'),
        where('teacherEmail', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(q);
      const scheduleData = [];
      querySnapshot.forEach((doc) => {
        scheduleData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort in JavaScript instead of Firestore
      scheduleData.sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.time.localeCompare(b.time);
      });
      
      setSchedules(scheduleData);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  }, [userEmail]);

  useEffect(() => {
    loadAllSchedules();
  }, [loadAllSchedules]);

  // Load daily schedules when a date is selected
  const loadDailySchedules = useCallback(async () => {
    if (!userEmail || !selectedDate) {
      setDailySchedules([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'teachingSchedule'),
        where('teacherEmail', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(q);
      const dailyData = [];
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        const scheduleDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
        
        // Filter by selected day of week in JavaScript
        if (scheduleDate.getDay() === getDayIndexFromName(selectedDate.dayName)) {
          dailyData.push(data);
        }
      });
      
      // Sort by time
      dailyData.sort((a, b) => a.time.localeCompare(b.time));
      
      setDailySchedules(dailyData);
    } catch (error) {
      console.error('Error loading daily schedules:', error);
    }
  }, [userEmail, selectedDate]);

  const getDayIndexFromName = (dayName) => {
    const dayMap = {
      'Thứ 2': 1,
      'Thứ 3': 2,
      'Thứ 4': 3,
      'Thứ 5': 4,
      'Thứ 6': 5,
      'Thứ 7': 6,
      'Chủ nhật': 0
    };
    return dayMap[dayName] || 0;
  };

  useEffect(() => {
    loadDailySchedules();
  }, [loadDailySchedules]);

  const handleDateClick = (dayName) => {
    // Tạo date cụ thể cho thứ được chọn trong tuần hiện tại
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    const targetDayIndex = getDayIndexFromName(dayName);
    
    // Tính số ngày cần thêm/bớt để đến thứ được chọn
    let daysToAdd = targetDayIndex - currentDayOfWeek;
    if (daysToAdd < 0) {
      daysToAdd += 7; // Nếu thứ đã qua trong tuần này, lấy tuần sau
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    targetDate.setHours(0, 0, 0, 0);
    
    setSelectedDate({ dayName, date: targetDate });
  };

  const handleAddSchedule = async () => {
    if (!selectedDate || !newSchedule.time || !newSchedule.students) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      await addDoc(collection(db, 'teachingSchedule'), {
        teacherEmail: userEmail,
        date: selectedDate.date, // Sử dụng ngày của thứ đã chọn
        time: newSchedule.time,
        students: newSchedule.students,
        course: newSchedule.course,
        createdAt: new Date()
      });

      setNewSchedule({ time: '', students: '', course: '' });
      setShowAddForm(false);
      loadDailySchedules();
      loadAllSchedules();
      alert('Thêm lịch dạy thành công!');
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Lỗi khi thêm lịch dạy!');
    }
  };

  const handleUpdateSchedule = async (scheduleId, updatedData) => {
    try {
      await updateDoc(doc(db, 'teachingSchedule', scheduleId), updatedData);
      setEditingSchedule(null);
      loadDailySchedules();
      loadAllSchedules();
      alert('Cập nhật lịch dạy thành công!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Lỗi khi cập nhật lịch dạy!');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch dạy này?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'teachingSchedule', scheduleId));
      loadDailySchedules();
      loadAllSchedules();
      alert('Xóa lịch dạy thành công!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Lỗi khi xóa lịch dạy!');
    }
  };

  // Calendar rendering functions
  const getWeekDays = () => {
    return [
      { dayName: 'Thứ 2', dayIndex: 1 },
      { dayName: 'Thứ 3', dayIndex: 2 },
      { dayName: 'Thứ 4', dayIndex: 3 },
      { dayName: 'Thứ 5', dayIndex: 4 },
      { dayName: 'Thứ 6', dayIndex: 5 },
      { dayName: 'Thứ 7', dayIndex: 6 },
      { dayName: 'Chủ nhật', dayIndex: 0 }
    ];
  };

  const getSchedulesForDayIndex = (dayIndex) => {
    return schedules.filter(schedule => {
      const scheduleDate = schedule.date.toDate ? schedule.date.toDate() : new Date(schedule.date);
      const scheduleDayIndex = scheduleDate.getDay();
      return scheduleDayIndex === dayIndex;
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

      {/* Weekly Schedule Header */}
      <div className="calendar-navigation">
        <h3>Lịch tuần</h3>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="calendar-container">
        <div className="weekly-grid">
          {getWeekDays().map((dayInfo, index) => {
            const daySchedules = getSchedulesForDayIndex(dayInfo.dayIndex);
            const isSelected = selectedDate && selectedDate.dayName === dayInfo.dayName;
            
            return (
              <div
                key={index}
                className={`week-day ${isSelected ? 'selected' : ''} ${daySchedules.length > 0 ? 'has-schedule' : ''}`}
                onClick={() => handleDateClick(dayInfo.dayName)}
              >
                <div className="day-header">
                  <div className="day-name">{dayInfo.dayName}</div>
                </div>
                {daySchedules.length > 0 && (
                  <div className="schedule-preview">
                    {daySchedules.slice(0, 2).map((schedule, idx) => (
                      <div key={idx} className="schedule-item">
                        <span className="schedule-time">{schedule.time}</span>
                        <span className="schedule-info">{schedule.students.split('\n')[0]}</span>
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="more-schedules">+{daySchedules.length - 2} lịch khác</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Schedule View */}
      {selectedDate && (
        <div className="daily-schedule">
          <div className="daily-header">
            <h3>Lịch dạy {selectedDate.dayName}</h3>
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
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <label>Khóa học:</label>
                  <input
                    type="text"
                    placeholder="Tên khóa học"
                    value={newSchedule.course}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, course: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label>Học sinh:</label>
                <textarea
                  placeholder="Danh sách học sinh (mỗi học sinh một dòng)"
                  value={newSchedule.students}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, students: e.target.value }))}
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleAddSchedule}>
                  Thêm lịch
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Schedule List */}
          <div className="schedule-list">
            {dailySchedules.length === 0 ? (
              <p>Chưa có lịch dạy nào cho {selectedDate.dayName}.</p>
            ) : (
              dailySchedules.map(schedule => (
                <div key={schedule.id} className="schedule-card">
                  {editingSchedule === schedule.id ? (
                    <div className="edit-schedule-form">
                      <div className="form-row">
                        <div>
                          <label>Giờ dạy:</label>
                          <input
                            type="time"
                            defaultValue={schedule.time}
                            onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label>Khóa học:</label>
                          <input
                            type="text"
                            defaultValue={schedule.course}
                            onChange={(e) => setNewSchedule(prev => ({ ...prev, course: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label>Học sinh:</label>
                        <textarea
                          defaultValue={schedule.students}
                          onChange={(e) => setNewSchedule(prev => ({ ...prev, students: e.target.value }))}
                          rows="4"
                        />
                      </div>
                      <div className="form-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleUpdateSchedule(schedule.id, {
                            time: newSchedule.time || schedule.time,
                            course: newSchedule.course || schedule.course,
                            students: newSchedule.students || schedule.students
                          })}
                        >
                          Cập nhật
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setEditingSchedule(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="schedule-header-card">
                        <div className="schedule-time">{schedule.time}</div>
                        <div className="schedule-course">{schedule.course}</div>
                        <div className="schedule-actions">
                          <button 
                            className="btn btn-edit"
                            onClick={() => setEditingSchedule(schedule.id)}
                          >
                            Sửa
                          </button>
                          <button 
                            className="btn btn-delete"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="schedule-students">
                        <strong>Học sinh:</strong>
                        <pre className="students-list-display">
                          {formatStudentsList(schedule.students)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingSchedule;