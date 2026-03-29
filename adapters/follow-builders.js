const DEFAULT_BASE_URLS = [
  'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main',
  'https://cdn.jsdelivr.net/gh/zarazhangrui/follow-builders@main'
];

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchFollowBuildersFeeds({
  baseUrl,
  baseUrls = baseUrl ? [baseUrl] : DEFAULT_BASE_URLS,
  fetchImpl = fetch
} = {}) {
  let lastError;

  for (const candidateBaseUrl of baseUrls) {
    try {
      const [x, podcasts, blogs] = await Promise.all([
        fetchJson(`${candidateBaseUrl}/feed-x.json`, fetchImpl),
        fetchJson(`${candidateBaseUrl}/feed-podcasts.json`, fetchImpl),
        fetchJson(`${candidateBaseUrl}/feed-blogs.json`, fetchImpl)
      ]);

      return {
        source: 'follow-builders',
        fetchedAt: new Date().toISOString(),
        feedGeneratedAt: x.generatedAt || podcasts.generatedAt || blogs.generatedAt || null,
        feeds: {
          x,
          podcasts,
          blogs
        },
        stats: {
          builders: x.x?.length || 0,
          tweets: (x.x || []).reduce((sum, builder) => sum + (builder.tweets?.length || 0), 0),
          podcasts: podcasts.podcasts?.length || 0,
          blogs: blogs.blogs?.length || 0
        }
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  };
}
