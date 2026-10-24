// Streak Garden for Scriptable (iPhone/iPad).
// Add a Scriptable widget, select this script, set Parameter to your /widget/<id> URL.
let input = args.widgetParameter;
if (!input && !config.runsInWidget) {
  const prompt = new Alert(); prompt.title = 'Streak Garden';
  prompt.message = 'Dán URL streak, ví dụ https://your-server.com/widget/ID';
  prompt.addTextField('URL streak'); prompt.addAction('Xem thử'); prompt.addCancelAction('Hủy');
  if (await prompt.present() < 0) return;
  input = prompt.textFieldValue(0);
}
const match = String(input || '').trim().match(/^(https?:\/\/[^\s/?#]+)\/widget\/([a-f\d]{24})\/?$/i);
const widget = new ListWidget();
widget.backgroundColor = new Color('FAF8F4'); widget.setPadding(20, 20, 16, 20);
const fm = FileManager.local();
let data, offline = false, deleted = false;
if (match) {
  const base = match[1], id = match[2];
  const cache = fm.joinPath(fm.documentsDirectory(), `streak-${base.replace(/[^a-z0-9]/gi, '_')}-${id}.json`);
  try {
    const request = new Request(`${base}/api/streaks/${id}`); request.timeoutInterval = 8;
    const body = await request.loadString();
    if (request.response.statusCode === 404) {
      deleted = true; if (fm.fileExists(cache)) fm.remove(cache);
    } else {
      if (request.response.statusCode !== 200) throw new Error('Server unavailable');
      data = JSON.parse(body);
      if (!data.startDate || !data.title || !data.timeZone) throw new Error('Invalid data');
      fm.writeString(cache, JSON.stringify(data));
    }
  } catch {
    offline = true;
    if (fm.fileExists(cache)) { try { data = JSON.parse(fm.readString(cache)); } catch {} }
  }
  widget.url = `${base}/widget/${id}`;
}
const flame = widget.addText('🔥'); flame.font = Font.systemFont(31);
widget.addSpacer(9);
if (data && !deleted) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: data.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  const today = `${get('year')}-${get('month')}-${get('day')}`;
  const days = Math.max(1, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${data.startDate}T00:00:00Z`)) / 86400000) + 1);
  const count = widget.addText(`${days}`); count.font = Font.boldSystemFont(42); count.textColor = new Color('343B2F'); count.minimumScaleFactor = 0.5;
  const label = widget.addText('ngày liên tiếp'); label.font = Font.systemFont(10); label.textColor = new Color('8A8B80');
  widget.addSpacer(7);
  const title = widget.addText(data.title); title.font = Font.semiboldSystemFont(13); title.textColor = new Color('596A4B'); title.lineLimit = 2;
  widget.addSpacer();
  const status = widget.addText(offline ? 'Ngoại tuyến · tên lưu gần nhất' : 'Mỗi ngày một chút.'); status.font = Font.systemFont(8); status.textColor = new Color('999B90');
} else {
  const text = widget.addText(deleted ? 'Streak đã bị xóa' : match ? 'Chưa kết nối được máy chủ' : 'Thêm URL streak vào Parameter');
  text.font = Font.systemFont(13); text.textColor = new Color('596A4B');
}
widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
Script.setWidget(widget);
if (!config.runsInWidget) await widget.presentSmall();
Script.complete();
