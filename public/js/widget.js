const id = document.body.dataset.id;
async function refresh() {
  if (document.hidden) return;
  try {
    const response = await fetch(`/api/streaks/${id}`, { cache: 'no-store' });
    if (response.status === 404) {
      document.querySelector('#single-title').textContent = 'Streak đã bị xóa';
      document.querySelector('#single-days').textContent = '—';
      document.querySelector('#single-start').textContent = '';
      document.querySelector('#connection-status').textContent = 'Quay lại trang quản lý để chọn streak khác.';
      return;
    }
    if (!response.ok) throw new Error();
    const data = await response.json();
    const stage = data.days >= 100 ? 3 : data.days >= 30 ? 2 : data.days >= 7 ? 1 : 0;
    if (!document.querySelector(`.mascot-stage-${stage}`)) { location.reload(); return; }
    document.title = `${data.title} · Streak Garden`;
    document.querySelector('#single-title').textContent = data.title;
    document.querySelector('#single-days').textContent = data.days;
    document.querySelector('#single-start').textContent = `Từ ${data.startDate.split('-').reverse().join('/')}`;
    document.querySelector('.single-widget').className = `single-widget streak-card ${data.color}`;
    document.querySelector('#connection-status').textContent = 'Đã cập nhật · Số ngày tự đếm theo múi giờ máy chủ.';
  } catch { document.querySelector('#connection-status').textContent = 'Mất kết nối · Đang hiển thị dữ liệu trước đó.'; }
}
setInterval(refresh, 60000); document.addEventListener('visibilitychange', refresh); refresh();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
