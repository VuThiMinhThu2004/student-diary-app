// Script để tạo dữ liệu mẫu cho việc test
// Chạy script này trong console của Firebase để tạo user roles

/*
Để test hệ thống, bạn cần:

1. Tạo tài khoản giảng viên:
   - Email: teacher@gmail.com
   - Password: 123456
   - Tạo document trong Firestore:
     Collection: users
     Document ID: [UID của teacher]
     Data: {
       email: "teacher@gmail.com",
       role: "teacher",
       createdAt: "2025-01-22T00:00:00.000Z"
     }

2. Tạo tài khoản học sinh:
   - Email: 22028116@vnu.edu.vn
   - Password: 123456
   - Tạo document trong Firestore:
     Collection: users
     Document ID: [UID của student]
     Data: {
       email: "22028116@vnu.edu.vn",
       role: "student",
       createdAt: "2025-01-22T00:00:00.000Z"
     }

3. Tạo dữ liệu nhật ký mẫu cho học sinh:
   Collection: students/[student_UID]/diary
   Documents:
   {
     date: "2025-01-20",
     note: "Học bài 1: Giới thiệu React",
     advantages: "Hiểu được concept cơ bản",
     errors: "Còn nhầm lẫn về props và state",
     homework: "Làm bài tập về component",
     isPaid: true
   }

Cách thực hiện:
1. Mở Firebase Console
2. Vào Authentication → Users → Add user để tạo tài khoản
3. Vào Firestore Database → Tạo collection và document theo cấu trúc trên
4. Hoặc sử dụng code JavaScript sau trong console của trình duyệt khi đã đăng nhập:
*/

// Thêm vào cuối file App.jsx để tạo dữ liệu test:
const createTestData = async () => {
  // Code này chỉ để tham khảo, cần chạy trong môi trường Firebase Admin
  console.log("Tạo dữ liệu test - vui lòng thực hiện thủ công trong Firebase Console");
};

export { createTestData };
