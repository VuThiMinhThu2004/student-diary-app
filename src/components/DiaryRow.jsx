import React from 'react';

function DiaryRow({
  index,
  log,
  editingLog,
  editNote,
  setEditNote,
  editAdvantages,
  setEditAdvantages,
  editErrors,
  setEditErrors,
  editHomework,
  setEditHomework,
  editIsPaid,
  setEditIsPaid,
  startEditing,
  saveEdit,
  cancelEditing,
  deleteLog,
  userRole = "student"
}) {
  return (
    <tr>
      <td>{index}</td>
      <td>{log.date}</td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            rows="2"
            className="edit-textarea"
          />
        ) : (
          log.note
        )}
      </td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <textarea
            value={editAdvantages}
            onChange={(e) => setEditAdvantages(e.target.value)}
            rows="2"
            className="edit-textarea"
          />
        ) : (
          log.advantages || "-"
        )}
      </td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <textarea
            value={editErrors}
            onChange={(e) => setEditErrors(e.target.value)}
            rows="2"
            className="edit-textarea"
          />
        ) : (
          log.errors || "-"
        )}
      </td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <textarea
            value={editHomework}
            onChange={(e) => setEditHomework(e.target.value)}
            rows="2"
            className="edit-textarea"
          />
        ) : (
          log.homework || "-"
        )}
      </td>
      <td>
        {editingLog && editingLog.id === log.id ? (
          <label>
            <input
              type="checkbox"
              checked={editIsPaid}
              onChange={(e) => setEditIsPaid(e.target.checked)}
            />
            Tính phí
          </label>
        ) : (
          log.isPaid ? "Tính phí" : "Free"
        )}
      </td>
      {userRole === "teacher" && (
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
      )}
    </tr>
  );
}

export default DiaryRow;