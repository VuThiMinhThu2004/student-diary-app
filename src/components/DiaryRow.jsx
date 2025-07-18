import React from 'react';

function DiaryRow({
  index,
  log,
  editingLog,
  editNote,
  setEditNote,
  editFeedback,
  setEditFeedback,
  startEditing,
  saveEdit,
  cancelEditing,
  deleteLog
}) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{log.date}</td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows="3"
            className="edit-textarea"
          />
        ) : (
          log.note
        )}
      </td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <input
            value={editFeedback}
            onChange={(e) => setEditFeedback(e.target.value)}
            className="edit-input"
          />
        ) : (
          log.feedback
        )}
      </td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <div className="edit-buttons">
            <button onClick={saveEdit} className="btn btn-save">Lưu</button>
            <button onClick={cancelEditing} className="btn btn-cancel">Hủy</button>
          </div>
        ) : (
          <div className="action-buttons">
            <button 
              onClick={() => startEditing(log)} 
              className="btn btn-edit"
            >
              ✏️
            </button>
            <button 
              onClick={() => deleteLog(log.id)} 
              className="btn btn-delete"
            >
              🗑️
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default DiaryRow;