import { NgModule } from '@angular/core';
import { NgxMatDynamicTableComponent } from './ngx-mat-dynamic-table.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { DynamicTableContainerComponent } from './components/dynamic-table-container/dynamic-table-container.component';
import { DemoMaterialModule } from './shared/demo-material-module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { XlsxTableExportComponent } from './components/xlsx-table-export/xlsx-table-export.component';


@NgModule({
  declarations: [
    NgxMatDynamicTableComponent, 
    DynamicTableComponent, 
    DynamicTableContainerComponent,
    XlsxTableExportComponent
  ],
  imports: [
    CommonModule,
    DemoMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ],
  exports: [
    DynamicTableComponent, 
    DynamicTableContainerComponent,
    XlsxTableExportComponent
  ]
})
export class NgxMatDynamicTableModule { }
