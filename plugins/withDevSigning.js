// 개발 빌드 서명·스크립트 설정 — prebuild 재실행 후에도 유지
// 1. DEVELOPMENT_TEAM: 무료 Personal Team (7G92N4S63X)
// 2. ENABLE_USER_SCRIPT_SANDBOXING=NO: react-native-xcode.sh가 앱 번들에
//    ip.txt를 기록하는데 샌드박싱이 이를 거부해 Debug 실기기 빌드가 실패함
const { withXcodeProject } = require('expo/config-plugins');

const TEAM_ID = '7G92N4S63X';

const withDevSigning = (config) => {
  return withXcodeProject(config, (config) => {
    config.modResults.updateBuildProperty('DEVELOPMENT_TEAM', TEAM_ID);
    config.modResults.updateBuildProperty('ENABLE_USER_SCRIPT_SANDBOXING', 'NO');
    return config;
  });
};

module.exports = withDevSigning;
