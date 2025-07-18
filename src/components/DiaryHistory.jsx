import React from 'react';
import DiaryRow from './DiaryRow';

function DiaryHistory({
  logs,
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
    <div className="history-section">
      <h2>📑 Lịch sử nhật ký</h2>
      {logs.length === 0 ? (
        <p>Chưa có nhật ký nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Ngày</th>
              <th>Ghi chú</th>
              <th>Đánh giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <DiaryRow
                key={log.id}
                index={index}
                log={log}
                editingLog={editingLog}
                editNote={editNote}
                setEditNote={setEditNote}
                editFeedback={editFeedback}
                setEditFeedback={setEditFeedback}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEditing={cancelEditing}
                deleteLog={deleteLog}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DiaryHistory;