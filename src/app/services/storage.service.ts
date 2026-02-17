import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = inject(Storage);

  private _storage: Storage | null = null;
  private _initPromise: Promise<Storage> | null = null;

  constructor() {
    this.init();
  }

  async init() {
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = (async () => {
      const storage = await this.storage.create();
      this._storage = storage;
      return storage;
    })();

    return this._initPromise;
  }

  // Create and expose methods that users of this service can call
  public async set(key: string, value: any) {
    await this.init();
    return this._storage?.set(key, value);
  }

  public async get(key: string) {
    await this.init();
    return this._storage?.get(key);
  }

  public async remove(key: string) {
    await this.init();
    return this._storage?.remove(key);
  }

  public async clear() {
    await this.init();
    return this._storage?.clear();
  }

  // No longer needed as public methods call init() directly
  private async ensureStorage() {
    await this.init();
  }
}
