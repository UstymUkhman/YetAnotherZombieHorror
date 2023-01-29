import type { Visuals, RequestSuccess, VisualKeys, VisualData } from '@/settings/types';
import { DefaultVisuals, DEFAULT_QUALITY } from '@/settings/constants';
import VisualSettings from '@/settings/visuals.json';
import { GameEvents } from '@/events/GameEvents';

export default class Settings
{
  private static readonly visuals = Settings.getDefaultVisualValues();

  public constructor () {
    this.openDBConnection(this.getEnviromentSettings.bind(this));
  }

  private updateVisualsStore (db: IDBDatabase, add = true, visuals = DefaultVisuals): void {
    const transaction = db.transaction('Visuals', 'readwrite');
    const visualsStore = transaction.objectStore('Visuals');

    for (const visual in visuals) {
      const key = visual as VisualKeys;
      Settings.visuals.set(key, visuals[key]);

      visualsStore[add ? 'add' : 'put'](visuals[key], key)
        .onerror = this.onQueryError.bind(this);
    }

    transaction.oncomplete = this.onTransactionComplete.bind(this, db, false);
  }

  private getEnviromentSettings (db: IDBDatabase, updated = false): void {
    const transaction = db.transaction('Visuals', 'readonly');
    const visualsStore = transaction.objectStore('Visuals');

    visualsStore.openCursor().onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (!cursor) return updated ? null : this.updateVisualsStore(db);

      const key = cursor.key as VisualKeys;
      Settings.visuals.set(key, cursor.value);

      cursor.continue();
      updated = true;
    };

    transaction.oncomplete = this.onTransactionComplete.bind(this, db, true);
  }

  public updateVisualValues (visuals: VisualData): void {
    this.openDBConnection((db: IDBDatabase) =>
      this.updateVisualsStore(db, false, visuals)
    );
  }

  private onTransactionComplete (db: IDBDatabase, get: boolean): void {
    get && GameEvents.dispatch('Game::SettingsInit');
    db.close();
  }

  private onUpgradeNeeded (event: IDBVersionChangeEvent): void {
    const db = (event.target as IDBRequest).result;
    db.createObjectStore('Visuals');
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

  public resetVisualValues (index: number): void {
    this.updateVisualValues(VisualSettings[index]);
  }

  private onRequestError (event: Event): void {
    console.error('Settings DB Request Error:', event);
  }

  private onQueryError (event: Event): void {
    console.error('Settings DB Query Error:', event);
  }

  public static getDefaultVisualValues (index = DEFAULT_QUALITY): Visuals {
    return new Map(Object.entries(VisualSettings[index])) as Visuals;
  }

  public static getVisualValue (key: VisualKeys): boolean {
    return Settings.visuals.get(key) as boolean;
  }

  public static getVisualValues (): Visuals {
    return Settings.visuals;
  }
}
