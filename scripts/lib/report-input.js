const LOW_SIGNAL_SHORT_POSTS = new Set([
  'here we go',
  'here we go!',
  'wow',
  'wow!',
  'nice',
  'nice!',
  'lol',
  'lol!'
]);

function normalizeText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function stripUrls(value) {
  return value.replace(/https?:\/\/\S+/gi, '').trim();
}

function isObviouslyLowSignalTweet(tweet) {
  if (tweet.isQuote) {
    return false;
  }

  const text = normalizeText(stripUrls(tweet.text ?? ''));

  if (!text) {
    return true;
  }

  if (text.length > 24) {
    return false;
  }

  return LOW_SIGNAL_SHORT_POSTS.has(text.toLowerCase());
}

function prepareXInput(feed = {}) {
  const builders = (feed.x ?? [])
    .map((builder) => {
      const tweets = (builder.tweets ?? []).filter((tweet) => !isObviouslyLowSignalTweet(tweet));

      if (tweets.length === 0) {
        return null;
      }

      return {
        name: builder.name ?? null,
        handle: builder.handle ?? null,
        bio: builder.bio ?? null,
        tweets: tweets.map((tweet) => ({
          id: tweet.id,
          text: normalizeText(tweet.text ?? ''),
          url: tweet.url ?? null,
          createdAt: tweet.createdAt ?? null,
          isQuote: Boolean(tweet.isQuote),
          quotedTweetId: tweet.quotedTweetId ?? null
        }))
      };
    })
    .filter(Boolean);

  return {
    generatedAt: feed.generatedAt ?? null,
    builders,
    isEmpty: builders.length === 0
  };
}

function prepareListSection(feed = {}, key) {
  const items = Array.isArray(feed[key]) ? feed[key] : [];

  return {
    generatedAt: feed.generatedAt ?? null,
    isEmpty: items.length === 0,
    items
  };
}

export function prepareReportInput(snapshot = {}) {
  return {
    source: snapshot.source ?? null,
    fetchedAt: snapshot.fetchedAt ?? null,
    feedGeneratedAt: snapshot.feedGeneratedAt ?? null,
    sourceStats: snapshot.stats ?? {
      builders: 0,
      tweets: 0,
      podcasts: 0,
      blogs: 0
    },
    x: prepareXInput(snapshot.feeds?.x),
    podcasts: prepareListSection(snapshot.feeds?.podcasts, 'podcasts'),
    blogs: prepareListSection(snapshot.feeds?.blogs, 'blogs')
  };
}
