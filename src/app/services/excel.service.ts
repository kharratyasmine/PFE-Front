import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private http: HttpClient) {}

  uploadExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>('http://localhost:8080/api/excel/import', formData);
  }

  downloadPsrExcel(id: number): Observable<Blob> {
    return this.http.get(`http://localhost:8080/psr/${id}/export`, {
      responseType: 'blob'
    });
  }

  downloadPlannedWorkloadExcel(projectId: number, year: number): Observable<Blob> {
    return this.http.get(`http://localhost:8080/plannedWorkloadMember/project/${projectId}/year/${year}/export`, {
      responseType: 'blob'
    });
  }

  // Generic method to export any data to Excel without a backend endpoint
  async exportToExcel(data: any[], sheetName: string, fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add data as rows
    worksheet.addRows(data);

    // Generate Excel file and trigger download
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, fileName);
    });
  }

  async exportStyledExcel(data: any[], sheetName: string, fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) {
      await workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, fileName);
      });
      return;
    }

    // Define columns based on the first row of data
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map(header => ({ header: header, key: header, width: 20 }));

    // Apply header style
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }; // Light grey background
    });

    // Add data and apply conditional styling
    data.forEach((row, rowIndex) => {
      const newRow = worksheet.addRow(row);
      headers.forEach((key, colIndex) => {
        const cell = newRow.getCell(key);
        const value = row[key];

        if (value && typeof value === 'object' && 'value' in value && 'color' in value) {
          cell.value = value.value;
          if (value.color === 'red') {
            cell.font = { color: { argb: 'FFFF0000' } };
          } else if (value.color === 'blue') {
            cell.font = { color: { argb: 'FF0000FF' } };
          }
        }
      });
    });

    // Auto-filter headers
    worksheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(65 + headers.length - 1)}1` };

    // Generate Excel file and trigger download
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, fileName);
    });
  }

  async exportMultiSheetExcel(sheetsData: { name: string, data: any[], headers?: string[], styles?: 'basic' | 'styled' }[], fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    for (const sheetInfo of sheetsData) {
      const worksheet = workbook.addWorksheet(sheetInfo.name);

      if (sheetInfo.data.length === 0) {
        continue; // Skip empty sheets
      }

      let headers = sheetInfo.headers || Object.keys(sheetInfo.data[0]);

      // Set columns and apply header style if 'styled' is requested or headers are provided
      if (sheetInfo.styles === 'styled' || sheetInfo.headers) {
        worksheet.columns = headers.map(header => ({ header: header, key: header, width: 20 }));
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { horizontal: 'center' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
        });

        // Add data starting from the second row for styled sheets
        sheetInfo.data.forEach((row) => {
          worksheet.addRow(row);
        });
        // Apply auto-filter
        worksheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(65 + headers.length - 1)}1` };
      } else {
        // For 'basic' or no styles, just add rows directly
        worksheet.addRows([headers, ...sheetInfo.data]);
      }
    }

    // Generate Excel file and trigger download
    await workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, fileName);
    });
  }

  exportDynamicExcel(data: any[], fileName: string): void {
    const hasColor = data.some(row =>
      Object.values(row).some((cell: any) => cell && typeof cell === 'object' && 'color' in cell)
    );

    if (hasColor) {
      this.exportStyledExcel(data, 'Data', fileName);
    } else {
      this.exportToExcel(data, 'Data', fileName);
    }
  }
}
