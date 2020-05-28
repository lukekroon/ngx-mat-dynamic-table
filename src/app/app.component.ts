import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { Observable } from 'rxjs';
import { DynamicTableColumnDefinition } from 'ngx-mat-dynamic-table';
import { map } from 'rxjs/operators';

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
      search: true
    },
    {
      columnDef: 'surname',
      columnTitle: 'Surname',
      search: true
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
      type: 'date',
      dateFormat: 'yyyy',
      hidden: true
    },
    {
      columnDef: 'money.netWorth',
      columnTitle: 'Net Worth',
      type: 'number',
      total: true,
      average: true,
      search: true,
      cellClassKey: 'netWorthClass'
    }
  ]

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data$ = this.dataService.getObservableClass().pipe(
      map(users => {
        return users.map(user => {
          user.netWorthClass = user.money.netWorth > 2000 ? 'a-lot-of-money' : 'broke';
          return user;
        })
      })
    );
    // this.data$ = this.dataService.getObservableObjects();
  }

  rowData(row: any): void {
    console.log(row);
  }

  selectedRows(rows: any[]): void {
    console.log(rows);
  }
}
