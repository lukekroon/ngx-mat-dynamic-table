# ngx-mat-dynamic-table

Dynamic tables built with angular material. Pull requests welcome.

## Getting Started

A full demo can be found on the github repository.

Install with npm:

`npm i ngx-mat-dynamic-table`

Publish to npm:

`npm publish --tag beta`
`npm publish`

After installation include `NgxMatDynamicTableModule` in your module imports:

```javascript
import { NgxMatDynamicTableModule } from 'ngx-mat-dynamic-table';
...
imports: [
    NgxMatDynamicTableModule
  ],
...
```

Column types are defined as follow:

```javascript
export interface DynamicTableColumnDefinition extends DynamicTableColumn {
  columnDef: string, // The key of the data, can access nested objects
  columnTitle: string, // The title of the column
  type?: 'number' | 'date' | 'icon'; // Type of data in the field: number, date, icon
  search?: boolean; // By default a column cannot be searched, enable search on this column
  total?: boolean // calculate the total of this column, only on type number
  average?: boolean // calculate the average of this column, ony on type number
  icons?: { value: any, matIcon: string, color: string, matTooltip: string }[] // Material icons only, only on type icon
  sort?: 'asc' | 'desc'; // asc of desc, default sort, can only be applied to one column.
  dateFormat?: string; // for dates eg. 'yyyy/MM/dd, HH:mm'
  hidden?: boolean; // Hide this column, enable optionalColumns to view
  cellClassKey?: string; // Apply a class to a cell, class name must be in the data
}
```

Source data must be an observable:

```javascript
let data: Observable<User[]> = [{
      name: 'Luke',
      surname: 'Kroon',
      number: '+27827022334',
      signupDate: new Date('2019/01/22'),
      subscribed: true,
      money: {
        netWorth: 50000
      }
    }];
```

In your component define the columns:

```javascript
columns: DynamicTableColumnDefinition[] = [
    {
      columnDef: 'name',
      columnTitle: 'Name',
      search: true
    }
    ...
]
```

In the HTML add the selector:

```html
<ngx-mat-dynamic-table-container [tableData$]="data$" [columns]="columns" filter="true" export="true"
        (rowClicked)="rowData($event)" rowClick="true" fileName="Test" optionalColumns="true" multiple="true"
        (selectedRows)="selectedRows($event)" [pageSizeOptions]="[15, 30, 60]"></ngx-mat-dynamic-table-container>
```

Inputs:

`tableData$` = Table data in observable
`columns` = Column definitions
`filter` = Enable the filter box on the table
`export` = Enable export button
`rowClicked` = Output for the click event on the row
`rowClick` = Enable cursor to indicate table is clickable
`fileName` = File name of the excell export
`optionalColumns` = Enable optional columns
`multiple` = Enable mulitple select
`selectedRows` = Output for all selected rows

For more examples run the demo application.

## How to run the demo application

1. Build the library with `ng build ngx-mat-dynamic-table`
2. A new `dist` folder will appear with the library.
3. Run `ng serve` to start the demo.

## How to contribute

1. In one terminal build the library with `ng build ngx-mat-dynamic-table --watch`. This command will check for any file changes in the library directory.
2. In another terminal run `ng serve` to test your changes to the library.

## Install Locally to your own project

1. Build the library with `ng build ngx-mat-dynamic-table`.
2. From your own project, run `npm install /path/to/library/dist`.
