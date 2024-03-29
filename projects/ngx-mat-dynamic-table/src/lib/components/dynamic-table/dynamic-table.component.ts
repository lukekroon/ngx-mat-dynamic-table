import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, LOCALE_ID, SimpleChanges, OnChanges, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortable, Sort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { XlsxExportService } from '../xlsx-table-export/service/xlsx-export.service';
import { get as _get, set as _set, cloneDeep } from 'lodash';
import { interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { debounce, map, shareReplay, tap } from 'rxjs/operators';
import { SearchTerm } from '../table-search-input/table-search-input.component';
import { ColumnStorageService, ColumnStorage } from '../services/column-storage.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export interface DynamicTableColumnDefinition extends DynamicTableColumn {
  columnDef: string,
  columnTitle: string,
  type?: 'number' | 'date' | 'icon'; // number, date, icon
  search?: boolean; // enable search on this column
  total?: boolean // calculate the total of this column, only on type number
  average?: boolean // calculate the average of this column, ony on type number
  sticky?: boolean // sticky column
  stickyEnd?: boolean // sticky end column
  icons?: { value: any, matIcon: string, color: string, matTooltip: string }[] // Icons, only on type icon
  sort?: 'asc' | 'desc'; // asc of desc, default sort
  dateFormat?: string; // for dates
  hidden?: boolean; // Hide this column
  ignoreSave?: boolean; // If set, this column will not be saved in indexeddb, intended for dynamic date columns etc. 
  cellClassKey?: string; // Apply a class to a cell
  unit?: { // add unit strings to numbers
    key: string //json key for the unit string
    position: 'before' | 'after'; // Before or after
  }
}

// For calculations
interface DynamicTableColumn {
  totalValue?: number;
  averageValue?: number;
}

export interface DynamicTableCellClickResult { row: any, column: string, data: string }

@Component({
  selector: 'ngx-mat-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTableComponent<T> implements OnInit, OnChanges, AfterViewInit {

  @Input() tableId: string; // unique ID for table to save hidden columns
  @Input() tableData: T[];
  @Input() rowClick: boolean;
  @Input() cellClick: boolean;
  @Input() fileName: string;

  @Input() columns: DynamicTableColumnDefinition[];
  @Input() pageSizeOptions: number[];

  @Input() export: boolean = false; // Enable export for this table
  @Input() filter: boolean = false; // Enable filter for this table
  @Input() multiple: boolean = false; // Allow multiple select for this table
  @Input() optionalColumns: boolean = false; // Show or hide columns
  @Input() emitFilteredData: boolean = false; // Show or hide columns

  @Output() rowClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() cellClicked: EventEmitter<DynamicTableCellClickResult> = new EventEmitter<DynamicTableCellClickResult>();

  @Output() selectedRows: EventEmitter<T[]> = new EventEmitter<T[]>();
  @Output() filterResult: EventEmitter<T[]> = new EventEmitter<T[]>();

  // @ViewChild(MatTable) table: MatTable<T>;

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  selection = new SelectionModel<T>(true, []);

  displayedColumns: string[] = [];

  dataSource: MatTableDataSource<T> = new MatTableDataSource();

  totalsRowVisible: boolean = false;

  xlsxHeaders: any;

  // Formatted data for exporting, expecially the dates
  exportData: T[];

  // The hidden columns filtered out
  columnsToShow = new FormControl();

  filterKeyUp$: ReplaySubject<string> = new ReplaySubject();

  // Default sort column definition
  sortActive: string;
  // Default sort direction
  sortDirection: 'asc' | 'desc';

  tableFilters: { type: 'column' | 'global', reference: any, search: string }[];
  searchLoading: boolean;
  columnSearch$: Subject<SearchTerm> = new Subject();

  savedColumnsLoading: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(@Inject(LOCALE_ID) private locale: string,
    private breakpointObserver: BreakpointObserver,
    private xlsxExportService: XlsxExportService,
    private columnStorageService: ColumnStorageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Add headers to of data to display in table
    if (changes.columns && changes.columns.currentValue) {
      this.setColumns();
    }

    if (changes.tableData.currentValue) {
      // Clear selection if new data is comming in
      this.selection.clear();

      this.dataSource.data = this.tableData;
      this.updateColumnTotals();
      this.getFilteredData(this.tableData);
    }
  }

  ngAfterViewInit(): void {
    this.filterKeyUp$.pipe(debounce(() => interval(2000))).subscribe(filterValue => {
      this.searchLoading = false;
      // apply the filter after 2 seconds
      this.dataSource.filter = filterValue;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      // update totals
      this.updateColumnTotals();
      // If the flag is set, emit the filtered data
      if (this.emitFilteredData) {
        this.getFilteredData();
      }
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }

  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (data, attribute) => _get(data, attribute);
    // Changed this sort function from the source to compare alpha numerics https://stackoverflow.com/a/66157044/6044269
    // https://github.com/angular/components/blob/master/src/material/table/table-data-source.ts#L165
    this.dataSource.sortData = (data: T[], sort: MatSort) => {
      const active = sort.active;
      const direction = sort.direction;
      if (!active || direction == '') { return data; }

      return data.sort((a, b) => {
        let valueA = this.dataSource.sortingDataAccessor(a, active);
        let valueB = this.dataSource.sortingDataAccessor(b, active);

        const valueAType = typeof valueA;
        const valueBType = typeof valueB;

        if (valueAType !== valueBType) {
          if (valueAType === 'number') { valueA += ''; }
          if (valueBType === 'number') { valueB += ''; }
        }

        let comparatorResult = 0;
        if (valueA != null && valueB != null) {
          // ! This is the If that I changed https://stackoverflow.com/a/66157044/6044269
          if (valueAType === 'string' && valueBType === 'string') {
            comparatorResult = (valueA as string).localeCompare(valueB as string, 'en', { numeric: true })
          } else if (valueA > valueB) {
            comparatorResult = 1;
          } else if (valueA < valueB) {
            comparatorResult = -1;
          }
        } else if (valueA != null) {
          comparatorResult = 1;
        } else if (valueB != null) {
          comparatorResult = -1;
        }

        return comparatorResult * (direction == 'asc' ? 1 : -1);
      });
    }
    // Search for nested objects
    this.dataSource.filterPredicate = (data, filter: string) => {
      let validRow = true;
      if (!filter)
        return validRow;
      // type|searchString:column#searchType,type|searchString:column#searchType...
      const terms = filter.split(','); // Split multiple search
      terms.some(term => {
        let [type, criteria] = term.split('|'); // Split global / column search
        let dataString = '';
        let searchType; // type of search in a column
        // let criteria;
        if (type === 'global') {
          // Search All
          this.columns.filter(c => c.search).map(c => c.columnDef).forEach(column => {
            const cellData = _get(data, column)
            if (cellData)
              dataString += cellData
          });
          // String contains/equals in all columns
          if (!dataString || dataString.toString().toLowerCase().indexOf(criteria.toLowerCase()) === -1) {
            validRow = false;
            return true;
          }
        } else {
          const [searchString, columnAndType] = criteria.split(':'); // Split search string and criteria
          let column;
          [column, searchType] = columnAndType.split('#'); // Split column and type of search
          criteria = searchString;
          dataString = _get(data, column); // get the data
          if (searchType === '!=') {
            // String contains/equals in all columns
            if (!dataString || dataString.toString().toLowerCase().indexOf(criteria.toLowerCase()) !== -1) {
              validRow = false;
              return true;
            }
          } else if (searchType === 'empty') {
            if (dataString) {
              validRow = false;
              return true;
            }
          } else {
            // String contains/equals in all columns
            if (!dataString || dataString.toString().toLowerCase().indexOf(criteria.toLowerCase()) === -1) {
              validRow = false;
              return true;
            }
          }
        }
      });
      return validRow;
    };
  }

  updateXLSXHeaders() {
    this.xlsxHeaders = {}
    this.columnsToShow.value.forEach(c => {
      this.xlsxHeaders[c.columnDef] = c.columnTitle
    })
  }

  updateColumnTotals() {
    if (!this.dataSource) {
      return;
    }
    this.columns.map(col => {
      if ((col.total || col.average)) {
        this.totalsRowVisible = true;
        if (this.dataSource.filteredData.length > 0) {
          col.totalValue = this.dataSource.filteredData.map(t => _get(t, col.columnDef)).reduce((acc, value) => acc + (value ? value : 0), 0);
          if (isNaN(col.totalValue)) {
            col.totalValue = 0;
            col.averageValue = 0;
          } else {
            col.averageValue = col.totalValue / this.dataSource.filteredData.length;
          }
        } else {
          col.totalValue = 0;
          col.averageValue = 0;
        }
      }
      return col;
    });
  }

  applyFilter(searchTerms: SearchTerm[]) {
    this.searchLoading = true;
    let filterString;
    searchTerms.forEach(term => {
      // type: Global or in a column
      // |searchString: the text/number searching for
      // :column: when type is column, this field is set
      // #searchType = != >= <= empty
      // type|searchString:column#searchType,type|searchString:column#searchType...
      const newTerm = `${term.type}|${term.search}${term.type === 'column' ? ':' + term.column + '#' + term.searchType : ''}`;
      if (filterString)
        filterString += `,${newTerm}`;
      else
        filterString = newTerm;
    })
    this.filterKeyUp$.next(filterString);
  }

  applyColumnFilter(element: any, column: any, columnTitle: string, searchType: '=' | '!=' | '>=' | '<=' | 'empty'): void {
    //
    if (searchType && searchType !== 'empty' && !element.value)
      return;

    this.searchLoading = true;
    // Send data to table-search-input and add a chip
    this.columnSearch$.next({ type: 'column', column: column, columnTitle: columnTitle, inputReference: element, search: element.value, searchType: searchType });
  }

  _rowClicked(row: any): void {
    if (!this.rowClick)
      return;
    this.rowClicked.emit(row);
  }

  onMatCellClick(row: any, column: DynamicTableColumnDefinition): void {
    if (!this.cellClick)
      return;

    this.cellClicked.emit({ row: row, column: column.columnDef, data: _get(row, column.columnDef) });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.filteredData.forEach(row => this.selection.select(row));

    this.emitSelected();
  }

  toggle(event: MatCheckboxChange, row: T): void {
    if (event) this.selection.toggle(row)
    this.emitSelected();
  }

  emitSelected(): void {
    this.selectedRows.emit(this.selection.selected);
  }

  setColumns(): void {
    this.setDefaultSorting();
    // Check for saved columns in indexedDB
    if (this.tableId) {
      this.savedColumnsLoading = true;
      // TODO: wait here for the db
      if (this.columnStorageService.isDbOpen()) {
        this.columnStorageService.read(this.tableId).subscribe(res => {
          this.setSavedColumnSelection(res);
        });
      } else {
        // Wait for the DB to wake up and then query
        setTimeout(() => {
          this.columnStorageService.read(this.tableId).subscribe(res => {
            this.setSavedColumnSelection(res);
          });
        }, 500);
      }
    } else {
      this.setStaticColumns();
    }
  }

  setStaticColumns(): void {
    // List of all columns to show in the view
    this.displayedColumns = [];
    // Totals row starts as false untill inspection of column definitions
    this.totalsRowVisible = false;
    // add the rest of non hidden columns to the list
    this.displayedColumns = this.columns.filter(c => !c.hidden).map(c => c.columnDef);
    // If multiple select is enabled, add select to the from of the array
    if (this.multiple) this.displayedColumns.unshift('select');
    // set visible columns as checked in the selector
    this.columnsToShow.setValue(this.columns.filter(c => !c.hidden));

    this.updateColumnTotals();
  }

  displayColumnsChanged(event: MatSelectChange): void {
    this.displayedColumns = event.value.map(c => c.columnDef);
    if (this.multiple) this.displayedColumns.unshift('select');
    // save the current visible columns
    this.saveCurrentColumnSelection(this.displayedColumns);
  }

  eportToExcell(): void {
    this.updateXLSXHeaders();
    this.formatExportData();
    this.xlsxExportService.exportExcel(this.exportData, this.xlsxHeaders, this.fileName ? this.fileName : 'Export');
  }

  getFilteredData(data?: T[]): void {
    this.cloneData(data);
    this.filterResult.emit(this.exportData);
  }

  cloneData(data?: T[]): void {
    // Format dates for exporting, temp
    if (this.selection.hasValue()) {
      // Export selected data
      this.exportData = this.selection.selected.map(a => cloneDeep(a));
    } else if (data) {
      // Export filtered data and sorted
      this.exportData = data.map(a => cloneDeep(a));
    }
    else {
      // Export filtered data and sorted
      this.exportData = this.dataSource.sortData(this.dataSource.filteredData, this.dataSource.sort).map(a => cloneDeep(a));
    }
  }

  formatExportData(): void {
    this.cloneData();
    // If the columns contain a date
    let dateColumns = this.columnsToShow.value.filter(e => e.type === 'date')
    if (dateColumns && dateColumns.length > 0) {
      this.exportData = this.exportData.map(td => {
        dateColumns.forEach(col => {
          if (_get(td, col.columnDef))
            _set(td, col.columnDef, formatDate(_get(td, col.columnDef), col.dateFormat ? col.dateFormat : 'dd/MM/yyyy, HH:mm', this.locale));
        });
        return td;
      })
    }
  }

  nestedFilterCheck(search, data, key) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else {
      search += data[key];
    }
    return search;
  }

  setDefaultSorting(): void {
    this.columns.some(col => {
      if (col.sort) {
        this.sortActive = col.columnDef;
        this.sortDirection = col.sort;
        return true;
      }
    });
  }

  setSavedColumnSelection(saved: ColumnStorage): void {
    this.savedColumnsLoading = false;
    if (!saved || saved.visibleColumns.length === 0) {
      this.setStaticColumns();
      return;
    }

    // set the column selector with the values stored in the indexeddb
    this.columnsToShow.setValue(this.columns.filter(c => saved.visibleColumns.some(item => item === c.columnDef)));
    // If multiple is enabled but was not saved in the saved array, add it
    if (this.multiple && saved.visibleColumns[0] !== 'select') saved.visibleColumns.unshift('select');
    this.displayedColumns = saved.visibleColumns;
  }

  saveCurrentColumnSelection(displayedColumns: string[]): void {
    if (!this.tableId)
      return;

    let toSave = this.displayedColumns.slice();
    // Do not save the selection column
    if (this.multiple && toSave[0] === 'select') toSave.shift();

    this.columnStorageService.save({
      tableId: this.tableId,
      visibleColumns: toSave
    });
  }

}
