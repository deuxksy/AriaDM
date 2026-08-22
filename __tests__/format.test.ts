import { formatBytes, formatSpeed, formatEta, progressPercent, downloadName } from '../shared/format';

test('formatBytes 단위 변환', () => {
  expect(formatBytes(0)).toBe('0 B');
  expect(formatBytes(872 * 1024)).toBe('872 KB');
  expect(formatBytes(1.5 * 1024 ** 3)).toBe('1.5 GB');
});

test('formatSpeed', () => {
  expect(formatSpeed(1024 * 1024)).toBe('1.0 MB/s');
});

test('formatEta', () => {
  expect(formatEta(0)).toBe('-');
  expect(formatEta(45)).toBe('45s');
  expect(formatEta(185)).toBe('3m 5s');
  expect(formatEta(11100)).toBe('3h 5m');
});

test('progressPercent', () => {
  expect(progressPercent(50, 200)).toBe(25);
  expect(progressPercent(10, 0)).toBe(0);
  expect(progressPercent(300, 200)).toBe(100);
});

test('downloadName 우선순위', () => {
  expect(downloadName({ gid: 'g1', bittorrent: { info: { name: '토렌트.torrent' } }, files: [{ path: '/downloads/x' }] })).toBe('토렌트.torrent');
  expect(downloadName({ gid: 'g1', files: [{ path: '/downloads/iso/file.iso' }] })).toBe('file.iso');
  expect(downloadName({ gid: 'abc123' })).toBe('abc123');
});
