import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DynamicTableColumnDefinition } from '../dynamic-table/dynamic-table.component';

@Component({
  selector: 'ngx-mat-dynamic-table-container',
  templateUrl: './dynamic-table-container.component.html',
  styleUrls: ['./dynamic-table-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicTableContainerComponent<T> implements OnInit {

  @Input() tableId: string;
  @Input() tableData$: Observable<T[]>;
  @Input() columns: DynamicTableColumnDefinition[];
  @Input() rowClick: boolean;
  @Input() cellClick: boolean;
  @Input() fileName: string;
  @Input() export: boolean = false; // Enable export for this table
  @Input() filter: boolean = false; // Enable filter for this table
  @Input() multiple: boolean = false; // Allow multiple select for this table
  @Input() optionalColumns: boolean = false; // Show or hide columns
  @Input() pageSizeOptions: number[];
  @Input() emitFilteredData: boolean = false; // Show or hide columns

  @Output() rowClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() cellClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() selectedRows: EventEmitter<T[]> = new EventEmitter<T[]>();
  @Output() filterResult: EventEmitter<T[]> = new EventEmitter<T[]>();

  constructor() { }

  ngOnInit(): void {
  }

}
