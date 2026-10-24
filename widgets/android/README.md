# Android widget

Ứng dụng Java nhỏ, không có frontend web riêng hay database riêng. Mỗi widget lưu một URL streak, đọc Express API và cache dữ liệu gần nhất.

## Build

- Android Studio, JDK 17, Android SDK 35.
- Mở thư mục này trong Android Studio và đồng bộ Gradle. Project kèm Gradle Wrapper 8.11.1 với checksum, dùng Android Gradle Plugin 8.9.1.
- Chọn **Build → Generate App Bundles or APKs → Generate APKs**. Hoặc trên Windows chạy `./gradlew.bat :app:assembleDebug` khi JDK/Android SDK đã được cấu hình.
- APK: `app/build/outputs/apk/debug/app-debug.apk`. Cài lên thiết bị Android 8 trở lên.

## Dùng

1. Nhấn giữ màn hình chính → Widget → Streak Garden.
2. Dán URL `https://your-server/widget/ID`, lấy từ nút Widget trên web.
3. Lưu. Thêm widget khác để chọn streak khác. Chạm widget để làm mới.
4. Thay đổi tên/ngày trên web sẽ xuất hiện khi widget tải dữ liệu tiếp theo.

Android kiểm soát lịch cập nhật; khai báo 30 phút, có thể lâu hơn khi tiết kiệm pin. Không bảo đảm chuyển số đúng nửa đêm nếu hệ điều hành trì hoãn. Không dùng báo thức chính xác hay dịch vụ nền liên tục.

Ứng dụng cho phép HTTP để hỗ trợ IP LAN khi tự host. Dùng HTTPS khi truy cập ngoài LAN. `localhost` trên điện thoại là chính điện thoại, không phải máy chạy Express. Source chưa được build/kiểm thử trên thiết bị trong môi trường tạo dự án.
