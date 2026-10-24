package com.streakgarden.widget;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    TextView help = new TextView(this);
    help.setText("🔥 Streak Garden\n\nNhấn giữ màn hình chính → Widget → Streak Garden.\n\nDán URL streak từ trang web vào màn hình cấu hình. Thêm nhiều widget để theo dõi nhiều streak.\n\nChạm widget để làm mới. Nhấn giữ để đổi kích thước hoặc xóa. Thiết bị phải kết nối được máy chủ; hãy dùng HTTPS hoặc IP LAN thay vì localhost.");
    help.setTextSize(18); help.setPadding(32, 80, 32, 32); setContentView(help);
  }
}
