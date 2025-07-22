import React from 'react';

function ProgressTracker({ attendedCount, paidCount, freeCount, totalSessions = 30 }) {
  const progressPercent = totalSessions > 0 ? Math.round((paidCount / totalSessions) * 100) : 0;
  const remaining = Math.max(0, totalSessions - paidCount);

  return (
    <div className="progress-section">
      <h2>📈 Tiến độ học tập</h2>
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