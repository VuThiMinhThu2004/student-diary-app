import React from 'react';

function DiaryForm({ note, setNote, feedback, setFeedback, addLog }) {
  return (
    <div className="input-section">
      <textarea
        placeholder="Ghi chú bài học hôm nay"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="3"
      />
      <input
        placeholder="Đánh giá của giảng viên"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button
        onClick={addLog}
        className="btn btn-add"
      >
        ➕ Thêm nhật ký buổi học hôm nay
      </button>
    </div>
  );
}

export default DiaryForm;