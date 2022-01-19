import type { Environment, EnvironmentKeys, RequestSuccess } from '@/settings/types';
import EnvironmentData from '@/settings/environment.json';

export default class Settings
{
  private static readonly environment = new Map(
    Object.entries(EnvironmentData)
  ) as Environment;

  public constructor () {
    this.openDBConnection(this.getEnviromentSettings.bind(this));
  }

  private openDBConnection (onSuccess: RequestSuccess): void {
    const request = indexedDB.open('YAZH');
    request.onerror = this.onRequestError.bind(this);
    request.onupgradeneeded = this.onUpgradeNeeded.bind(this);

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBRequest).result;
      onSuccess(db as IDBDatabase);
    };
  }

  private onUpgradeNeeded (event: IDBVersionChangeEvent): void {
    const db = (event.target as IDBRequest).result;
    db.createObjectStore('Environment');
  }

  private getEnviromentSettings (db: IDBDatabase, updated = false): void {
    const transaction = db.transaction('Environment', 'readonly');
    const environmentStore = transaction.objectStore('Environment');

    environmentStore.openCursor().onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (!cursor) return updated ? null : this.updateEnvironmentStore(db);

      const key = cursor.key as EnvironmentKeys;
      Settings.environment.set(key, cursor.value);

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
      Settings.environment.set(key, environment[key]);

      environmentStore[add ? 'add' : 'put'](environment[key], key)
        .onerror = this.onQueryError.bind(this);
    }

    transaction.oncomplete = this.onTransactionComplete.bind(this, db);
  }

  private resetEnvironmentStore (db: IDBDatabase): void {
    this.updateEnvironmentStore(db, false);
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

  public static getEnvironmentValue (key: EnvironmentKeys): boolean {
    return Settings.environment.get(key) as boolean;
  }

  public static getEnvironmentValues (): Environment {
    return Settings.environment;
  }

  public updateEnvironmentValues (environment: typeof EnvironmentData): void {
    this.openDBConnection((db: IDBDatabase) =>
      this.updateEnvironmentStore(db, false, environment)
    );
  }

  public resetEnvironmentValues (): void {
    this.openDBConnection(this.resetEnvironmentStore.bind(this));
  }
}
