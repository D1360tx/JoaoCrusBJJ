const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const pagePath = 'site/campaign/practice-under-pressure.html';
const cssPath = 'site/assets/practice-under-pressure.css';
const jsPath = 'site/assets/practice-under-pressure.js';
const videoPath = 'site/assets/campaign-videos/practice-under-pressure-welcome-2026-08-v2.mp4';
const posterPath = 'site/assets/campaign-videos/practice-under-pressure-welcome-poster-2026-08.webp';
const captionsPath = 'site/assets/campaign-videos/practice-under-pressure-welcome-2026-08-v2.vtt';
const htaccessPath = 'deploy/bluehost/.htaccess';

test('practice-under-pressure hero uses the supplied responsive welcome video', () => {
  const page = read(pagePath);
  assert.match(page, /<video[^>]*class="ff-hero-video"[^>]*autoplay[^>]*muted[^>]*loop[^>]*playsinline[^>]*controls/);
  assert.match(page, /poster="\.\.\/assets\/campaign-videos\/practice-under-pressure-welcome-poster-2026-08\.webp"/);
  assert.match(page, /<source src="\.\.\/assets\/campaign-videos\/practice-under-pressure-welcome-2026-08-v2\.mp4" type="video\/mp4">/);
  assert.doesNotMatch(page, /practice-under-pressure-welcome-2026-08\.(?:mp4|vtt)/);
  assert.match(page, /<track[^>]*kind="captions"[^>]*srclang="en"[^>]*default>/);
  assert.match(page, /Joao Crus welcomes children, adults, and complete beginners/);
  assert.doesNotMatch(page, /adults-joao-coaching-hero-2026-07\.webp" width="1280" height="960" alt="Joao Crus coaching adult/);
});

test('practice-under-pressure page and runtime contain no flyer wording or identifiers', () => {
  const page = read(pagePath);
  const css = read(cssPath);
  const js = read(jsPath);
  assert.doesNotMatch(page, /flyer/i);
  assert.doesNotMatch(css, /flyer/i);
  assert.doesNotMatch(js, /flyer/i);
  assert.match(page, /data-form-id="practice_under_pressure"/);
  assert.match(page, /data-lead-type="class_inquiry"/);
});

test('hero video assets and post-intro captions are present', () => {
  const video = path.join(root, videoPath);
  const poster = path.join(root, posterPath);
  const captions = read(captionsPath);
  const transcript = captions
    .replace(/\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}\.\d{3}/g, ' ')
    .replace(/\s+/g, ' ');
  assert.ok(fs.statSync(video).size > 1_000_000);
  assert.ok(fs.statSync(poster).size > 10_000);
  assert.match(captions, /^WEBVTT/m);
  assert.doesNotMatch(captions, /00:00\.000/);
  assert.match(captions, /00:17\.960/);
  assert.match(transcript, /children and adults a place to practice/);
  assert.match(transcript, /setting boundaries/);
  assert.match(transcript, /staying calm under pressure/);
  assert.doesNotMatch(transcript, /flyer|Castle Gracie|custom Gracie|calm and the pressure/i);
});

test('hero video styling preserves the portrait frame and branded captions', () => {
  const css = read(cssPath);
  assert.match(css, /\.ff-video-poster\.ff-video-portrait\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16/s);
  assert.match(css, /\.ff-hero-video::cue\s*\{[^}]*background:\s*rgba\(16,\s*16,\s*16,/s);
  assert.match(css, /\.ff-hero-video::cue\s*\{[^}]*color:\s*var\(--ff-yellow\)/s);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.ff-video-poster\.ff-video-portrait/);
});

test('caption timestamps remain valid through the full video', () => {
  const captions = read(captionsPath);
  const timecodes = captions.match(/\d{2}:\d{2}\.\d{3}/g) || [];
  assert.ok(timecodes.length > 0, 'expected WebVTT timestamps');
  timecodes.forEach((timecode) => {
    const seconds = Number(timecode.split(':')[1]);
    assert.ok(seconds < 60, `invalid seconds component in ${timecode}`);
  });
  assert.match(captions, /01:06\.740/);
});

test('Bluehost serves WebVTT captions with the required MIME type', () => {
  const htaccess = read(htaccessPath);
  assert.match(htaccess, /^\s*AddType\s+text\/vtt\s+\.vtt$/m);
});

test('hero video respects reduced motion and emits consent-aware analytics', () => {
  const js = read(jsPath);
  assert.match(js, /\[data-hero-video\]/);
  assert.match(js, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /practice_under_pressure_welcome/);
  assert.match(js, /video_start/);
  assert.match(js, /video_complete/);
});
