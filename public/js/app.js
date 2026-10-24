const $ = selector => document.querySelector(selector);
const cards = [...document.querySelectorAll('.streak-card[data-id]')];
const form = $('#streak-form');
// Storage may be unavailable in private browsing or restricted webviews.
const preferences = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
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
  form.querySelector('[type=submit]').disabled = false;
  updateCompanionPreview();
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
    $('#delete-form [type=submit]').disabled = false;
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
function sortCards() {
  const sorted = [...cards];
  if ($('#sort').value === 'longest') sorted.sort((a, b) => Number(b.dataset.days) - Number(a.dataset.days));
  if ($('#sort').value === 'title') sorted.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title, 'vi'));
  sorted.forEach(card => $('#streak-grid').insertBefore(card, $('#new-card')));
}
const savedSort = preferences.get('streak-sort');
if (['newest', 'longest', 'title'].includes(savedSort)) $('#sort').value = savedSort;
sortCards();
$('#sort').addEventListener('change', () => {
  preferences.set('streak-sort', $('#sort').value);
  sortCards();
});
// Both selectors share the same accessible keyboard and selection behavior.
function initCustomSelect(select, dropdown) {
  const trigger = dropdown.querySelector('[role="combobox"]');
  const menu = dropdown.querySelector('[role="listbox"]');
  const options = [...menu.querySelectorAll('[role="option"]')];
  let activeIndex = 0;
  function sync() {
    options.forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === select.value)));
    const selected = options.find(option => option.dataset.value === select.value);
    trigger.querySelector('span').textContent = selected?.querySelector('span').textContent || 'Chọn streak';
  }
  function highlight(index) {
    activeIndex = (index + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === activeIndex));
    trigger.setAttribute('aria-activedescendant', options[activeIndex].id);
    const option = options[activeIndex];
    if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
  }
  function close() {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
  }
  function open() {
    if (!options.length) return;
    sync();
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    highlight(Math.max(0, options.findIndex(option => option.dataset.value === select.value)));
  }
  function choose(option) {
    select.value = option.dataset.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    trigger.focus({ preventScroll: true });
  }
  sync();
  select.addEventListener('change', sync);
  select.hidden = true;
  dropdown.hidden = false;
  trigger.addEventListener('click', () => menu.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    const expanded = !menu.hidden;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (!expanded) {
        open();
        if (!options.length) return;
        if (event.key === 'Home') highlight(0);
        if (event.key === 'End') highlight(options.length - 1);
      } else if (event.key === 'Enter' || event.key === ' ') choose(options[activeIndex]);
      else if (event.key === 'Home') highlight(0);
      else if (event.key === 'End') highlight(options.length - 1);
      else highlight(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === 'Tab') close();
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const match = options.findIndex(option => option.querySelector('span').textContent.toLocaleLowerCase('vi').startsWith(event.key.toLocaleLowerCase('vi')));
      if (match >= 0) { event.preventDefault(); if (!expanded) open(); highlight(match); }
    }
  });
  options.forEach((option, index) => {
    // Keep focus on the combobox until click commits the option.
    option.addEventListener('pointerdown', event => { if (event.button === 0) event.preventDefault(); });
    option.addEventListener('click', () => choose(option));
    option.addEventListener('pointermove', () => highlight(index));
  });
  document.addEventListener('pointerdown', event => { if (!dropdown.contains(event.target)) close(); });
  dropdown.addEventListener('focusout', event => { if (!dropdown.contains(event.relatedTarget)) close(); });
  dropdown.closest('dialog')?.addEventListener('close', close);
  return { sync, close };
}
initCustomSelect($('#sort'), $('#sort-dropdown'));
const widgetSelect = $('#widget-streak');
const widgetDropdown = document.createElement('div');
widgetDropdown.className = 'sort-dropdown widget-dropdown';
widgetDropdown.hidden = true;
widgetDropdown.innerHTML = '<button type="button" class="sort-trigger" id="widget-streak-trigger" role="combobox" aria-labelledby="widget-streak-label" aria-haspopup="listbox" aria-expanded="false" aria-controls="widget-streak-options"><span></span><svg class="sort-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button><div class="sort-menu" id="widget-streak-options" role="listbox" aria-labelledby="widget-streak-label" hidden></div>';
[...widgetSelect.options].forEach((nativeOption, index) => {
  const option = document.createElement('div');
  option.className = 'sort-option';
  option.id = `widget-streak-option-${index}`;
  option.setAttribute('role', 'option');
  option.dataset.value = nativeOption.value;
  const label = document.createElement('span');
  label.textContent = nativeOption.textContent;
  option.append(label, $('#sort-options .ui-icon').cloneNode(true));
  widgetDropdown.querySelector('[role="listbox"]').append(option);
});
widgetSelect.after(widgetDropdown);
const widgetCombobox = initCustomSelect(widgetSelect, widgetDropdown);
$('#widget-streak-label').htmlFor = 'widget-streak-trigger';
let activeFilter = 'all';
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi');
function filterCards() {
  const query = normalize($('#search-streaks').value.trim());
  let visible = 0;
  cards.forEach(card => {
    const days = Number(card.dataset.days);
    const matches = normalize(card.dataset.title).includes(query) && (activeFilter === 'all' || (activeFilter === 'growing' ? days < 30 : days >= 30));
    card.hidden = !matches;
    if (matches) visible++;
  });
  const filtering = query !== '' || activeFilter !== 'all';
  $('#new-card').hidden = filtering;
  $('#no-results').hidden = visible > 0 || !filtering;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(tab => {
    tab.classList.toggle('selected', tab === button);
    tab.setAttribute('aria-pressed', String(tab === button));
  });
  filterCards();
}));
$('#search-streaks').addEventListener('input', filterCards);
$('#clear-filters').addEventListener('click', () => {
  $('#search-streaks').value = '';
  $('[data-filter="all"]').click();
  $('#search-streaks').focus();
});
for (const selector of ['#sidebar-companions', '#meet-mascot', '#milestone-guide']) $(selector).addEventListener('click', () => $('#companion-dialog').showModal());
function updateCompanionPreview() {
  $('#companion-preview').className = `companion-preview ${form.elements.color.value}`;
}
form.elements.color.forEach(radio => radio.addEventListener('change', updateCompanionPreview));
const help = {
  ios: '<ol><li>Cài <a href="https://scriptable.app" target="_blank" rel="noopener">Scriptable</a> từ App Store.</li><li><a href="/downloads/StreakGarden.js" download>Tải script StreakGarden.js</a>, nhập vào Scriptable (hoặc tạo script mới và dán nội dung).</li><li>Thêm widget Scriptable trên màn hình chính. Nhấn giữ widget → Sửa widget → chọn script StreakGarden.</li><li>Dán URL streak bên dưới vào ô Parameter. Thêm widget khác với URL streak khác để theo dõi nhiều streak.</li></ol><p class="notice">iOS quyết định thời gian làm mới. Widget lưu dữ liệu gần nhất và vẫn tự tính ngày khi lần làm mới bị mất mạng; thay đổi tên và xóa cần kết nối lại.</p>',
  android: '<ol><li>Mở thư mục <b>widgets/android</b> trong source bằng Android Studio, đồng bộ Gradle và build APK.</li><li>Cài APK lên điện thoại. Nhấn giữ màn hình chính → Widget → Streak Garden.</li><li>Dán URL streak bên dưới vào màn hình cấu hình rồi chọn Lưu widget.</li><li>Lặp lại cho streak khác. Chạm widget để làm mới; giữ widget để đổi kích thước hoặc xóa.</li></ol><p class="notice">Đây là widget Android thật, cần build và cài ứng dụng phụ. Android kiểm soát lịch làm mới, thông thường khoảng 30 phút trở lên. Source kèm theo; chưa có APK dựng sẵn.</p>',
  windows: '<ol><li>Cài <a href="https://www.rainmeter.net" target="_blank" rel="noopener">Rainmeter</a> trên Windows.</li><li><a href="/downloads/StreakGarden-Windows.zip" download>Tải bộ widget Windows</a> và giải nén.</li><li>Chạy Configure.ps1 bằng PowerShell, dán URL streak bên dưới. Hướng dẫn lệnh nằm trong README của bộ tải về.</li><li>Trong Rainmeter chọn Refresh all → StreakGarden → thư mục streak → Streak.ini → Load.</li><li>Chạy Configure.ps1 thêm lần nữa với URL khác để tạo widget khác.</li></ol><p class="notice">Rainmeter hiển thị widget trên desktop, làm mới mỗi phút khi máy chủ truy cập được. Hỗ trợ Windows; đây không phải widget của bảng Win+W.</p>',
  pwa: '<ol><li>Mở URL streak bằng nút bên dưới.</li><li>iPhone: dùng Safari → Chia sẻ → Thêm vào màn hình chính.</li><li>Android: menu trình duyệt → Thêm vào màn hình chính hoặc Cài đặt ứng dụng.</li><li>Máy tính: dùng chức năng Cài đặt trang dưới dạng ứng dụng / Tạo lối tắt của trình duyệt.</li></ol><p class="notice">Đây là lối tắt mở trang streak. Số ngày chỉ hiển thị khi mở, không xuất hiện trên biểu tượng. Khả năng cài nhiều lối tắt phụ thuộc trình duyệt. Cài PWA cần HTTPS hoặc localhost.</p>'
};
function openWidgets(id) {
  if (!cards.length) { toast('Tạo streak đầu tiên để thêm widget.'); openForm(); return; }
  $('#widget-streak').value = id || cards[0].dataset.id;
  $('#widget-origin').value = preferences.get('streak-widget-origin') || document.body.dataset.appUrl || location.origin;
  renderWidget(); $('#widget-dialog').showModal();
}
function renderWidget() {
  widgetCombobox.sync();
  const id = $('#widget-streak').value;
  const card = cards.find(card => card.dataset.id === id);
  if (!card) return;
  $('#widget-preview-days').textContent = card.dataset.days;
  $('#widget-preview-title').textContent = card.dataset.title;
  $('.widget-mini').className = `widget-mini ${card.dataset.color}`;
  $('.widget-mini > .mascot')?.remove();
  $('.widget-mini').append(card.querySelector('.card-mascot .mascot').cloneNode(true));
  $('#widget-instructions').innerHTML = help[platform];
  const base = $('#widget-origin').value.trim().replace(/\/$/, '');
  let valid = false;
  try { const url = new URL(base); valid = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && url.pathname === '/'; } catch {}
  $('#widget-url').value = valid ? `${base}/widget/${id}` : '';
  $('#open-widget').href = valid ? `${base}/widget/${id}` : '#';
  $('#copy-widget').disabled = !valid;
  $('#widget-message').textContent = valid ? '' : 'Nhập URL gốc hợp lệ, ví dụ https://streak.example.com (không kèm đường dẫn).';
  if (valid) preferences.set('streak-widget-origin', base);
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
    if (data.some(item => Number(cards.find(c => c.dataset.id === item.id).dataset.days) !== item.days)) { location.reload(); return; }
    let total = 0, longest = 0;
    data.forEach(item => { const card = cards.find(c => c.dataset.id === item.id); card.dataset.days = item.days; card.querySelector('.day-count strong').textContent = item.days; total += item.days; longest = Math.max(longest, item.days); });
    $('#total-days').firstChild.textContent = total;
    $('#longest').firstChild.textContent = longest;
    if (data[0] && document.body.dataset.today !== data[0].today) location.reload();
    $('#connection-state').textContent = '';
  } catch { $('#connection-state').textContent = 'Mất kết nối · Đang hiển thị dữ liệu gần nhất.'; }
}
setInterval(refresh, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
