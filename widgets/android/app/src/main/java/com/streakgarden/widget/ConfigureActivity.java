package com.streakgarden.widget;
import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import android.widget.*;
import java.util.regex.*;

public class ConfigureActivity extends Activity {
  @Override public void onCreate(Bundle state) {
    super.onCreate(state); setResult(RESULT_CANCELED);
    int widgetId = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
    if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }
    LinearLayout layout = new LinearLayout(this); layout.setOrientation(LinearLayout.VERTICAL); layout.setPadding(32, 80, 32, 32);
    TextView title = new TextView(this); title.setText("🔥 Chọn streak cho widget"); title.setTextSize(24); layout.addView(title);
    TextView help = new TextView(this); help.setText("Dán URL từ nút Widget trên web. Ví dụ: https://your-server.com/widget/ID\n\n"); layout.addView(help);
    EditText input = new EditText(this); input.setHint("URL streak"); input.setSingleLine(true); input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI); layout.addView(input);
    TextView error = new TextView(this); error.setTextColor(0xffb44c3a); layout.addView(error);
    Button save = new Button(this); save.setText("Lưu widget"); layout.addView(save); setContentView(layout);
    save.setOnClickListener(view -> {
      Matcher match = Pattern.compile("^(https?://[^\\s/?#]+)/widget/([a-fA-F0-9]{24})/?$").matcher(input.getText().toString().trim());
      if (!match.matches()) { error.setText("URL không hợp lệ. Cần đường dẫn /widget/ID."); return; }
      String base = match.group(1), id = match.group(2); save.setEnabled(false); error.setText("Đang kết nối...");
      new Thread(() -> {
        try {
          org.json.JSONObject data = StreakWidget.fetch(base, id);
          getSharedPreferences("widgets", MODE_PRIVATE).edit().putString(widgetId + "_base", base).putString(widgetId + "_id", id).putString(widgetId + "_cache", data.toString()).apply();
          runOnUiThread(() -> {
            Intent update = new Intent(this, StreakWidget.class).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE).putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{widgetId}); sendBroadcast(update);
            setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)); finish();
          });
        } catch (Exception exception) {
          runOnUiThread(() -> { error.setText("Không đọc được streak. Kiểm tra URL, kết nối mạng và máy chủ."); save.setEnabled(true); });
        }
      }).start();
    });
  }
}
