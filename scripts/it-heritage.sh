#!/bin/sh
# heritage 운영 인스턴스 대상 통합 테스트 — secret은 런타임에 ssh로 조회 (repo 저장 금지)
# 사용: pnpm it:heritage
set -e
SECRET=$(ssh heritage "docker exec aria2 sh -c 'grep ^rpc-secret= /config/aria2.conf | cut -d= -f2'" | tr -d '\r\n')
if [ -z "$SECRET" ]; then
  echo "FAIL: heritage rpc-secret 조회 실패 (ssh heritage 접근 확인)" >&2
  exit 1
fi
rc=0
ARIA2_IT_URL=http://100.96.115.19:6800 \
ARIA2_IT_FILE='https://speed.cloudflare.com/__down?bytes=1048576' \
ARIA2_IT_SECRET="$SECRET" \
  pnpm exec jest -c jest.config.integration.js --runInBand || rc=$?
# 테스트 잔여물 정리 — jest 성패와 무관하게 항상 수행 (set -e로 즉시 exit 않도록 rc 보존)
# 1) 디스크 파일: it-*.bin(테스트 out 지정명) + __down*(ARIA2_IT_FILE URL 파생명) — complete 도달 시 생성
ssh heritage "rm -f /mnt/data2/torrent/downloads/aria/it-*.bin /mnt/data2/torrent/downloads/aria/__down*"
# 2) 대기열 항목: active 진입 전에는 파일 없이 큐에만 남음 — it- 경로 항목을 remove
#    제거마다 큐가 줄어드므로 offset 0 재스캔, 매칭 없으면 종료 (이상 시 대비 최대 5 pass)
pass=0
while [ "$pass" -lt 5 ]; do
  pass=$((pass + 1))
  gids=$(curl -s -X POST http://100.96.115.19:6800/jsonrpc -H 'Content-Type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"id\":\"c\",\"method\":\"aria2.tellWaiting\",\"params\":[\"token:$SECRET\",0,500,[\"gid\",\"files\"]]}" \
    | python3 -c "import json,sys; print(' '.join(d['gid'] for d in json.load(sys.stdin).get('result',[]) if d.get('files') and '/it-' in d['files'][0]['path']))")
  [ -z "$gids" ] && break
  for gid in $gids; do
    echo "cleanup: aria2.remove $gid"
    curl -s -X POST http://100.96.115.19:6800/jsonrpc -H 'Content-Type: application/json' \
      -d "{\"jsonrpc\":\"2.0\",\"id\":\"c\",\"method\":\"aria2.remove\",\"params\":[\"token:$SECRET\",\"$gid\"]}" > /dev/null
  done
done
exit $rc
