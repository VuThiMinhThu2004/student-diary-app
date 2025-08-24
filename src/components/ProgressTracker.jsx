import React, { useState } from 'react';

function ProgressTracker({ 
  attendedCount, 
  paidCount, 
  freeCount, 
  totalSessions = 30, 
  tuition = 0, 
  onUpdateCourseInfo,
  canEdit = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editSessions, setEditSessions] = useState(totalSessions.toString());
  const [editTuition, setEditTuition] = useState(tuition.toString());
  
  const progressPercent = totalSessions > 0 ? Math.round((paidCount / totalSessions) * 100) : 0;
  const remaining = Math.max(0, totalSessions - paidCount);

  const handleSave = () => {
    if (onUpdateCourseInfo) {
      onUpdateCourseInfo(parseInt(editSessions) || 30, parseFloat(editTuition) || 0);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditSessions(totalSessions.toString());
    setEditTuition(tuition.toString());
    setIsEditing(false);
  };

  return (
    <div className="progress-section">
      <h2>📈 Tiến độ học tập</h2>
      
      {/* Thông tin số buổi học và học phí */}
      <div className="course-info-section">
        {isEditing ? (
          <div className="edit-course-info">
            <div className="form-row">
              <div>
                <label>Số buổi học:</label>
                <input
                  type="number"
                  className="form-input"
                  value={editSessions}
                  onChange={(e) => setEditSessions(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label>Học phí (VNĐ):</label>
                <input
                  type="number"
                  className="form-input"
                  value={editTuition}
                  onChange={(e) => setEditTuition(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>💾 Lưu</button>
              <button className="btn-cancel" onClick={handleCancel}>❌ Hủy</button>
            </div>
          </div>
        ) : (
          <div className="course-info-display">
            <div className="info-item">
              <strong>Tổng số buổi:</strong> {totalSessions} buổi
            </div>
            <div className="info-item">
              <strong>Học phí:</strong> {tuition.toLocaleString()} VNĐ
            </div>
            {canEdit && (
              <button 
                className="btn btn-edit btn-sm"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Sửa thông tin
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Tiến độ học tập */}
      <div className="progress-item">
        Đã học <strong>{paidCount}/{totalSessions}</strong> buổi —
        Tiến độ: <strong>{progressPercent}%</strong>
      </div>
      <div className="progress-item">
        Còn lại: <strong>{remaining}</strong> buổi
      </div>
      {freeCount > 0 && (
        <div className="progress-item free-sessions">
          Buổi hướng dẫn không tính phí: <strong>{freeCount}</strong> buổi
        </div>
      )}
      <div className="progress-item total-sessions">
        Tổng số buổi đã tham gia: <strong>{attendedCount}</strong> buổi
      </div>
    </div>
  );
}

export default ProgressTracker;