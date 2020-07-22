import { Component, OnInit, ElementRef, ViewChild, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface SearchTerm {
  type: 'column' | 'global',
  inputReference?: any,
  column?: string,
  search: string
}

@Component({
  selector: 'ngx-mat-table-search-input',
  templateUrl: './table-search-input.component.html',
  styleUrls: ['./table-search-input.component.css']
})
export class TableSearchInputComponent implements OnInit, OnDestroy {

  @Input() columnSearch$: Subject<SearchTerm>;
  visible = true;
  selectable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  searchCtrl = new FormControl();
  searchTerms: SearchTerm[] = [];

  columnSearchSubscription: Subscription;

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  @Output() searchChange: EventEmitter<SearchTerm[]> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
    this.columnSearchSubscription = this.columnSearch$.subscribe(searchTerm => {
      if ((searchTerm.search || '').trim()) {
        // See if there are existing global search
        let columnSearch = this.searchTerms.find(st => st.column === searchTerm.column)
        // If there are, update
        if (columnSearch)
          columnSearch.search = searchTerm.search.trim();
        else // Else add
          this.searchTerms.push(searchTerm);

        this.emitNewSearch();
      } else {
        this.remove(searchTerm);
      }
    })
  }

  add(event: any): void {
    const value = (event.target as HTMLInputElement).value;

    // See if there are existing global search
    let globalSearch = this.searchTerms.find(st => st.type === 'global')

    // Add global search term
    if ((value || '').trim()) {
      // If there are, update
      if (globalSearch)
        globalSearch.search = value.trim();
      else // Else add
        this.searchTerms.push({ type: 'global', search: value.trim() });

      this.emitNewSearch();
    } else {
      this.remove(globalSearch);
    }
  }

  remove(searchTerm: SearchTerm): void {
    let index;
    // if column is cleared
    if (searchTerm.type === 'column') {
      index = this.searchTerms.findIndex(i => i.column === searchTerm.column);
    } else {
      index = this.searchTerms.findIndex(i => i.search === searchTerm.search && i.type === searchTerm.type);
      if (index >= 0)
        this.searchInput.nativeElement.value = null;
    }

    if (searchTerm.inputReference)
      searchTerm.inputReference.value = '';

    if (index >= 0) {
      this.searchTerms.splice(index, 1);
      this.emitNewSearch();
    }
  }

  orderChanged(event: CdkDragDrop<SearchTerm[]>): void {
    moveItemInArray(this.searchTerms, event.previousIndex, event.currentIndex);
    this.emitNewSearch();
  }

  emitNewSearch(): void {
    this.searchChange.emit(this.searchTerms);
  }

  ngOnDestroy(): void {
    this.columnSearchSubscription.unsubscribe();
  }

}
