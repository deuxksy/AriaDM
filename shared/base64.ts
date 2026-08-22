const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Hermes에는 btoa가 없어 자체 인코딩 — torrent 파일 업로드용
export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += CHARS[b0 >> 2];
    out += CHARS[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)];
    if (b1 === undefined) { out += '=='; break; }
    out += CHARS[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)];
    if (b2 === undefined) { out += '='; break; }
    out += CHARS[b2 & 63];
  }
  return out;
}
