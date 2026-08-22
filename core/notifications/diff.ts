import type { Aria2Status } from '../rpc/types';

export function computeNewCompletions(
  seen: ReadonlySet<string>,
  stopped: ReadonlyArray<{ gid: string; status: Aria2Status }>,
): string[] {
  return stopped.filter((d) => d.status === 'complete' && !seen.has(d.gid)).map((d) => d.gid);
}
