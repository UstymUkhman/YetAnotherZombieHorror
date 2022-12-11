import type { Performance, PerformanceKeys, RequestSuccess } from '@/settings/types';
import PerformanceData from '@/settings/performance.json';
import { GameEvents } from '@/events/GameEvents';

export default class Settings
{
  private static readonly performance = Settings.getDefaultPerformanceValues();

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
    db.createObjectStore('Performance');
  }

  private getEnviromentSettings (db: IDBDatabase, updated = false): void {
    const transaction = db.transaction('Performance', 'readonly');
    const performanceStore = transaction.objectStore('Performance');

    performanceStore.openCursor().onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (!cursor) return updated ? null : this.updatePerformanceStore(db);

      const key = cursor.key as PerformanceKeys;
      Settings.performance.set(key, cursor.value);

      cursor.continue();
      updated = true;
    };

    transaction.oncomplete = this.onTransactionComplete.bind(this, db, true);
  }

  private updatePerformanceStore (db: IDBDatabase, add = true, performance = PerformanceData): void {
    const transaction = db.transaction('Performance', 'readwrite');
    const performanceStore = transaction.objectStore('Performance');

    for (const setting in performance) {
      const key = setting as PerformanceKeys;
      Settings.performance.set(key, performance[key]);

      performanceStore[add ? 'add' : 'put'](performance[key], key)
        .onerror = this.onQueryError.bind(this);
    }

    transaction.oncomplete = this.onTransactionComplete.bind(this, db, false);
  }

  private onTransactionComplete (db: IDBDatabase, get: boolean): void {
    get && GameEvents.dispatch('Game::SettingsInit');
    db.close();
  }

  private resetPerformanceStore (db: IDBDatabase): void {
    this.updatePerformanceStore(db, false);
  }

  private onRequestError (event: Event): void {
    console.error('Settings DB Request Error:', event);
  }

  private onQueryError (event: Event): void {
    console.error('Settings DB Query Error:', event);
  }

  public updatePerformanceValues (performance: typeof PerformanceData): void {
    this.openDBConnection((db: IDBDatabase) =>
      this.updatePerformanceStore(db, false, performance)
    );
  }

  public static getPerformanceValue (key: PerformanceKeys): boolean {
    return Settings.performance.get(key) as boolean;
  }

  public static getDefaultPerformanceValues (): Performance {
    return new Map(Object.entries(PerformanceData)) as Performance;
  }

  public static getPerformanceValues (): Performance {
    return Settings.performance;
  }

  public resetPerformanceValues (): void {
    this.openDBConnection(this.resetPerformanceStore.bind(this));
  }
}
