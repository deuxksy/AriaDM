import { Aria2Connection } from '../../core/rpc/connection';
import { Aria2 } from '../../core/rpc/methods';
import { nodeFetch } from '../helpers/nodeFetch';

// pnpm it:docker 으로만 실행 — docker compose의 실제 aria2 대상
const URL = process.env.ARIA2_IT_URL;
const SECRET = process.env.ARIA2_IT_SECRET;
// it:heritage 실행 시 공개 URL 주입 — 기본은 compose 내부 fileserver
const FILE_URL = process.env.ARIA2_IT_FILE ?? 'http://fileserver/testfile.bin';

// RN preset(@react-native/jest-preset)이 describe를 교체해 skipIf 부재 — 조건부 skip으로 대체
const d = !URL || !SECRET ? describe.skip : describe;

d('aria2 통합 (docker)', () => {
  let c: Aria2Connection;
  beforeAll(() => {
    // jest-expo fetch는 네트워크를 수행하지 않으므로 node http 구현 주입
    c = new Aria2Connection({ url: URL!, secret: SECRET! }, { httpOnly: true, fetchImpl: nodeFetch });
    c.start();
  });
  afterAll(() => c.stop());

  test('getVersion', async () => {
    const v = await Aria2.getVersion(c);
    expect(v).toMatch(/^1\.\d+/);
  });

  test('addUri → tellActive → pause → unpause → remove', async () => {
    // 200K 제한 — 1MB 로컬 전송이 즉시 완료되어 pause 검증이 flake 되는 것 방지 (~5s)
    // dir 생략 — aria2 기본 다운로드 디렉토리 사용 (docker:/downloads, heritage:운영 설정)
    // out 고유 접미사 — 이전 실행의 완료 파일과 이름이 겹치면 addUri가 즉시 complete 되어
    // pause가 "cannot be paused now"로 실패함 (heritage 등 영구 스택 재실행 대비)
    const out = `it-${Date.now().toString(36)}.bin`;
    const gid = await Aria2.addUri(c, [FILE_URL], {
      out,
      'max-download-limit': '200K',
    });
    expect(gid).toMatch(/^[a-f0-9]{16}$/);

    await expect(Aria2.tellStatus(c, gid)).resolves.toMatchObject({ gid });
    // 다운로드 시작 대기
    await new Promise((r) => setTimeout(r, 1000));
    await Aria2.pause(c, gid);
    expect((await Aria2.tellStatus(c, gid)).status).toBe('paused');
    await Aria2.unpause(c, gid);
    // 완료 대기 (1MB 로컬 — 수 초 내)
    for (let i = 0; i < 30; i++) {
      const st = await Aria2.tellStatus(c, gid);
      if (st.status === 'complete') break;
      await new Promise((r) => setTimeout(r, 500));
    }
    expect((await Aria2.tellStatus(c, gid)).status).toBe('complete');

    await Aria2.removeDownloadResult(c, gid);
    await expect(Aria2.tellStatus(c, gid)).rejects.toMatchObject({ code: 1 });
  }, 30000); // 완료 폴링 최대 15s + pause/unpause 대기 — jest 기본 5s 초과

  test('tellStopped 목록 조회', async () => {
    const list = await Aria2.tellStopped(c, 0, 10);
    expect(Array.isArray(list)).toBe(true);
  });

  test('getGlobalStat', async () => {
    const s = await Aria2.getGlobalStat(c);
    expect(s).toHaveProperty('downloadSpeed');
    expect(s).toHaveProperty('numStopped');
  });
});
