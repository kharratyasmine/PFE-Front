import { Component, Input, OnInit } from '@angular/core';
import { HistoryService } from 'src/app/services/history.service';
import { GroupedHistory, History } from 'src/app/model/history.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  @Input() devisId!: number | undefined;
  histories: History[] = [];
  isEditModalOpen = false;
  sharedDescription: string = '';
  currentVersion: string = '';
  newActions: History[] = [];

  constructor(
    private historyService: HistoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.devisId) {
      this.loadHistories(this.devisId);
    } else {
      const idParam = this.route.snapshot.paramMap.get('id');
      const id = idParam ? +idParam : null;
      if (id) {
        this.devisId = id;
        this.loadHistories(id);
      }
    }
  }

  loadHistories(devisId: number): void {
    this.historyService.getByDevisId(devisId).subscribe({
      next: data => {
        this.histories = data;
        const versions = this.histories.map(h => parseInt(h.version));
        const max = versions.length ? Math.max(...versions) : 0;
        this.currentVersion = (max + 1).toString().padStart(2, '0');
      },
      error: err => console.error('❌ Erreur chargement historiques :', err)
    });
  }

  openAddModal(): void {
    this.sharedDescription = '';
    this.currentVersion = this.getNextVersion();
    this.newActions = [
      this.createAction('Written'),
      this.createAction('Verified'),
      this.createAction('Approved')
    ];
    this.isEditModalOpen = true;
  }

  createAction(action: string): History {
    return {
      id: undefined,
      devisId: this.devisId!,
      version: this.currentVersion,
      modificationDescription: '',
      action,
      date: new Date(),
      name: ''
    };
  }

  getNextVersion(): string {
    const versions = this.histories.map(h => parseInt(h.version));
    const max = versions.length ? Math.max(...versions) : 0;
    return (max + 1).toString().padStart(2, '0');
  }

  saveGroupedHistory(): void {
    const observables = this.newActions.map(action => {
      action.modificationDescription = this.sharedDescription;
      return this.historyService.add(this.devisId!, action);
    });

    Promise.all(observables.map(obs => obs.toPromise()))
      .then(() => {
        this.loadHistories(this.devisId!);
        this.closeModal();
      })
      .catch(err => console.error('Erreur ajout :', err));
  }

  deleteNewAction(index: number): void {
    this.newActions.splice(index, 1);
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.newActions = [];
  }

  get groupedHistories(): GroupedHistory[] {
    const grouped: { [version: string]: GroupedHistory } = {};

    this.histories.forEach(h => {
      if (!grouped[h.version]) {
        grouped[h.version] = {
          version: h.version,
          description: h.modificationDescription,
          actions: {}
        };
      }
      grouped[h.version].actions[h.action] = h;
    });

    return Object.values(grouped);
  }
}