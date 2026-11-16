// react-native-mmkv v4(Nitro) — Jest에서 네이티브 모듈 부재로 인메모리 mock
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      getString: (k) => store.get(k) ?? null,
      set: (k, v) => { store.set(k, v); },
      remove: (k) => { store.delete(k); },
    }),
  };
});
