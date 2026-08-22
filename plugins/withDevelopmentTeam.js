// 무료 Personal Team — prebuild 재실행 후에도 DEVELOPMENT_TEAM 유지
// TEAM_ID: Xcode 첫 빌드 성공 후 pbxproj에서 추출한 값으로 교체
const { withXcodeProject } = require('expo/config-plugins');

const TEAM_ID = process.env.ARIADM_TEAM_ID || '';

const withDevelopmentTeam = (config) => {
  return withXcodeProject(config, (config) => {
    if (TEAM_ID) {
      config.modResults.updateBuildProperty('DEVELOPMENT_TEAM', TEAM_ID);
    }
    return config;
  });
};

module.exports = withDevelopmentTeam;
