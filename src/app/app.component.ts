import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DataService } from './services/data.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { DynamicTableColumnDefinition } from 'ngx-mat-dynamic-table';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  data$: Subject<any[]> = new Subject();

  tableId: string = 'demo-table-unique-id-i8f7jsh8'

  columns: DynamicTableColumnDefinition[] = [
    {
      columnDef: 'fullName',
      columnTitle: 'Full Name',
      search: true,
      sticky: true
    },
    {
      columnDef: 'number',
      columnTitle: 'Number',
      search: true
    },
    {
      columnDef: 'number1',
      columnTitle: 'Number',
      search: true
    },
    {
      columnDef: 'number2',
      columnTitle: 'Number',
      search: true
    },
    {
      columnDef: 'number3',
      columnTitle: 'Number',
      search: true
    },
    {
      columnDef: 'number4',
      columnTitle: 'Number',
      search: true
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
      dateFormat: 'yyyy-MM'
    },
    {
      columnDef: 'money.netWorth',
      columnTitle: 'Net Worth',
      type: 'number',
      unit: {
        key: 'money.currency',
        position: 'before'
      },
      total: true,
      average: true,
      search: true,
      stickyEnd: true,
      sort: 'desc',
      cellClassKey: 'netWorthClass'
    }
  ]

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    for (let i = 0; i < 15; i++) {
      this.columns.push({
        columnDef: `day_${i}`,
        columnTitle: `Day ${i}`,
        hidden: true
      })
    }
    this.getData();
  }

  getData(): void {
    this.dataService.getObservableClass().pipe(
      map(users => {
        return users.map(user => {
          user.netWorthClass = user.money.netWorth > 20000 ? 'a-lot-of-money' : 'broke';
          return user;
        })
      })
    ).subscribe(res => {
      this.data$.next(res);
    });
  }

  rowData(row: any): void {
    console.log(row);
  }

  selectedRows(rows: any[]): void {
    console.log(rows);
  }
}
