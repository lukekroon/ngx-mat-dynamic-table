import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

export interface ColumnStorage {
  tableId: string;
  visibleColumns: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ColumnStorageService {

  dbName = 'ngx-mat-dynamic-table'
  storeName = 'columns'
  version = 1 //versions start at 1

  db;
  objectStore;

  constructor() {
    var request = indexedDB.open(this.dbName, this.version);

    request.onerror = (event) => {
      console.warn('IndexedDB not enabled.');
    };

    request.onupgradeneeded = (event) => {
      this.db = request.result;
      this.objectStore = this.db.createObjectStore(this.storeName, { keyPath: 'tableId' });
      console.debug('ngx-mat-dynamic-table: create object store 👍');
    };

    request.onsuccess = (event) => {
      this.db = request.result;
      console.log('ngx-mat-dynamic-table: db opened 👍' + this.db);
    };

  }

  public isDbOpen(): boolean {
    return !!this.db;
  }

  save(doc: ColumnStorage): void {
    // Dont try to save if there is no db
    if (!this.db)
      return;

    var request = this.db.transaction([this.storeName], 'readwrite')
      .objectStore(this.storeName)
      .put(doc);

    request.onsuccess = (event) => {
      // console.debug('Saved columns...');
    };
  }

  read(tableId: string): Observable<ColumnStorage> {
    return new Observable((observer: Observer<ColumnStorage>) => {
      var transaction = this.db.transaction([this.storeName]);
      var objectStore = transaction.objectStore(this.storeName);
      var request = objectStore.get(tableId);

      request.onerror = (event) => {
        observer.error(new Error);
        observer.complete();
      };

      request.onsuccess = (event) => {
        if (request.result) {
          observer.next(request.result);
          observer.complete();
        } else {
          // observer.error((e) => console.log(e));
          observer.next(null);
          observer.complete();
        }
      };

    })

  }

}
