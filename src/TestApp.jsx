import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🧪 Test App</h1>
      <p>Nếu bạn thấy này thì React đang hoạt động!</p>
      <button onClick={() => alert('Button works!')}>
        Click để test
      </button>
    </div>
  );
}

export default TestApp;
