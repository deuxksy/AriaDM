// 무료 Apple ID는 Push Notifications capability를 지원하지 않음
// AriaDM은 로컬 알림(expo-notifications)만 사용 — APNs 불필요
// expo-notifications가 aps-environment를 자동 추가하는 것을 역전
const { withEntitlementsPlist } = require('expo/config-plugins');

const withNoApsEnvironment = (config) => {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};

module.exports = withNoApsEnvironment;
