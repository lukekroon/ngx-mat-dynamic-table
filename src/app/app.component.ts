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
    {
      columnDef: 'subscribed',
      columnTitle: 'Subscribed',
      type: 'icon',
      icons: [{
        value: true,
        matIcon: 'done',
        color: '#0a7d00',
        matTooltip: 'Subscribed'
      }, {
        value: false,
        matIcon: 'clear',
        color: '#fc0303',
        matTooltip: 'Subscribed'
      }]
    },
    {
      columnDef: 'signupDate',
      columnTitle: 'Date',
      hidden: true
    },
    {
      columnDef: 'money.netWorth',
      columnTitle: 'Net Worth',
      type: 'number',
      total: true
    }
  ]

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data$ = this.dataService.getObservableClass();
    // this.data$ = this.dataService.getObservableObjects();
  }

  rowData(row: any): void {
    console.log(row);
  }

  selectedRows(rows: any[]): void {
    console.log(rows);
  }
}
