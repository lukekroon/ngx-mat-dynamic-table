import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { pick, map, partialRight, mapKeys, values } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class XlsxExportService {

  fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  fileExtension = '.xlsx';

  constructor() { }

  public exportExcel(jsonData: any[], headers: any, fileName: string): void {
    const columnHeaders = values(headers);
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(map(this.renameKeys(jsonData, headers), partialRight(pick, columnHeaders)), { header: columnHeaders });
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);

  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: this.fileType });
    FileSaver.saveAs(data, fileName + this.fileExtension);
  }

  renameKeys(jsonData: any[], headers: any): any[] {
    return jsonData.map(j => {
      return mapKeys(j, function (value, key) {
        return headers[key];
      });
    })
  }

}
