#!/bin/sh
# heritage 운영 인스턴스 대상 통합 테스트 — secret은 런타임에 ssh로 조회 (repo 저장 금지)
# 사용: pnpm it:heritage
set -e
SECRET=$(ssh heritage "docker exec aria2 sh -c 'grep ^rpc-secret= /config/aria2.conf | cut -d= -f2'" | tr -d '\r\n')
if [ -z "$SECRET" ]; then
  echo "FAIL: heritage rpc-secret 조회 실패 (ssh heritage 접근 확인)" >&2
  exit 1
fi
ARIA2_IT_URL=http://100.96.115.19:6800 \
ARIA2_IT_FILE='https://speed.cloudflare.com/__down?bytes=1048576' \
ARIA2_IT_SECRET="$SECRET" \
  pnpm exec jest -c jest.config.integration.js --runInBand
