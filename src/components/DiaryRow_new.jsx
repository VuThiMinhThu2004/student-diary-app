import React from 'react';

function DiaryRow({
  index,
  log,
  deleteLog,
  userRole = "student"
}) {
  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      deleteLog(log.id);
    }
  };

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
          <button onClick={handleDelete} className="btn btn-delete">
            🗑️
          </button>
        </td>
      )}
    </tr>
  );
}

export default DiaryRow;
