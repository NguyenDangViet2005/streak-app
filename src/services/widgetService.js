import { getStreak } from './streakService.js';

export async function getWidgetManifest(id, timeZone) {
  const streak = await getStreak(id, timeZone);
  const widgetUrl = `/widget/${id}`;

  return {
    id: widgetUrl,
    name: streak.title,
    short_name: streak.title.slice(0, 20),
    start_url: widgetUrl,
    scope: '/',
    display: 'standalone',
    background_color: '#faf8f4',
    theme_color: '#faf8f4',
    icons: [192, 512].map(size => ({
      src: `/icons/icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any maskable'
    }))
  };
}
