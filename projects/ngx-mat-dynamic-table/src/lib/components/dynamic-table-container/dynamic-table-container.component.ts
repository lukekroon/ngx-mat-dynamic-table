import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { DynamicTableColumnDefinition } from '../dynamic-table/dynamic-table.component';

@Component({
  selector: 'ngx-mat-dynamic-table-container',
  templateUrl: './dynamic-table-container.component.html',
  styleUrls: ['./dynamic-table-container.component.css']
})
export class DynamicTableContainerComponent<T> implements OnInit {

  @Input() tableData$: Observable<T[]>;
  @Input() columns: DynamicTableColumnDefinition[];
  @Input() rowClick: boolean;
  @Input() fileName: string;
  @Input() export: boolean = false; // Enable export for this table
  @Input() filter: boolean = false; // Enable filter for this table
  @Input() multiple: boolean = false; // Allow multiple select for this table
  @Input() optionalColumns: boolean = false; // Show or hide columns
  @Input() pageSizeOptions: number[];

  @Output() rowClicked: EventEmitter<T> = new EventEmitter<T>();
  @Output() selectedRows: EventEmitter<T[]> = new EventEmitter<T[]>();

  constructor() { }

  ngOnInit(): void {
  }

}
