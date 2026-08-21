const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const pagePath = 'site/campaign/practice-under-pressure.html';
const cssPath = 'site/assets/found-the-flyer-v2.css';
const jsPath = 'site/assets/found-the-flyer.js';
const videoPath = 'site/assets/campaign-videos/practice-under-pressure-welcome-2026-08.mp4';
const posterPath = 'site/assets/campaign-videos/practice-under-pressure-welcome-poster-2026-08.webp';
const captionsPath = 'site/assets/campaign-videos/practice-under-pressure-welcome-2026-08.vtt';

test('practice-under-pressure hero uses the supplied responsive welcome video', () => {
  const page = read(pagePath);
  assert.match(page, /<video[^>]*class="ff-hero-video"[^>]*autoplay[^>]*muted[^>]*loop[^>]*playsinline[^>]*controls/);
  assert.match(page, /poster="\.\.\/assets\/campaign-videos\/practice-under-pressure-welcome-poster-2026-08\.webp"/);
  assert.match(page, /<source src="\.\.\/assets\/campaign-videos\/practice-under-pressure-welcome-2026-08\.mp4" type="video\/mp4">/);
  assert.match(page, /<track[^>]*kind="captions"[^>]*srclang="en"[^>]*default>/);
  assert.match(page, /Joao Crus welcomes children, adults, and complete beginners/);
  assert.doesNotMatch(page, /adults-joao-coaching-hero-2026-07\.webp" width="1280" height="960" alt="Joao Crus coaching adult/);
});

test('hero video assets and corrected captions are present', () => {
  const video = path.join(root, videoPath);
  const poster = path.join(root, posterPath);
  const captions = read(captionsPath);
  assert.ok(fs.statSync(video).size > 1_000_000);
  assert.ok(fs.statSync(poster).size > 10_000);
  assert.match(captions, /^WEBVTT/m);
  assert.match(captions, /Joao Crus/);
  assert.match(captions, /Carlson Gracie/);
  assert.match(captions, /stay calm\s+under pressure/);
  assert.doesNotMatch(captions, /Castle Gracie|calm and the pressure/);
});

test('hero video styling preserves the portrait frame and branded captions', () => {
  const css = read(cssPath);
  assert.match(css, /\.ff-video-poster\.ff-video-portrait\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16/s);
  assert.match(css, /\.ff-hero-video::cue\s*\{[^}]*background:\s*rgba\(16,\s*16,\s*16,/s);
  assert.match(css, /\.ff-hero-video::cue\s*\{[^}]*color:\s*var\(--ff-yellow\)/s);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.ff-video-poster\.ff-video-portrait/);
});

test('hero video respects reduced motion and emits consent-aware analytics', () => {
  const js = read(jsPath);
  assert.match(js, /\[data-hero-video\]/);
  assert.match(js, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /practice_under_pressure_welcome/);
  assert.match(js, /video_start/);
  assert.match(js, /video_complete/);
});
