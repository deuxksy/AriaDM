import { bytesToBase64 } from '../shared/base64';

test('RFC 4648 벡터', () => {
  const enc = (s: string) => bytesToBase64(new TextEncoder().encode(s));
  expect(enc('')).toBe('');
  expect(enc('f')).toBe('Zg==');
  expect(enc('fo')).toBe('Zm8=');
  expect(enc('foo')).toBe('Zm9v');
  expect(enc('foob')).toBe('Zm9vYg==');
  expect(enc('fooba')).toBe('Zm9vYmE=');
  expect(enc('foobar')).toBe('Zm9vYmFy');
});
