import React from 'react';
import UserHeader from './UserHeader';
import DiaryForm from './DiaryForm';
import ProgressTracker from './ProgressTracker';
import DiaryHistory from './DiaryHistory';

function StudentDashboard({
  user,
  handleLogout,
  note,
  setNote,
  feedback,
  setFeedback,
  addLog,
  attendedCount,
  TOTAL_CLASSES,
  progressPercent,
  remaining,
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
    <>
      <UserHeader user={user} handleLogout={handleLogout} />
      
      <DiaryForm 
        note={note}
        setNote={setNote}
        feedback={feedback}
        setFeedback={setFeedback}
        addLog={addLog}
      />
      
      <ProgressTracker
        attendedCount={attendedCount}
        TOTAL_CLASSES={TOTAL_CLASSES}
        progressPercent={progressPercent}
        remaining={remaining}
      />
      
      <DiaryHistory
        logs={logs}
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
    </>
  );
}

export default StudentDashboard;