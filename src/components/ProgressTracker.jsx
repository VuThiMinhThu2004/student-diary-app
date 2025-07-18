import React from 'react';

function ProgressTracker({ attendedCount, TOTAL_CLASSES, progressPercent, remaining }) {
  return (
    <div className="progress-section">
      <h2>📈 Tiến độ học tập</h2>
      <div className="progress-item">
        Đã học <strong>{attendedCount}/{TOTAL_CLASSES}</strong> buổi —
        Tiến độ: <strong>{progressPercent}%</strong>
      </div>
      <div className="progress-item">
        Còn lại: <strong>{remaining}</strong> buổi
      </div>
    </div>
  );
}

export default ProgressTracker;