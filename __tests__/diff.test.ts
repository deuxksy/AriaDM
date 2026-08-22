import { computeNewCompletions } from '../core/notifications/diff';

test('신규 완료만 반환', () => {
  const seen = new Set(['a']);
  const stopped = [
    { gid: 'a', status: 'complete' as const },
    { gid: 'b', status: 'complete' as const },
    { gid: 'c', status: 'error' as const },
  ];
  expect(computeNewCompletions(seen, stopped)).toEqual(['b']);
});

test('빈 입력', () => {
  expect(computeNewCompletions(new Set(), [])).toEqual([]);
});
