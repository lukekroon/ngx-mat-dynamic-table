import { Component, OnInit, Input, Output, EventEmitter, ViewChild, Inject, LOCALE_ID, SimpleChanges, OnChanges } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { MatCheckboxChange } from '@angular/material/checkbox';

export interface DynamicTableColumnDefinition {
  columnDef: string,
  columnTitle: string,
  type?: string;
  total?: boolean
  icons?: { value: any, matIcon: string, color: string, matTooltip: string }[]
  // Do not set this value, calculated inside generic table component
  totalValue?: number;
}

@Component({
  selector: 'ngx-mat-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent<T> implements OnChanges {

  @Input() tableData: any[];
  @Input() rowClick: boolean;
  @Input() fileName: string;

  @Input() columns: DynamicTableColumnDefinition[];

  @Input() export: boolean = false;
  @Input() filter: boolean = false;
  @Input() multiple: boolean = false;

  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output() selectedRows: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<T>(true, []);

  displayedColumns: string[] = [];

  dataSource: MatTableDataSource<any>;

  totalsRowVisible: boolean = false;

  xlsxHeaders: any;

  exportData: any[];

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  ngOnChanges(changes: SimpleChanges): void {
    // Add headers to of data to display in table
    if (changes.columns && changes.columns.currentValue) {
      this.displayedColumns = [];
      this.totalsRowVisible = false;
      if (this.multiple) this.displayedColumns.push('select');
      this.columns.forEach(col => {
        this.displayedColumns.push(col.columnDef);
      });
      this.updateColumnTotals();
      this.updateXLSXHeaders();
    }

    if (changes.tableData.currentValue) {

      // Format dates for exporting, temp
      this.exportData = this.tableData.map(a => Object.assign({}, a));
      // If the columns contain a date
      let dateColumns = this.columns.filter(e => e.type === 'date')
      if (dateColumns && dateColumns.length > 0) {
        this.exportData = this.exportData.map(td => {
          dateColumns.forEach(col => {
            td[col.columnDef] = formatDate(td[col.columnDef], 'd/M/yy, HH:mm', this.locale);
          });
          return td;
        })
      }

      this.dataSource = new MatTableDataSource(this.tableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.updateColumnTotals();
    }
  }

  updateXLSXHeaders() {
    this.xlsxHeaders = {}
    this.columns.forEach(c => {
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
    if(!this.rowClick)
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
}
