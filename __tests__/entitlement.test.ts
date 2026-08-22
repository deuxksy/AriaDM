import { isPro } from '../core/iap/entitlement';

// v1은 전 기능 무료 — Pro 게이팅은 relay push 출시 시점에만 활성화
test('isPro v1 상시 false', () => {
  expect(isPro()).toBe(false);
});
