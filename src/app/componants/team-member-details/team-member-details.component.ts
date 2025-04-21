import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-member-details',
  templateUrl: './team-member-details.component.html',
  styleUrls: ['./team-member-details.component.css']
})
export class TeamMemberDetailsComponent implements OnInit {

  // Liste de mois
  months: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Exemple de données (vous pouvez les charger depuis un service)
  resources: any[] = [
    {
      resource: 'Alice Dupont',
      role: 'Developer',
      monthlyData: { Jan: 5, Feb: 8, Mar: 6, Apr: 7, May: 5, Jun: 0, Jul: 2, Aug: 4, Sep: 1, Oct: 0, Nov: 3, Dec: 5 }
    },
    {
      resource: 'Bob Martin',
      role: 'Tester',
      monthlyData: { Jan: 10, Feb: 0, Mar: 3, Apr: 1, May: 0, Jun: 2, Jul: 6, Aug: 0, Sep: 4, Oct: 5, Nov: 2, Dec: 8 }
    },
    {
      resource: 'Charlie Smith',
      role: 'Project Manager',
      monthlyData: { Jan: 2, Feb: 2, Mar: 2, Apr: 2, May: 2, Jun: 2, Jul: 2, Aug: 2, Sep: 2, Oct: 2, Nov: 2, Dec: 2 }
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Récupère la valeur d'un mois pour un "resource item"
   */
  getMonthValue(item: any, month: string): number {
    return item.monthlyData[month] ?? 0;
  }
}