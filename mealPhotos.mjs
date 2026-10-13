// Best-effort meal photo lookup using Wikimedia Commons. Search results are
// cached on success; transient failures are not pinned, so later requests retry.
const mealImageCache = new Map();

function cleanMealQuery(value) {
  return typeof value === 'string'
    ? value.trim().slice(0, 100).replace(/[<>\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
}

function plainMetadata(value, max = 180) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim().slice(0, max);
}

function imageExtValue(extmetadata, key) {
  const entry = extmetadata && extmetadata[key];
  return plainMetadata(entry && typeof entry === 'object' ? entry.value : entry, 180);
}

export async function lookupMealPhoto(rawQuery) {
  const query = cleanMealQuery(rawQuery);
  if (query.length < 2) return null;
  const cacheKey = query.toLowerCase();
  const cached = mealImageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = (async () => {
    try {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: '6',
        gsrlimit: '12',
        prop: 'imageinfo',
        iiprop: 'url|mime|extmetadata',
        iiurlwidth: '760',
        format: 'json',
        origin: '*',
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'PLAYFORGE/2.8 (food-photo search; source and licence attribution displayed in app)',
        },
        signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const pages = Object.values(payload?.query?.pages || {});
      const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 2 && !['with', 'and', 'the', 'food', 'meal', 'dish', 'home', 'style'].includes(token));
      const candidates = pages.map(page => {
        if (!page || typeof page !== 'object') return null;
        const info = Array.isArray(page.imageinfo) ? page.imageinfo[0] : null;
        if (!info || !info.thumburl || !info.descriptionurl || !String(info.mime || '').startsWith('image/')) return null;
        if (/svg|diagram|logo|icon|map|chart|illustration/i.test(String(info.mime) + ' ' + String(page.title || ''))) return null;
        const thumbUrl = String(info.thumburl);
        if (!thumbUrl.startsWith('https://upload.wikimedia.org/')) return null;
        const title = String(page.title || '').replace(/^File:/i, '').replace(/[_-]+/g, ' ').toLowerCase();
        const titleWords = new Set(title.split(/[^a-z0-9]+/).filter(Boolean));
        const score = tokens.reduce((sum, token) => sum + (titleWords.has(token) ? 3 : title.includes(token) ? 1 : 0), 0);
        const meta = info.extmetadata || {};
        return {
          photoUrl: thumbUrl,
          sourceUrl: String(info.descriptionurl).startsWith('https://commons.wikimedia.org/') ? String(info.descriptionurl) : 'https://commons.wikimedia.org/',
          provider: 'Wikimedia Commons',
          title: plainMetadata(page.title, 150).replace(/^File:/i, ''),
          creator: imageExtValue(meta, 'Artist') || imageExtValue(meta, 'Credit') || 'Original contributor shown on source page',
          license: imageExtValue(meta, 'LicenseShortName') || 'Licence listed on source page',
          licenseUrl: imageExtValue(meta, 'LicenseUrl'),
          score,
        };
      }).filter(Boolean).sort((a, b) => b.score - a.score);
      const best = candidates[0];
      if (!best || (tokens.length >= 2 && best.score < 2)) return null;
      const { score, ...result } = best;
      return result;
    } catch {
      // Photos are enhancement-only. A failure makes the client show a labelled fallback.
      return null;
    }
  })();

  if (mealImageCache.size > 500) mealImageCache.delete(mealImageCache.keys().next().value);
  const cacheEntry = { expiresAt: Date.now() + 12 * 60 * 60 * 1000, promise };
  mealImageCache.set(cacheKey, cacheEntry);
  const result = await promise;
  if (!result && mealImageCache.get(cacheKey) === cacheEntry) mealImageCache.delete(cacheKey);
  return result;
}
