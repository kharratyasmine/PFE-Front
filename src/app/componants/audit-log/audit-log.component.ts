import { Component, OnInit } from '@angular/core';
import { AuditLog } from 'src/app/model/audit-log.model';
import { AuditLogService } from 'src/app/services/audit-log.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  filterUser: string = '';
  filterProject: string = '';

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditLogService.getAllLogs().subscribe(data => this.logs = data);
  }

  filterByUser(): void {
    if (this.filterUser.trim()) {
      this.auditLogService.getLogsByUser(this.filterUser).subscribe(data => this.logs = data);
    } else {
      this.loadLogs();
    }
  }

  filterByProject(): void {
    if (this.filterProject.trim()) {
      this.auditLogService.getLogsByProject(this.filterProject).subscribe(data => this.logs = data);
    } else {
      this.loadLogs();
    }
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.logs.map(log => ({
        'User': log.username,
        'Action': log.action,
        'Entity': log.entityAffected,
        'Date': new Date(log.timestamp).toLocaleString(),
        'Details': log.parameters
      }))
    );

    const workbook: XLSX.WorkBook = { Sheets: { 'Audit Logs': worksheet }, SheetNames: ['Audit Logs'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    this.saveAsExcelFile(excelBuffer, 'audit_logs');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = `${fileName}_${new Date().getTime()}.xlsx`;
    link.click();
  }
}
