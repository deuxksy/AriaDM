export function toWsUrl(base: string): string {
  return `${base.replace(/^http/, 'ws')}/jsonrpc`;
}
