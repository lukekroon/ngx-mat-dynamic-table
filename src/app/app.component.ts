import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { Observable } from 'rxjs';
import { DynamicTableColumnDefinition } from 'ngx-mat-dynamic-table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  data$: Observable<any[]>;

  columns: DynamicTableColumnDefinition[] = [
    {
      columnDef: 'name',
      columnTitle: 'Name',
    },
    {
      columnDef: 'surname',
      columnTitle: 'Surname',
    },
    {
      columnDef: 'number',
      columnTitle: 'Number',
    },
  ]

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data$ = this.dataService.getObservable();
  }

  rowData(row: any): void {
    console.log(row);
  }
}
