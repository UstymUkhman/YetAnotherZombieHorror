import type { Environment, EnvironmentKeys } from '@/settings/types';
import EnvironmentData from '@/settings/environment.json';

class Settings
{
  private readonly request: IDBOpenDBRequest;

  private readonly environment = new Map(
    Object.entries(EnvironmentData)
  ) as Environment;

  constructor () {
    this.request = indexedDB.open('YAZH');
    this.request.onerror = this.onRequestError.bind(this);
    this.request.onsuccess  = this.onRequestSuccess.bind(this);
    this.request.onupgradeneeded = this.onUpgradeNeeded.bind(this);
  }

  private onUpgradeNeeded (event: IDBVersionChangeEvent): void {
    const db = (event.target as IDBRequest).result;
    db.createObjectStore('Environment');
  }

  private onRequestSuccess (event: Event): void {
    const db = (event.target as IDBRequest).result;
    this.getEnviromentSettings(db);
  }

  private getEnviromentSettings (db: IDBDatabase, updated = false): void {
    const transaction = db.transaction('Environment', 'readonly');
    const environmentStore = transaction.objectStore('Environment');

    environmentStore.openCursor().onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (!cursor) return updated ? null : this.updateEnvironmentStore(db);

      const key = cursor.key as EnvironmentKeys;
      this.environment.set(key, cursor.value);

      cursor.continue();
      updated = true;
    };

    transaction.oncomplete = this.onTransactionComplete.bind(this, db);
  }

  private updateEnvironmentStore (db: IDBDatabase, add = true, environment = EnvironmentData): void {
    const transaction = db.transaction('Environment', 'readwrite');
    const environmentStore = transaction.objectStore('Environment');

    for (const setting in environment) {
      const key = setting as EnvironmentKeys;
      this.environment.set(key, environment[key]);

      environmentStore[add ? 'add' : 'put'](environment[key], key)
        .onerror = this.onQueryError.bind(this);
    }

    transaction.oncomplete = this.onTransactionComplete.bind(this, db);
  }

  private onTransactionComplete (db: IDBDatabase): void {
    db.close();
  }

  private onRequestError (event: Event): void {
    console.error('Settings DB Request Error:', event);
  }

  private onQueryError (event: Event): void {
    console.error('Settings DB Query Error:', event);
  }

  public getEnvironmentValue (key: EnvironmentKeys): boolean {
    return this.environment.get(key) as boolean;
  }

  public getEnvironmentValues (): Environment {
    return this.environment;
  }

  public resetDefaults (): void {
    this.updateEnvironmentStore(this.request.result, false);
  }
}

export default new Settings();
