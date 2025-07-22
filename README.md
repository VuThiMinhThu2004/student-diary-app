# Nhật ký học tập - Student Diary App

Ứng dụng quản lý nhật ký học tập với hệ thống bảo mật vai trò nghiêm ngặt.

## 🔐 Hệ thống bảo mật

### Phân tách giao diện đăng nhập
- **Đăng nhập Giáo viên**: Chỉ tài khoản có `role: "teacher"` mới được phép truy cập
- **Đăng nhập Học sinh**: Chỉ tài khoản có `role: "student"` mới được phép truy cập
- **Xác thực nghiêm ngặt**: Hệ thống tự động đăng xuất nếu role không khớp với giao diện

## Tính năng

### �‍🏫 Giáo viên (Teacher)
- Đăng nhập qua giao diện riêng biệt
- Tạo tài khoản học sinh với thông tin đầy đủ
- Quản lý danh sách học sinh
- Tìm kiếm học sinh theo tên/mã số
- Thêm, sửa, xóa nhật ký học tập
- Theo dõi tiến độ và thanh toán
- **Quyền độc quyền**: Chỉ teacher mới có thể tạo tài khoản student

### 🎓 Học sinh (Student)
- Đăng nhập qua giao diện riêng biệt
- Xem nhật ký học tập của bản thân
- Theo dõi tiến độ và thanh toán
- **Chỉ đọc**: Không có quyền chỉnh sửa

## Cấu trúc dữ liệu

```
users/{userId}
  - email: string
  - role: "teacher" | "student"
  - fullName: string        // Họ và tên
  - gender: string          // Giới tính ("Nam" | "Nữ")
  - birthYear: number       // Năm sinh
  - phone: string           // Số điện thoại
  - course: string          // Khóa học
  - totalSessions: number   // Số buổi học
  - tuition: number         // Học phí (VNĐ)
  - studentCode: string     // Mã học sinh (auto-generate: HS001, HS002...)
  - createdAt: timestamp

students/{studentId}/diary/{logId}
  - date: string
  - note: string
  - advantages: string
  - errors: string
  - homework: string
  - isPaid: boolean
```

## Cách chạy ứng dụng

```bash
npm install
npm run dev
```
https://console.firebase.google.com/u/0/

## Setup dữ liệu test

### 📁 1. Truy cập Firebase Console
- Mở [Firebase Console](https://console.firebase.google.com/)
- Chọn project của bạn (hoặc tạo mới nếu chưa có)
- Vào **Firestore Database** → Nhấn "Create database" nếu chưa tạo

### 📁 1.1. Cấu hình Firestore Rules (QUAN TRỌNG)
1. Vào **Firestore Database** → Tab **Rules**
2. Thay thế rules hiện tại bằng:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc/ghi khi user đã authenticate
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Nhấn **Publish** để áp dụng

### 📁 2. Tạo Collection `users`

#### 👩‍🏫 Document: Teacher
- **Collection**: `users`
- **Document ID**: `teacherID1` (hoặc để auto-ID)
- **Nội dung**:
   ```json
   {
     "email": "teacher@gmail.com",
     "role": "teacher", 
     "createdAt": "2025-07-22T00:00:00.000Z"
   }
   ```

#### 🎓 Document: Student  
- **Collection**: `users`
- **Document ID**: `studentID1` (hoặc để auto-ID)
- **Nội dung**:
   ```json
   {
     "email": "student@example.com",
     "role": "student",
     "createdAt": "2025-07-22T00:00:00.000Z" 
   }
   ```

### 📁 3. Tạo Collection `students`
- **Document ID**: `studentID1` (trùng ID student ở trên để dễ tra cứu)
- **Tạo Subcollection**: `diary`
- **Thêm nhật ký học tập mẫu**:

```json
// Collection: students
// Document ID: studentID1  
// Subcollection: diary
// Document: log1
{
  "date": "2025-07-18",
  "note": "Học phần giới thiệu AI",
  "advantages": "Tập trung, tiếp thu tốt", 
  "errors": "Chưa làm bài tập",
  "homework": "Làm bài tập chương 1",
  "isPaid": true
}
```

### ✅ Kết quả cấu trúc trên Firebase:
```
Firestore:
├── users
│   ├── teacherID1
│   │    └── email, role, createdAt
│   └── studentID1  
│        └── email, role, createdAt
├── students
│   └── studentID1
│        └── diary
│             └── log1
│                  └── date, note, ...
```

### 🧪 Test Authentication
Vào tab **Authentication** → **Users** → **Add user**:
- **Email**: `teacher@gmail.com` – **Password**: `123456`
- **Email**: `student@example.com` – **Password**: `123456`

### 🚀 Chức năng tự động tạo tài khoản
Sau khi đăng nhập với tài khoản teacher, bạn có thể:
- Sử dụng nút "➕ Tạo tài khoản học sinh" để tự động tạo tài khoản mới
- Hệ thống sẽ tự động tạo Authentication và lưu vào Firestore

## Deploy

```bash
npm ci && npm run build
firebase deploy
```

Để test local:
```bash
firebase serve
```