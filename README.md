# Streak Garden

Web cá nhân lưu nhiều streak, dùng **Node.js + Express + EJS + MongoDB (Mongoose), mô hình MVC**. Giao diện nằm cùng source, không tách frontend/backend và không có đăng nhập.

## Deploy lên Render

Với Web Service đã tạo, mở **Settings → Build & Deploy** và đặt:

- **Build Command:** `npm ci --omit=dev`
- **Start Command:** `npm start`
- **Root Directory:** để trống nếu `package.json` nằm ở gốc repository.

Build Command phải cài dependencies. Chỉ chạy `node` sẽ không cài Express và gây lỗi `ERR_MODULE_NOT_FOUND` lúc khởi động. Ứng dụng dùng EJS trực tiếp nên không cần bước biên dịch frontend.

Trong **Environment** của Render, khai báo `MONGODB_URI` trỏ tới MongoDB có thể truy cập từ Render và `APP_URL` là URL HTTPS của service. Có thể thêm `APP_TIMEZONE=Asia/Ho_Chi_Minh`, `HOST=0.0.0.0`, `NODE_ENV=production`. Render tự cấp `PORT`, ứng dụng đọc biến này. `.env` trên máy cá nhân không được Git đẩy lên và không tự xuất hiện trên Render.

File `.node-version` ghim Node 24.21.0; nếu service đang có biến `NODE_VERSION`, biến đó được ưu tiên hơn file, hãy đặt cùng phiên bản hoặc bỏ biến override. `package.json` cũng giới hạn phiên bản dưới Node 25 để tránh tự nhảy sang major mới.

Sau khi đẩy thay đổi lên GitHub, chọn **Manual Deploy → Clear build cache & deploy**. Service hiện tại cần sửa Build Command trực tiếp trong dashboard; thêm `render.yaml` không tự thay đổi service chưa được quản lý bằng Blueprint.

Nếu tạo bằng **New → Blueprint**, có thể dùng `render.yaml` kèm theo. Các biến `sync: false` cần nhập trong Render, không ghi connection string vào source.

## Chạy trên máy cá nhân

Cần Node.js 22 hoặc 24 và MongoDB (dự án ghim Node 24.21.0). Mở terminal trong thư mục dự án:

```powershell
npm ci
Copy-Item .env.example .env
```

Chạy MongoDB cài trên máy, hoặc dùng Docker Desktop (phải mở Docker Desktop trước):

```powershell
docker compose up -d mongo
npm start
```

Mở **http://localhost:3000**. Chế độ phát triển: `npm run dev`.

Nếu dùng MongoDB Atlas, đặt connection string của bạn vào `MONGODB_URI` trong `.env`. Không đưa file `.env` lên Git.

```dotenv
PORT=3000
HOST=0.0.0.0
MONGODB_URI=mongodb://127.0.0.1:27017/streak_garden
APP_TIMEZONE=Asia/Ho_Chi_Minh
APP_URL=http://192.168.1.10:3000
```

`APP_URL` là địa chỉ thiết bị cài widget truy cập được, dùng làm gợi ý trong hộp cài widget. Đổi IP ví dụ thành IP của máy chạy Express. Điện thoại cần cùng Wi-Fi, máy chủ cần đang chạy, và tường lửa cần cho phép cổng 3000 trong mạng riêng. Cấu hình HTTPS nếu truy cập từ ngoài mạng. Không dùng `localhost` của máy tính trên điện thoại.

Ứng dụng theo yêu cầu không có xác thực: mọi thiết bị truy cập được URL đều có thể đọc/sửa/xóa streak. Dùng mạng cá nhân hoặc VPN riêng nếu muốn chỉ mình truy cập. Không mở cổng MongoDB ra internet; cấu hình Docker đã giới hạn ở loopback. Source chưa được triển khai lên dịch vụ hosting hay gắn với database cá nhân của bạn.

## Chức năng

- Tạo nhiều streak, đặt tên tối đa 80 ký tự, chọn ngày bắt đầu (từ 1900 đến hôm nay, gồm ngày trong quá khứ).
- Đếm số ngày tự động, **ngày bắt đầu là ngày 1**. Công thức: khoảng cách ngày lịch giữa hôm nay và ngày bắt đầu + 1.
- Ví dụ bắt đầu 20/10/2026 thì đến 23/10/2026 là 4 ngày. Đây là bộ đếm thời gian từ ngày bắt đầu, không yêu cầu điểm danh và không tự reset khi bỏ một ngày.
- Mặc định theo giờ Việt Nam; đổi `APP_TIMEZONE` nếu cần. Lưu ngày ở dạng `YYYY-MM-DD`, không bị lệch vì chuyển múi giờ hay DST.
- Sửa tên, ngày bắt đầu và màu; xóa có hộp xác nhận. Không lưu số ngày cố định trong database.
- Biểu tượng ngọn lửa nguyên bản, 4 màu, thống kê tổng quan, sắp xếp và giao diện responsive.
- Trang đang mở tự cập nhật mỗi phút và khi quay lại tab. API luôn tính theo ngày hiện tại.

## Widget: chọn từng streak riêng

Nhấn **Widget** trên thẻ streak để mở hướng dẫn và sao chép URL. Mỗi streak có URL riêng: `/widget/ID` và API `/api/streaks/ID`.

| Thiết bị | Cách dùng | Đã kèm |
| --- | --- | --- |
| iPhone/iPad | Widget thật qua ứng dụng Scriptable; mỗi widget đặt Parameter là URL streak | `widgets/downloads/StreakGarden.js`, tải ngay từ web |
| Android 8+ | Widget thật qua ứng dụng phụ Android Java, mỗi instance có cấu hình URL riêng | Toàn bộ source trong `widgets/android`, cần build APK bằng Android Studio |
| Windows | Widget desktop qua Rainmeter; chạy Configure.ps1 cho từng streak | `widgets/windows`, bộ ZIP tải từ web |
| Trình duyệt | PWA / lối tắt mở trang streak, dùng được trên điện thoại và máy tính hỗ trợ | Manifest riêng từng streak, icon PNG, service worker |

**PWA không phải widget hiển thị số ngày trên biểu tượng.** Widget ngoài màn hình cần thành phần của hệ điều hành hoặc ứng dụng phụ. Không thể tạo widget native trên mọi nền tảng bằng Express/HTML đơn thuần.

iOS/Android quyết định thời gian làm mới, có thể trễ khi tiết kiệm pin. Không hứa cập nhật đúng 00:00 khi widget nằm nền. Scriptable và Android cache bản ghi gần nhất, tự tính lại số ngày khi được hệ điều hành gọi dù mất mạng. Tên/ngày mới và trạng thái xóa cần có mạng để nhận. Windows tải lại mỗi phút khi Rainmeter đang chạy. Thêm hoặc xóa widget khỏi màn hình không thay đổi streak trong database.

Mở `widgets/android/README.md` hoặc `widgets/windows/README.txt` để cài cụ thể. Widget native chưa được build và chạy trên thiết bị thực trong môi trường tạo source; cần xác minh sau khi cài. Không có APK sẵn. macOS có thể dùng lối tắt web; chưa có widget macOS native.

## Cấu trúc MVC

```text
server.js                    Entry point, gọi bootstrap
src/app.js                   Chỉ lắp ghép config, middleware và routes
src/config/                  Đọc .env, cấu hình database, paths, Express, bảo mật
src/bootstrap/               Khởi động server, đóng HTTP/MongoDB khi dừng
src/middlewares/             Kiểm tra request, no-cache, static, lỗi và 404
src/models/Streak.js         Schema MongoDB
src/controllers/             Nhận request, gọi service, trả response/render
src/services/                CRUD, tính tổng quan, xử lý streak và manifest widget
src/validators/              Kiểm tra và chuẩn hóa dữ liệu streak
src/mappers/                 Chuyển bản ghi MongoDB thành dữ liệu trả về
src/constants/               Màu, độ dài tên và giá trị mặc định
src/errors/                  Lỗi nghiệp vụ dùng chung
src/routes/                  Chỉ ánh xạ URL đến controller
src/views/                   EJS và partial ngọn lửa
src/utils/dates.js           Ngày lịch theo múi giờ
public/css, public/js        Giao diện và tương tác cùng ứng dụng
public/sw.js                 Cache tài nguyên tĩnh, trang báo ngoại tuyến
widgets/                     Bộ tích hợp iOS, Android và Windows
test/                        Kiểm thử với MongoDB tạm thật
```

Database collection `streaks`: `title`, `startDate`, `color`, `createdAt`, `updatedAt`. `startDate` là ngày do người dùng chọn, khác thời điểm bản ghi được tạo. Khi sửa ngày trên giao diện, ứng dụng sửa `startDate`.

Luồng xử lý: **Route → Controller → Service → Model → MongoDB**. Controller không truy vấn database, validate đầu vào hoặc tính số ngày. Service nhận dữ liệu thuần và múi giờ, không phụ thuộc `req`/`res`; gọi validator/mapper khi cần. Lỗi được xử lý tập trung trong middleware.

`src/config/env.js` đọc file `.env` tại thư mục gốc dự án. `src/config/database.js` là nơi duy nhất cấu hình kết nối/ngắt MongoDB. `createApp()` không tự kết nối database; bootstrap mới kết nối. Tests và demo truyền URI MongoDB tạm vào `connectDatabase(uri)`, không ghi dữ liệu vào database trong `.env`.

## API

| Method | URL | Ý nghĩa |
| --- | --- | --- |
| GET | `/api/streaks` | Danh sách streak và số ngày hiện tại |
| POST | `/api/streaks` | Tạo streak |
| GET | `/api/streaks/:id` | Lấy một streak cho widget |
| PUT | `/api/streaks/:id` | Sửa tên, ngày bắt đầu, màu |
| DELETE | `/api/streaks/:id` | Xóa streak |
| GET | `/widget/:id` | Trang riêng cho streak |
| GET | `/manifest/:id.webmanifest` | Manifest riêng theo streak |

POST/PUT dùng JSON: `{"title":"Đọc sách","startDate":"2026-10-01","color":"orange"}`. Màu: `orange`, `green`, `blue`, `pink`. PUT cần cả title và startDate. DELETE không có body nhưng cần header `Content-Type: application/json` khi gọi trực tiếp. App chặn yêu cầu ghi khác origin từ trình duyệt, escape tên khi render và giới hạn JSON 8 KB.

## Kiểm thử và xem thử

```powershell
npm test
npm run demo
```

Tests dùng `mongodb-memory-server`, chạy tiến trình MongoDB thật với dữ liệu tạm, cần internet lần đầu để tải binary. Kiểm tra CRUD, validate ngày, múi giờ, năm nhuận, escape HTML, chặn ghi khác nguồn, manifest và tài nguyên widget.

`npm run demo` chạy web tại http://localhost:3000 với 5 streak minh họa trong MongoDB tạm. **Dữ liệu demo mất khi dừng**; không dùng demo để lưu streak cá nhân. Chạy `npm start` với MongoDB lâu dài để lưu dữ liệu thực. Bản production không tự tạo dữ liệu mẫu. MongoDB Docker lưu trong volume `streak_data`; không dùng `docker compose down -v` nếu muốn giữ dữ liệu.

PWA cần HTTPS hoặc localhost. Service worker không cache API hay trang có dữ liệu streak, tránh hiển thị dữ liệu cũ sau khi xóa. Khi mất mạng và mở lại trang, ứng dụng hiển thị thông báo ngoại tuyến; không có CRUD offline.

Tham khảo tích hợp: [Scriptable widget](https://docs.scriptable.app/listwidget/), [Scriptable Parameter](https://docs.scriptable.app/args/), [Android widget update](https://developer.android.com/develop/ui/views/appwidgets/advanced), [Rainmeter RunCommand](https://docs.rainmeter.net/manual/plugins/runcommand/).

## Giao diện

Font Nunito Variable hỗ trợ tiếng Việt được phục vụ từ public/fonts, kèm giấy phép SIL Open Font License. Bộ icon SVG nét tròn và mascot ngọn lửa dùng chung cho dashboard, trang streak, preview widget và icon PWA. Phong cách tham khảo màu sắc, chữ bo tròn và widget của Duolingo; SVG minh họa được vẽ riêng cho Streak Garden.

