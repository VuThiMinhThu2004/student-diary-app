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
      <h2>📈 Tiến độ học tập (Learning Progress)</h2>
      
      {/* Thông tin số buổi học và học phí */}
      <div className="course-info-section">
        {isEditing ? (
          <div className="edit-course-info">
            <div className="form-row">
              <div>
                <label>Số buổi học (Total Sessions):</label>
                <input
                  type="number"
                  className="form-input"
                  value={editSessions}
                  onChange={(e) => setEditSessions(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label>Học phí (Tuition Fee) (VNĐ):</label>
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
              <button className="btn-save" onClick={handleSave}>💾 Lưu (Save)</button>
              <button className="btn-cancel" onClick={handleCancel}>❌ Hủy (Cancel)</button>
            </div>
          </div>
        ) : (
          <div className="course-info-display">
            <div className="info-item">
              <strong>Tổng số buổi (Total Sessions):</strong> {totalSessions} buổi
            </div>
            <div className="info-item">
              <strong>Học phí (Tuition Fee):</strong> {tuition.toLocaleString()} VNĐ
            </div>
            {canEdit && (
              <button 
                className="btn btn-edit btn-sm"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Sửa thông tin (Edit Information)
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Tiến độ học tập */}
      <div className="progress-item">
        Đã học (Completed) <strong>{paidCount}/{totalSessions}</strong> buổi —
        Tiến độ (Progress): <strong>{progressPercent}%</strong>
      </div>
      <div className="progress-item">
        Còn lại (Remaining): <strong>{remaining}</strong> buổi
      </div>
      {freeCount > 0 && (
        <div className="progress-item free-sessions">
          Buổi hướng dẫn không tính phí (Free Sessions): <strong>{freeCount}</strong> buổi
        </div>
      )}
      <div className="progress-item total-sessions">
        Tổng số buổi đã tham gia (Total Attended Sessions): <strong>{attendedCount}</strong> buổi
      </div>
    </div>
  );
}

export default ProgressTracker;