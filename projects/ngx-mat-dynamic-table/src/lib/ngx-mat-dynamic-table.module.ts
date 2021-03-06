import { NgModule } from '@angular/core';
import { NgxMatDynamicTableComponent } from './ngx-mat-dynamic-table.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { DynamicTableContainerComponent } from './components/dynamic-table-container/dynamic-table-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { XlsxTableExportComponent } from './components/xlsx-table-export/xlsx-table-export.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { LodashGetPipe } from './components/lodash-get-pipe/lodash-get.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableSearchInputComponent } from './components/table-search-input/table-search-input.component';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { XlsxExportService } from './components/xlsx-table-export/service/xlsx-export.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


@NgModule({
  declarations: [
    NgxMatDynamicTableComponent,
    DynamicTableComponent,
    DynamicTableContainerComponent,
    XlsxTableExportComponent,
    LodashGetPipe,
    TableSearchInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DragDropModule,
    MatButtonToggleModule
  ],
  providers: [XlsxExportService],
  exports: [
    DynamicTableComponent,
    DynamicTableContainerComponent,
    XlsxTableExportComponent
  ]
})
export class NgxMatDynamicTableModule { }
