import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, LOCALE_ID, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { XlsxExportService } from '../xlsx-table-export/service/xlsx-export.service';

export interface DynamicTableColumnDefinition {
  columnDef: string,
  columnTitle: string,
  type?: string;
  total?: boolean
  icons?: { value: any, matIcon: string, color: string, matTooltip: string }[]
  // Do not set this value, calculated inside generic table component
  totalValue?: number;
  hidden?: boolean;
}

@Component({
  selector: 'ngx-mat-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent<T> implements OnChanges, AfterViewInit {

  @Input() tableData: T[];
  @Input() rowClick: boolean;
  @Input() fileName: string;

  @Input() columns: DynamicTableColumnDefinition[];

  @Input() export: boolean = false; // Enable export for this table
  @Input() filter: boolean = false; // Enable filter for this table
  @Input() multiple: boolean = false; // Allow multiple select for this table
  @Input() optionalColumns: boolean = false; // Show or hide columns

  @Output() rowClicked: EventEmitter<T> = new EventEmitter<T>();

  @Output() selectedRows: EventEmitter<T[]> = new EventEmitter<T[]>();

  @ViewChild(MatTable) table: MatTable<T>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<T>(true, []);

  displayedColumns: string[] = [];

  dataSource: MatTableDataSource<T>;

  totalsRowVisible: boolean = false;

  xlsxHeaders: any;

  exportData: T[];

  columnsToShow = new FormControl();

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
      this.columnsToShow.setValue(this.columns.filter(c => !c.hidden))
      this.updateColumnTotals();
    }

    if (changes.tableData.currentValue) {
      this.dataSource = new MatTableDataSource(this.tableData);
      this.updateColumnTotals();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateXLSXHeaders() {
    this.xlsxHeaders = {}
    this.columnsToShow.value.forEach(c => {
      this.xlsxHeaders[c.columnDef] = c.columnTitle
    })
  }

  updateColumnTotals() {
    this.columns.map(col => {
      if (col.total && this.tableData.length > 0) {
        this.totalsRowVisible = true;
        this.table.removeFooterRowDef(null);

        col.totalValue = this.tableData.map(t => t[col.columnDef]).reduce((acc, value) => acc + value, 0);
        if (isNaN(col.totalValue))
          col.totalValue = 0;
      }
      return col;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
          td[col.columnDef] = formatDate(td[col.columnDef], 'd/M/yy, HH:mm', this.locale);
        });
        return td;
      })
    }
  }
}
