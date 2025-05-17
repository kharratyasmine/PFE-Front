import { Component } from '@angular/core';
import { ExcelService } from 'src/app/services/excel.service';


@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html'
})
export class ExcelImportComponent {
  parsedData: any = null;

  constructor(private excelService: ExcelService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.excelService.uploadExcel(file).subscribe({
        next: (data) => {
          this.parsedData = data;
          console.log('✅ Données importées :', data);
        },
        error: (err) => {
          console.error('❌ Erreur import Excel :', err);
        }
      });
    }
  }

  getSheetNames(): string[] {
    return Object.keys(this.parsedData || {});
  }
  
}
