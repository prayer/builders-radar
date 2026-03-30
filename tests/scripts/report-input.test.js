import test from 'node:test';
import assert from 'node:assert/strict';

test('prepareReportInput removes obviously low-signal short x posts', async () => {
  const mod = await import('../../scripts/lib/report-input.js');
  const prepared = mod.prepareReportInput({
    source: 'follow-builders',
    feeds: {
      x: {
        x: [
          {
            name: 'Swyx',
            handle: 'swyx',
            tweets: [
              {
                id: 'tweet-1',
                text: 'Here we go',
                url: 'https://x.com/swyx/status/tweet-1',
                isQuote: false
              },
              {
                id: 'tweet-2',
                text: 'Context windows are now a product surface for enterprise agents.',
                url: 'https://x.com/swyx/status/tweet-2',
                isQuote: false
              }
            ]
          }
        ]
      },
      podcasts: { podcasts: [] },
      blogs: { blogs: [] }
    },
    stats: {
      builders: 1,
      tweets: 2,
      podcasts: 0,
      blogs: 0
    }
  });

  assert.equal(prepared.x.builders.length, 1);
  assert.equal(prepared.x.builders[0].tweets.length, 1);
  assert.equal(prepared.x.builders[0].tweets[0].id, 'tweet-2');
});

test('prepareReportInput keeps quote tweets by default', async () => {
  const mod = await import('../../scripts/lib/report-input.js');
  const prepared = mod.prepareReportInput({
    source: 'follow-builders',
    feeds: {
      x: {
        x: [
          {
            name: 'Amjad Masad',
            handle: 'amasad',
            tweets: [
              {
                id: 'tweet-quote',
                text: 'Wow!',
                url: 'https://x.com/amasad/status/tweet-quote',
                isQuote: true,
                quotedTweetId: 'quoted-1'
              }
            ]
          }
        ]
      },
      podcasts: { podcasts: [] },
      blogs: { blogs: [] }
    },
    stats: {
      builders: 1,
      tweets: 1,
      podcasts: 0,
      blogs: 0
    }
  });

  assert.equal(prepared.x.builders[0].tweets.length, 1);
  assert.equal(prepared.x.builders[0].tweets[0].id, 'tweet-quote');
});

test('prepareReportInput preserves substantive original x posts', async () => {
  const mod = await import('../../scripts/lib/report-input.js');
  const prepared = mod.prepareReportInput({
    source: 'follow-builders',
    feeds: {
      x: {
        x: [
          {
            name: 'Aaron Levie',
            handle: 'levie',
            tweets: [
              {
                id: 'tweet-1',
                text: 'Context is the hard part of enterprise agents because permissions and data access define what the agent can actually do.',
                url: 'https://x.com/levie/status/tweet-1',
                isQuote: false
              }
            ]
          }
        ]
      },
      podcasts: { podcasts: [] },
      blogs: { blogs: [] }
    },
    stats: {
      builders: 1,
      tweets: 1,
      podcasts: 0,
      blogs: 0
    }
  });

  assert.equal(prepared.x.builders.length, 1);
  assert.equal(prepared.x.builders[0].tweets.length, 1);
  assert.match(prepared.x.builders[0].tweets[0].text, /permissions and data access/);
});

test('prepareReportInput marks empty podcasts and blogs sections explicitly', async () => {
  const mod = await import('../../scripts/lib/report-input.js');
  const prepared = mod.prepareReportInput({
    source: 'follow-builders',
    feeds: {
      x: { x: [] },
      podcasts: { podcasts: [] },
      blogs: { blogs: [] }
    },
    stats: {
      builders: 0,
      tweets: 0,
      podcasts: 0,
      blogs: 0
    }
  });

  assert.equal(prepared.podcasts.isEmpty, true);
  assert.equal(prepared.blogs.isEmpty, true);
  assert.deepEqual(prepared.podcasts.items, []);
  assert.deepEqual(prepared.blogs.items, []);
});
