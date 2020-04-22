import { Component, OnInit, Input } from '@angular/core';
import { XlsxExportService } from './service/xlsx-export.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ngx-mat-xlsx-table-export',
  templateUrl: './xlsx-table-export.component.html',
  styleUrls: ['./xlsx-table-export.component.css']
})
export class XlsxTableExportComponent<T> implements OnInit {

  @Input() data: T[];
  @Input() fileName: string;
  @Input() headers: string[];

  constructor(private xlsxExportService: XlsxExportService,
    private matSnackBar: MatSnackBar) { }

  ngOnInit() {
  }

  eportToExcell(): void {
    if (!this.data || !this.headers) {
      this.matSnackBar.open('Provide data and headers.', 'Ok', { duration: 4000 });
      return;
    }
    this.xlsxExportService.exportExcel(this.data, this.headers, this.fileName ? this.fileName : 'Export');
  }

}
