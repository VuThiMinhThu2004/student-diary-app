import React from 'react';
import DiaryRow from './DiaryRow';

function DiaryHistory({
  logs,
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
  return (
    <div className="history-section">
      <h2>📑 Lịch sử nhật ký</h2>
      {logs.length === 0 ? (
        <p>Chưa có nhật ký nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Ngày</th>
              <th>Nội dung</th>
              <th>Ưu điểm</th>
              <th>Lỗi cần sửa</th>
              <th>Bài tập về nhà</th>
              <th>Tính phí</th>
              {userRole === "teacher" && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <DiaryRow
                key={log.id}
                index={logs.length - index}
                log={log}
                deleteLog={deleteLog}
                userRole={userRole}
                editingLogId={editingLogId}
                startEditLog={startEditLog}
                saveEditLog={saveEditLog}
                cancelEditLog={cancelEditLog}
                editNote={editNote}
                setEditNote={setEditNote}
                editAdvantages={editAdvantages}
                setEditAdvantages={setEditAdvantages}
                editErrors={editErrors}
                setEditErrors={setEditErrors}
                editHomework={editHomework}
                setEditHomework={setEditHomework}
                editIsPaid={editIsPaid}
                setEditIsPaid={setEditIsPaid}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DiaryHistory;