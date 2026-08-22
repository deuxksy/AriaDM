import { toWsUrl } from '../core/rpc/profileUrl';

test('http→ws', () => { expect(toWsUrl('http://h:6800')).toBe('ws://h:6800/jsonrpc'); });
test('https→wss', () => { expect(toWsUrl('https://h:6800')).toBe('wss://h:6800/jsonrpc'); });
