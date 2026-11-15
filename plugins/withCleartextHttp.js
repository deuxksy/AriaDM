// aria2 JSON-RPC 데몬은 http:// 연결이 일반적 — Android 9+는 cleartext 기본 차단
// Expo 57은 app.json usesCleartextTraffic 키를 지원하지 않아 manifest 직접 주입으로 처리
// (iOS는 infoPlist NSAppTransportSecurity NSAllowsArbitraryLoads로 동일 허용)
const { withAndroidManifest } = require('expo/config-plugins');

const withCleartextHttp = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return config;
  });
};

module.exports = withCleartextHttp;
