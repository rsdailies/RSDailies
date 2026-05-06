import test from 'node:test';
import assert from 'node:assert';
import { 
  initStorageService, 
  load, 
  save, 
  setActiveProfile, 
  loadGlobal, 
  saveGlobal 
} from '../../../src/core/storage/storage-service.js';

test('StorageService', async (t) => {
  // Mock storage
  const mockStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; },
    key(i) { return Object.keys(this.data)[i]; },
    get length() { return Object.keys(this.data).length; }
  };

  initStorageService('test-profile', mockStorage);

  await t.test('should save and load profile-scoped data', () => {
    save('my-key', { foo: 'bar' });
    assert.strictEqual(mockStorage.data['rsdailies:test-profile:my-key'], JSON.stringify({ foo: 'bar' }));
    
    const loaded = load('my-key');
    assert.deepStrictEqual(loaded, { foo: 'bar' });
  });

  await t.test('should handle global data', () => {
    saveGlobal('global-key', 'global-value');
    assert.strictEqual(mockStorage.data['global-key'], JSON.stringify('global-value'));
    
    const loaded = loadGlobal('global-key');
    assert.strictEqual(loaded, 'global-value');
  });

  await t.test('should switch profiles', () => {
    setActiveProfile('other-profile');
    save('other-key', 'other-value');
    assert.strictEqual(mockStorage.data['rsdailies:other-profile:other-key'], JSON.stringify('other-value'));
    
    setActiveProfile('test-profile');
    const oldData = load('my-key');
    assert.deepStrictEqual(oldData, { foo: 'bar' });
  });
});
