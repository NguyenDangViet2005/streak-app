package com.streakgarden.widget;
import android.app.PendingIntent;
import android.appwidget.*;
import android.content.*;
import android.widget.RemoteViews;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.*;
import org.json.JSONObject;

public class StreakWidget extends AppWidgetProvider {
  private static final ExecutorService POOL = Executors.newCachedThreadPool();
  public static JSONObject fetch(String base, String id) throws Exception {
    HttpURLConnection connection = (HttpURLConnection) new URL(base + "/api/streaks/" + id).openConnection();
    connection.setConnectTimeout(3000); connection.setReadTimeout(3000);
    try {
      int code = connection.getResponseCode();
      if (code == 404) throw new FileNotFoundException("Deleted streak");
      if (code != 200) throw new IOException("HTTP " + code);
      try (InputStream in = connection.getInputStream(); ByteArrayOutputStream bytes = new ByteArrayOutputStream()) {
        byte[] buffer = new byte[2048]; int length;
        while ((length = in.read(buffer)) != -1) { bytes.write(buffer, 0, length); if (bytes.size() > 16384) throw new IOException("Response too large"); }
        JSONObject data = new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
        data.getString("title"); LocalDate.parse(data.getString("startDate")); ZoneId.of(data.getString("timeZone"));
        return data;
      }
    } finally { connection.disconnect(); }
  }
  @Override public void onReceive(Context context, Intent intent) {
    if (AppWidgetManager.ACTION_APPWIDGET_UPDATE.equals(intent.getAction()) || "com.streakgarden.REFRESH".equals(intent.getAction())) {
      int[] ids = intent.getIntArrayExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS);
      if (ids == null) ids = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, StreakWidget.class));
      PendingResult pending = goAsync();
      CompletableFuture<?>[] jobs = new CompletableFuture<?>[ids.length];
      for (int i = 0; i < ids.length; i++) { int id = ids[i]; jobs[i] = CompletableFuture.runAsync(() -> update(context.getApplicationContext(), id), POOL); }
      CompletableFuture.allOf(jobs).whenComplete((value, error) -> pending.finish());
    } else super.onReceive(context, intent);
  }
  private static void update(Context context, int widgetId) {
    SharedPreferences prefs = context.getSharedPreferences("widgets", Context.MODE_PRIVATE);
    String base = prefs.getString(widgetId + "_base", null), id = prefs.getString(widgetId + "_id", null);
    if (base == null || id == null) return;
    RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.streak_widget);
    JSONObject data = null; boolean offline = false, deleted = false;
    try { data = fetch(base, id); prefs.edit().putString(widgetId + "_cache", data.toString()).apply(); }
    catch (FileNotFoundException error) { deleted = true; prefs.edit().remove(widgetId + "_cache").apply(); }
    catch (Exception error) { offline = true; try { data = new JSONObject(prefs.getString(widgetId + "_cache", "")); } catch (Exception ignored) {} }
    try {
      if (deleted || data == null) {
        views.setTextViewText(R.id.days, "—"); views.setTextViewText(R.id.title, deleted ? "Streak đã bị xóa" : "Chưa có dữ liệu");
        views.setTextViewText(R.id.status, "Chạm để thử lại");
      } else {
        long days = Math.max(1, ChronoUnit.DAYS.between(LocalDate.parse(data.getString("startDate")), LocalDate.now(ZoneId.of(data.getString("timeZone")))) + 1);
        views.setTextViewText(R.id.days, Long.toString(days)); views.setTextViewText(R.id.title, data.getString("title"));
        views.setTextViewText(R.id.status, offline ? "Ngoại tuyến · tên lưu gần nhất" : "Chạm để làm mới");
      }
    } catch (Exception error) { views.setTextViewText(R.id.status, "Dữ liệu không hợp lệ"); }
    Intent refresh = new Intent(context, StreakWidget.class).setAction("com.streakgarden.REFRESH").putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, new int[]{widgetId});
    views.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getBroadcast(context, widgetId, refresh, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
    AppWidgetManager.getInstance(context).updateAppWidget(widgetId, views);
  }
  @Override public void onDeleted(Context context, int[] ids) {
    SharedPreferences.Editor editor = context.getSharedPreferences("widgets", Context.MODE_PRIVATE).edit();
    for (int id : ids) { editor.remove(id + "_base"); editor.remove(id + "_id"); editor.remove(id + "_cache"); }
    editor.apply();
  }
}
