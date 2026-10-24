# Kết quả kiểm tra

## Refactor cấu trúc ngày 24/10/2026

- `npm test`: **20/20 pass** sau khi tách config, middleware, service, validator và mapper.
- Kiểm tra service được gọi độc lập với HTTP, tổng quan dashboard, màu được giữ khi không truyền trong update, cấu hình từng app riêng và từ chối múi giờ không hợp lệ.
- Kiểm tra bootstrap bằng URI MongoDB tạm và cổng động: kết nối thành công, HTTP 200, render EJS thành công, đóng HTTP/database sau khi kiểm tra.
- Kiểm tra cú pháp toàn bộ JavaScript trong `src/` thành công.
- `.env` của người dùng không bị chỉnh sửa; kiểm thử không kết nối hay ghi vào database cấu hình trong file đó.

Ngày kiểm tra: 23/10/2026.

- `npm test`: **17/17 pass**, dùng tiến trình MongoDB 7.0.24 thật, database tạm riêng, không mock repository.
- CRUD nhiều streak, sửa cả tên và ngày, ngày quá khứ, ngày hôm nay, từ chối ngày tương lai và ngày sai, năm nhuận, ngày theo múi giờ Việt Nam.
- Escape tên khi render HTML, chặn ghi từ browser khác origin, JSON lỗi, URL/manifest bị vô hiệu khi xóa.
- Kiểm tra tài nguyên PWA, icon và tải bộ widget iOS/Windows.
- Trình duyệt: mở dashboard, tạo streak 01/10/2026 và thấy 23 ngày; sửa tên/ngày sang 23/10/2026 và thấy 1 ngày. Đã dọn bản ghi kiểm thử khỏi demo.
- Kiểm tra giao diện ở 390px và 1440px, lưu ảnh trong thư mục outputs cạnh source.
- Windows: chạy Configure.ps1 vào thư mục thử riêng, chạy Update.ps1 và nhận đúng tên, số ngày, ngày bắt đầu từ API Express đang hoạt động. Chưa chạy lớp hiển thị Rainmeter.
- JavaScript phía web/server kiểm tra cú pháp thành công. Android XML parse thành công. Gradle wrapper tải từ repository Gradle chính thức, xác minh SHA-256 của wrapper và pin checksum distribution.

## Giới hạn

- Không có Android SDK/JDK, iPhone/Scriptable hay Rainmeter trong môi trường kiểm thử. Chưa build APK hoặc kiểm chứng widget trên thiết bị thật. Source và hướng dẫn đầy đủ đã kèm.
- Chưa triển khai hosting hay cấu hình MongoDB cá nhân. Demo dùng database tạm; production cần `.env` và MongoDB chạy lâu dài.
- PWA là app/lối tắt mở trang; không phải widget native. Lịch cập nhật widget iOS/Android do hệ điều hành kiểm soát.

## Cập nhật giao diện

Đổi sang Nunito self-hosted, thay icon ký tự bằng SVG, vẽ mascot mới, đổi thẻ streak và widget preview. Chạy lại 17/17 tests thành công. Kiểm tra font tải thành công và không tràn ngang ở viewport 390px, 1440px.

