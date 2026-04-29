import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = 'C:/Users/s1598/Downloads/桔梗野バイオレッツ少年野球チーム';

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

test('main landing page contains the approved redesign section headings', () => {
  const template = read('src/app.component.html');

  for (const expected of [
    '一球に想いを込めて、',
    '新入部員',
    '大歓迎',
    'チーム紹介',
    'OUR VALUES',
    'MEMBERS',
    'ACHIEVEMENTS',
    'SCHEDULE',
    'MEMBER\'S VOICE',
  ]) {
    assert.match(template, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('header matches the approved navigation labels', () => {
  const template = read('src/components/header/header.component.html');
  const component = read('src/components/header/header.component.ts');
  const headerSource = `${template}\n${component}`;

  for (const expected of [
    'ホーム',
    'チーム紹介',
    '活動内容',
    'スケジュール',
    '大会実績',
    '保護者の声',
    '入団案内',
    'お問い合わせ',
    '体験入部はこちら',
  ]) {
    assert.match(headerSource, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('intro and footer contain the redesigned brand framing', () => {
  const intro = read('src/components/intro-animation/intro-animation.component.html');
  const footer = read('src/components/footer/footer.component.html');

  assert.match(intro, /KIKYONO/i);
  assert.match(intro, /VIOLETS/i);
  assert.match(footer, /violets\.baseball@gmail\.com/i);
  assert.match(footer, /体験入部はこちら/);
});

test('main page uses replaceable wireframes instead of fixed photo elements', () => {
  const template = read('src/app.component.html');
  const component = read('src/app.component.ts');
  const source = `${template}\n${component}`;

  assert.doesNotMatch(template, /<img\b/i);
  assert.match(template, /photo-wireframe/);
  assert.match(source, /差し替え用/);
});
