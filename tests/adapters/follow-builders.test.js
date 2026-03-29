import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';

function createJsonServer(routes) {
  return http.createServer((request, response) => {
    const payload = routes[request.url];

    if (!payload) {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'not found' }));
      return;
    }

    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(payload));
  });
}

test('fetchFollowBuildersFeeds downloads the three upstream feeds and summarizes stats', async () => {
  let mod;

  try {
    mod = await import('../../adapters/follow-builders.js');
  } catch (error) {
    assert.fail(`follow-builders adapter is missing: ${error.message}`);
  }

  const server = createJsonServer({
    '/feed-x.json': {
      generatedAt: '2026-03-29T06:00:00.000Z',
      x: [
        {
          name: 'Builder A',
          tweets: [
            { id: '1', text: 'hello', url: 'https://x.com/a/status/1' }
          ]
        }
      ]
    },
    '/feed-podcasts.json': {
      generatedAt: '2026-03-29T06:00:00.000Z',
      podcasts: [
        {
          id: 'pod-1',
          name: 'Latent Space',
          url: 'https://youtube.com/watch?v=pod-1',
          transcript: 'agents agents agents'
        }
      ]
    },
    '/feed-blogs.json': {
      generatedAt: '2026-03-29T06:00:00.000Z',
      blogs: [
        {
          id: 'blog-1',
          title: 'Anthropic engineering update',
          url: 'https://example.com/blog-1',
          content: 'engineering details'
        }
      ]
    }
  });

  server.listen(0);
  await once(server, 'listening');

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const result = await mod.fetchFollowBuildersFeeds({ baseUrl });

    assert.equal(result.source, 'follow-builders');
    assert.equal(result.stats.builders, 1);
    assert.equal(result.stats.tweets, 1);
    assert.equal(result.stats.podcasts, 1);
    assert.equal(result.stats.blogs, 1);
    assert.equal(result.feeds.x.x[0].name, 'Builder A');
    assert.equal(result.feeds.podcasts.podcasts[0].id, 'pod-1');
    assert.equal(result.feeds.blogs.blogs[0].id, 'blog-1');
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('fetchFollowBuildersFeeds falls back to the next base URL when the first source fails', async () => {
  const mod = await import('../../adapters/follow-builders.js');
  const server = createJsonServer({
    '/feed-x.json': {
      generatedAt: '2026-03-29T06:00:00.000Z',
      x: []
    },
    '/feed-podcasts.json': {
      generatedAt: '2026-03-29T06:00:00.000Z',
      podcasts: []
    },
    '/feed-blogs.json': {
      generatedAt: '2026-03-29T06:00:00.000Z',
      blogs: []
    }
  });

  server.listen(0);
  await once(server, 'listening');

  const address = server.address();
  const fallbackBaseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const result = await mod.fetchFollowBuildersFeeds({
      baseUrls: ['http://127.0.0.1:1', fallbackBaseUrl]
    });

    assert.equal(result.stats.builders, 0);
    assert.equal(result.stats.tweets, 0);
    assert.equal(result.feedGeneratedAt, '2026-03-29T06:00:00.000Z');
  } finally {
    server.close();
    await once(server, 'close');
  }
});
