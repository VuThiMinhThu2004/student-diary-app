import React from 'react';

function DiaryForm({ 
  note, 
  setNote, 
  advantages, 
  setAdvantages, 
  errors, 
  setErrors, 
  homework, 
  setHomework, 
  isPaid, 
  setIsPaid, 
  addLog 
}) {
  return (
    <div className="input-section">
      <textarea
        placeholder="Nội dung bài học hôm nay"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="3"
      />
      <textarea
        placeholder="Ưu điểm của học sinh"
        value={advantages}
        onChange={(e) => setAdvantages(e.target.value)}
        rows="2"
      />
      <textarea
        placeholder="Lỗi cần sửa"
        value={errors}
        onChange={(e) => setErrors(e.target.value)}
        rows="2"
      />
      <textarea
        placeholder="Bài tập về nhà"
        value={homework}
        onChange={(e) => setHomework(e.target.value)}
        rows="2"
      />
      <div className="checkbox-section">
        <label>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
          />
          Tính phí
        </label>
      </div>
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