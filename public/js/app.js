const $ = selector => document.querySelector(selector);
const cards = [...document.querySelectorAll('.streak-card[data-id]')];
const form = $('#streak-form');
let deletingId;
let platform = 'ios';
const toast = message => { $('#toast').textContent = message; $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 3500); };
async function request(url, method, body) {
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error || 'Không kết nối được máy chủ. Hãy thử lại.'); }
  return response.status === 204 ? null : response.json();
}
function openForm(card) {
  form.reset();
  form.elements.id.value = card?.dataset.id || '';
  form.elements.title.value = card?.dataset.title || '';
  form.elements.startDate.value = card?.dataset.start || document.body.dataset.today;
  form.elements.color.value = card?.dataset.color || 'orange';
  $('#dialog-title').textContent = card ? 'Chăm chút ngọn lửa của bạn' : 'Ngọn lửa mới của bạn';
  form.querySelector('.form-error').textContent = '';
  $('#streak-dialog').showModal();
}
$('#new-streak').addEventListener('click', () => openForm());
$('#new-card').addEventListener('click', () => openForm());
document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
cards.forEach(card => {
  card.querySelector('.edit-streak').addEventListener('click', () => openForm(card));
  card.querySelector('.delete-streak').addEventListener('click', () => {
    deletingId = card.dataset.id;
    $('#delete-description').textContent = `“${card.dataset.title}” — ${card.dataset.days} ngày liên tiếp.`;
    $('#delete-form .form-error').textContent = '';
    $('#delete-dialog').showModal();
  });
  card.querySelector('.add-widget').addEventListener('click', () => openWidgets(card.dataset.id));
});
form.addEventListener('submit', async event => {
  event.preventDefault(); const button = form.querySelector('[type=submit]'); button.disabled = true;
  const values = Object.fromEntries(new FormData(form));
  try { await request(values.id ? `/api/streaks/${values.id}` : '/api/streaks', values.id ? 'PUT' : 'POST', { title: values.title, startDate: values.startDate, color: values.color }); location.reload(); }
  catch (error) { form.querySelector('.form-error').textContent = error.message; button.disabled = false; }
});
$('#delete-form').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.target.querySelector('[type=submit]'); button.disabled = true;
  try { await request(`/api/streaks/${deletingId}`, 'DELETE'); location.reload(); }
  catch (error) { event.target.querySelector('.form-error').textContent = error.message; button.disabled = false; }
});
$('#sort').addEventListener('change', event => {
  const sorted = [...cards];
  if (event.target.value === 'longest') sorted.sort((a, b) => Number(b.dataset.days) - Number(a.dataset.days));
  if (event.target.value === 'title') sorted.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title, 'vi'));
  sorted.forEach(card => $('#streak-grid').insertBefore(card, $('#new-card')));
});
const help = {
  ios: '<ol><li>Cài <a href="https://scriptable.app" target="_blank" rel="noopener">Scriptable</a> từ App Store.</li><li><a href="/downloads/StreakGarden.js" download>Tải script StreakGarden.js</a>, nhập vào Scriptable (hoặc tạo script mới và dán nội dung).</li><li>Thêm widget Scriptable trên màn hình chính. Nhấn giữ widget → Sửa widget → chọn script StreakGarden.</li><li>Dán URL streak bên dưới vào ô Parameter. Thêm widget khác với URL streak khác để theo dõi nhiều streak.</li></ol><p class="notice">iOS quyết định thời gian làm mới. Widget lưu dữ liệu gần nhất và vẫn tự tính ngày khi lần làm mới bị mất mạng; thay đổi tên và xóa cần kết nối lại.</p>',
  android: '<ol><li>Mở thư mục <b>widgets/android</b> trong source bằng Android Studio, đồng bộ Gradle và build APK.</li><li>Cài APK lên điện thoại. Nhấn giữ màn hình chính → Widget → Streak Garden.</li><li>Dán URL streak bên dưới vào màn hình cấu hình rồi chọn Lưu widget.</li><li>Lặp lại cho streak khác. Chạm widget để làm mới; giữ widget để đổi kích thước hoặc xóa.</li></ol><p class="notice">Đây là widget Android thật, cần build và cài ứng dụng phụ. Android kiểm soát lịch làm mới, thông thường khoảng 30 phút trở lên. Source kèm theo; chưa có APK dựng sẵn.</p>',
  windows: '<ol><li>Cài <a href="https://www.rainmeter.net" target="_blank" rel="noopener">Rainmeter</a> trên Windows.</li><li><a href="/downloads/StreakGarden-Windows.zip" download>Tải bộ widget Windows</a> và giải nén.</li><li>Chạy Configure.ps1 bằng PowerShell, dán URL streak bên dưới. Hướng dẫn lệnh nằm trong README của bộ tải về.</li><li>Trong Rainmeter chọn Refresh all → StreakGarden → thư mục streak → Streak.ini → Load.</li><li>Chạy Configure.ps1 thêm lần nữa với URL khác để tạo widget khác.</li></ol><p class="notice">Rainmeter hiển thị widget trên desktop, làm mới mỗi phút khi máy chủ truy cập được. Hỗ trợ Windows; đây không phải widget của bảng Win+W.</p>',
  pwa: '<ol><li>Mở URL streak bằng nút bên dưới.</li><li>iPhone: dùng Safari → Chia sẻ → Thêm vào màn hình chính.</li><li>Android: menu trình duyệt → Thêm vào màn hình chính hoặc Cài đặt ứng dụng.</li><li>Máy tính: dùng chức năng Cài đặt trang dưới dạng ứng dụng / Tạo lối tắt của trình duyệt.</li></ol><p class="notice">Đây là lối tắt mở trang streak. Số ngày chỉ hiển thị khi mở, không xuất hiện trên biểu tượng. Khả năng cài nhiều lối tắt phụ thuộc trình duyệt. Cài PWA cần HTTPS hoặc localhost.</p>'
};
function openWidgets(id) {
  if (!cards.length) { toast('Tạo streak đầu tiên để thêm widget.'); openForm(); return; }
  $('#widget-streak').value = id || cards[0].dataset.id;
  $('#widget-origin').value = localStorage.getItem('streak-widget-origin') || document.body.dataset.appUrl || location.origin;
  renderWidget(); $('#widget-dialog').showModal();
}
function renderWidget() {
  const id = $('#widget-streak').value;
  const card = cards.find(card => card.dataset.id === id);
  if (!card) return;
  $('#widget-preview-days').textContent = card.dataset.days;
  $('#widget-preview-title').textContent = card.dataset.title;
  $('.widget-mini').className = `widget-mini ${card.dataset.color}`;
  $('#widget-instructions').innerHTML = help[platform];
  const base = $('#widget-origin').value.trim().replace(/\/$/, '');
  let valid = false;
  try { const url = new URL(base); valid = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && url.pathname === '/'; } catch {}
  $('#widget-url').value = valid ? `${base}/widget/${id}` : '';
  $('#open-widget').href = valid ? `${base}/widget/${id}` : '#';
  $('#copy-widget').disabled = !valid;
  $('#widget-message').textContent = valid ? '' : 'Nhập URL gốc hợp lệ, ví dụ https://streak.example.com (không kèm đường dẫn).';
  if (valid) localStorage.setItem('streak-widget-origin', base);
}
document.querySelectorAll('[data-platform]').forEach(button => button.addEventListener('click', () => {
  platform = button.dataset.platform;
  document.querySelectorAll('[data-platform]').forEach(tab => tab.classList.toggle('selected', tab === button));
  renderWidget();
}));
$('#widget-streak').addEventListener('change', renderWidget);
$('#widget-origin').addEventListener('input', renderWidget);
$('#copy-widget').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#widget-url').value); $('#widget-message').textContent = 'Đã sao chép URL streak.'; }
  catch { $('#widget-url').focus(); $('#widget-url').select(); $('#widget-message').textContent = 'Nhấn Ctrl+C hoặc giữ ô URL để sao chép.'; }
});
for (const selector of ['#widget-guide', '#sidebar-widgets']) $(selector).addEventListener('click', () => openWidgets());
async function refresh() {
  if (document.hidden || document.querySelector('dialog[open]')) return;
  try {
    const data = await request('/api/streaks', 'GET');
    if (data.length !== cards.length || data.some(item => { const card = cards.find(c => c.dataset.id === item.id); return !card || card.dataset.title !== item.title || card.dataset.start !== item.startDate || card.dataset.color !== item.color; })) { location.reload(); return; }
    let total = 0, longest = 0;
    data.forEach(item => { const card = cards.find(c => c.dataset.id === item.id); card.dataset.days = item.days; card.querySelector('.day-count strong').textContent = item.days; total += item.days; longest = Math.max(longest, item.days); });
    $('#total-days').firstChild.textContent = total;
    $('#longest').firstChild.textContent = longest;
    if (data[0] && document.body.dataset.today !== data[0].today) location.reload();
  } catch { /* Existing data stays visible during a brief connection loss. */ }
}
setInterval(refresh, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
