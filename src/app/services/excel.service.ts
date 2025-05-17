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
}
