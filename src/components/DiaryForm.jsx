import React, { useState } from 'react';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleAddTodayLog = () => {
    addLog(); // Gọi addLog với ngày hôm nay (mặc định)
  };

  const handleAddCustomDateLog = () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày');
      return;
    }
    addLog(selectedDate); // Gọi addLog với ngày đã chọn
    setSelectedDate('');
    setShowDatePicker(false);
  };

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
      
      <div className="diary-actions">
        <button
          onClick={handleAddTodayLog}
          className="btn btn-add"
        >
          ➕ Thêm nhật ký buổi học hôm nay
        </button>
        
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="btn btn-secondary"
        >
          📝 Bổ sung nhật ký ngày khác
        </button>
      </div>

      {showDatePicker && (
        <div className="date-picker-section">
          <h4>📅 Chọn ngày cần bổ sung nhật ký</h4>
          <div className="date-input-group">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Không cho chọn ngày tương lai
            />
            <div className="date-actions">
              <button
                onClick={handleAddCustomDateLog}
                className="btn btn-success"
                disabled={!selectedDate}
              >
                ✅ Thêm nhật ký
              </button>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setSelectedDate('');
                }}
                className="btn btn-secondary"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiaryForm;