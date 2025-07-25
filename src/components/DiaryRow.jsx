import React from 'react';

function DiaryRow({
  index,
  log,
  deleteLog,
  userRole = "student",
  editingLogId,
  startEditLog,
  saveEditLog,
  cancelEditLog,
  editNote,
  setEditNote,
  editAdvantages,
  setEditAdvantages,
  editErrors,
  setEditErrors,
  editHomework,
  setEditHomework,
  editIsPaid,
  setEditIsPaid
}) {
  const isEditing = editingLogId === log.id;

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      deleteLog(log.id);
    }
  };

  const handleStartEdit = () => {
    startEditLog(log);
  };

  const handleSaveEdit = () => {
    saveEditLog(log.id);
  };

  const handleCancelEdit = () => {
    cancelEditLog();
  };

  if (isEditing) {
    return (
      <tr>
        <td>{index}</td>
        <td>{log.date}</td>
        <td>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            className="edit-textarea"
            placeholder="Nội dung bài học..."
          />
        </td>
        <td>
          <textarea
            value={editAdvantages}
            onChange={(e) => setEditAdvantages(e.target.value)}
            className="edit-textarea"
            placeholder="Ưu điểm của học sinh..."
          />
        </td>
        <td>
          <textarea
            value={editErrors}
            onChange={(e) => setEditErrors(e.target.value)}
            className="edit-textarea"
            placeholder="Lỗi cần sửa..."
          />
        </td>
        <td>
          <textarea
            value={editHomework}
            onChange={(e) => setEditHomework(e.target.value)}
            className="edit-textarea"
            placeholder="Bài tập về nhà..."
          />
        </td>
        <td>
          <label className="checkbox-section">
            <input
              type="checkbox"
              checked={editIsPaid}
              onChange={(e) => setEditIsPaid(e.target.checked)}
            />
            Tính phí
          </label>
        </td>
        {userRole === "teacher" && (
          <td>
            <div className="edit-buttons">
              <button onClick={handleSaveEdit} className="btn btn-save">
                💾
              </button>
              <button onClick={handleCancelEdit} className="btn btn-cancel">
                ❌
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  return (
    <tr>
      <td>{index}</td>
      <td>{log.date}</td>
      <td>{log.note || '-'}</td>
      <td>{log.advantages || '-'}</td>
      <td>{log.errors || '-'}</td>
      <td>{log.homework || '-'}</td>
      <td>{log.isPaid ? 'Tính phí' : 'Chưa tính phí'}</td>
      {userRole === "teacher" && (
        <td>
          <div className="action-buttons">
            <button onClick={handleStartEdit} className="btn btn-edit">
              ✏️
            </button>
            <button onClick={handleDelete} className="btn btn-delete">
              🗑️
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default DiaryRow;
