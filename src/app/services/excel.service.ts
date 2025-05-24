import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ← à ajouter
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private http: HttpClient) {} // ← injection de HttpClient

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
  exportToExcel(data: any[], fileName: string): void {
    // Import xlsx dynamically
    import('xlsx').then(xlsx => {
      // Create a worksheet from the data
      const worksheet = xlsx.utils.json_to_sheet(data);
      
      // Create a workbook and add the worksheet
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Generate Excel file and trigger download
      xlsx.writeFile(workbook, fileName);
    });
  }

  exportStyledExcel(data: any[], fileName: string): void {
  import('xlsx').then(xlsx => {
    const worksheet: any = {};

    const headers = Object.keys(data[0]);
    headers.forEach((key, colIndex) => {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: colIndex });
      worksheet[cellAddress] = {
        v: key,
        t: 's',
        s: { font: { bold: true }, alignment: { horizontal: 'center' } }
      };
    });

    data.forEach((row, rowIndex) => {
      headers.forEach((key, colIndex) => {
        const value = row[key];
        const cellAddress = xlsx.utils.encode_cell({ r: rowIndex + 1, c: colIndex });

        worksheet[cellAddress] = {
          v: value?.value ?? value,
          t: typeof value?.value === 'number' ? 'n' : 's',
          s: {
            font: {
              color: {
                rgb: value?.color === 'red' ? 'FF0000' :
                     value?.color === 'blue' ? '0000FF' : '000000'
              }
            }
          }
        };
      });
    });

    worksheet['!ref'] = xlsx.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: data.length, c: headers.length - 1 }
    });

    const workbook = {
      SheetNames: ['Data'],
      Sheets: { Data: worksheet }
    };

    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  });
}

exportDynamicExcel(data: any[], fileName: string): void {
  const hasColor = data.some(row =>
    Object.values(row).some((cell: any) => cell && typeof cell === 'object' && 'color' in cell)
  );

  if (hasColor) {
    this.exportStyledExcel(data, fileName);
  } else {
    this.exportToExcel(data, fileName);
  }
}


}
