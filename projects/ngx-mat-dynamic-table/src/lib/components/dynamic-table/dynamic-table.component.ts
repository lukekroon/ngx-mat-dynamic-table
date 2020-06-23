import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, LOCALE_ID, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortable, Sort, SortDirection } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { XlsxExportService } from '../xlsx-table-export/service/xlsx-export.service';
import { get as _get, set as _set } from 'lodash';
import { BehaviorSubject, interval } from 'rxjs';
import { debounce } from 'rxjs/operators';

export interface DynamicTableColumnDefinition extends DynamicTableColumn {
  columnDef: string,
  columnTitle: string,
  type?: 'number' | 'date' | 'icon'; // number, date, icon
  search?: boolean; // enable search on this column
  total?: boolean // calculate the total of this column, only on type number
  average?: boolean // calculate the average of this column, ony on type number
  icons?: { value: any, matIcon: string, color: string, matTooltip: string }[] // Icons, only on type icon
  sort?: 'asc' | 'desc'; // asc of desc, default sort
  dateFormat?: string; // for dates
  hidden?: boolean; // Hide this column
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

@Component({
  selector: 'ngx-mat-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent<T> implements OnInit, OnChanges, AfterViewInit {

  @Input() tableData: T[];
  @Input() rowClick: boolean;
  @Input() fileName: string;

  @Input() columns: DynamicTableColumnDefinition[];
  @Input() pageSizeOptions: number[];

  @Input() export: boolean = false; // Enable export for this table
  @Input() filter: boolean = false; // Enable filter for this table
  @Input() multiple: boolean = false; // Allow multiple select for this table
  @Input() optionalColumns: boolean = false; // Show or hide columns

  @Output() rowClicked: EventEmitter<T> = new EventEmitter<T>();

  @Output() selectedRows: EventEmitter<T[]> = new EventEmitter<T[]>();

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

  // Expose lodash get to the HTML
  lodashGet = _get;

  filterKeyUp: BehaviorSubject<string> = new BehaviorSubject('');

  // Default sort column definition
  sortActive: string;
  // Default sort direction
  sortDirection: 'asc' | 'desc';

  constructor(@Inject(LOCALE_ID) private locale: string,
    private xlsxExportService: XlsxExportService) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Add headers to of data to display in table
    if (changes.columns && changes.columns.currentValue) {
      this.displayedColumns = [];
      this.totalsRowVisible = false;
      if (this.multiple) this.displayedColumns.push('select');
      this.columns.forEach(col => {
        if (!col.hidden)
          this.displayedColumns.push(col.columnDef);
      });
      this.columnsToShow.setValue(this.columns.filter(c => !c.hidden));
      this.setDefaultSorting();
      this.updateColumnTotals();
    }

    if (changes.tableData.currentValue) {
      if (this.sortActive) {
        this.dataSource.data = this.tableData.sort((a, b) => (_get(a, this.sortActive) > _get(b, this.sortActive)) ? this.sortDirection === 'asc' ? 1 : -1 : ((_get(b, this.sortActive) > _get(a, this.sortActive)) ? this.sortDirection === 'asc' ? -1 : 1 : 0));
      } else {
        this.dataSource.data = this.tableData;
      }
      this.updateColumnTotals();
    }
  }

  ngAfterViewInit(): void {
    this.filterKeyUp.pipe(debounce(() => interval(2000))).subscribe(res => {
      this.updateColumnTotals();
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (data, attribute) => _get(data, attribute);
  }

  ngOnInit(): void {
    // Search for nested objects
    this.dataSource.filterPredicate = (data, filter: string) => {
      const searchCriteria = filter.split(',');
      let dataString = '';
      const transformedFilter = searchCriteria[0].trim().toLowerCase();

      if (transformedFilter.length === 0) return true;

      if (searchCriteria.length > 1) {
        // Search in a column
        dataString = _get(data, searchCriteria[1]);
      } else {
        // Search all the columns
        this.columns.filter(c => c.search).map(c => c.columnDef).forEach(column => dataString += _get(data, column))
      }
      if (!dataString) return false;
      // Transform the filter by converting it to lowercase and removing whitespace.
      return dataString.toString().toLowerCase().indexOf(transformedFilter) !== -1;
    };
  }

  updateXLSXHeaders() {
    this.xlsxHeaders = {}
    this.columnsToShow.value.forEach(c => {
      this.xlsxHeaders[c.columnDef] = c.columnTitle
    })
  }

  updateColumnTotals() {
    if (!this.dataSource)
      return;
    this.columns.map(col => {
      if ((col.total || col.average) && this.dataSource.filteredData.length > 0) {
        this.totalsRowVisible = true;
        col.totalValue = this.dataSource.filteredData.map(t => _get(t, col.columnDef)).reduce((acc, value) => acc + value, 0);
        if (isNaN(col.totalValue)) {
          col.totalValue = 0;
          col.averageValue = 0;
        } else {
          col.averageValue = col.totalValue / this.dataSource.filteredData.length;
        }
      }
      return col;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.filterKeyUp.next(filterValue);
  }

  applyColumnFilter(filterValue: string, column: any): void {
    this.dataSource.filter = `${filterValue},${column}`;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.filterKeyUp.next(filterValue);
  }

  _rowClicked(row: any): void {
    if (!this.rowClick)
      return;
    this.rowClicked.emit(row);
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

  displayColumnsChanged(event: MatSelectChange): void {
    this.displayedColumns = event.value.map(c => c.columnDef);
    if (this.multiple) this.displayedColumns.unshift('select');
  }

  eportToExcell(): void {
    this.updateXLSXHeaders();
    this.formatExportData();
    this.xlsxExportService.exportExcel(this.exportData, this.xlsxHeaders, this.fileName ? this.fileName : 'Export');
  }

  formatExportData(): void {
    // Format dates for exporting, temp
    if (this.selection.hasValue()) {
      // Export selected data
      this.exportData = this.selection.selected.map(a => Object.assign({}, a));
    } else {
      // Export filtered data and sorted
      this.exportData = this.dataSource.sortData(this.dataSource.filteredData, this.dataSource.sort).map(a => Object.assign({}, a));
    }
    // If the columns contain a date
    let dateColumns = this.columnsToShow.value.filter(e => e.type === 'date')
    if (dateColumns && dateColumns.length > 0) {
      this.exportData = this.exportData.map(td => {
        dateColumns.forEach(col => {
          _set(td, col.columnDef, formatDate(_get(td, col.columnDef), col.dateFormat ? col.dateFormat : 'd/M/yyyy, HH:mm', this.locale));
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

}
