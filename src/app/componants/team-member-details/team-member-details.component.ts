import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamMember } from 'src/app/model/TeamMember.model';
import { TeamMemberService } from 'src/app/services/team-member.service';

@Component({
  selector: 'app-team-member-details',
  templateUrl: './team-member-details.component.html',
  styleUrls: ['./team-member-details.component.css']
})
export class TeamMemberDetailsComponent implements OnInit {
  member: TeamMember | null = null;
  memberId: number | null = null;
  isLoading = true;
  isDeleting = false;
  selectedMonth: Date = new Date();
  filteredHolidays: string[] = [];
  months: { value: Date; label: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private teamMemberService: TeamMemberService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const memberId = +params['id'];
      if (!isNaN(memberId)) {
        this.loadMemberDetails(memberId);
      } else {
        console.error('❌ ID de membre invalide');
        this.isLoading = false;
      }
    });
  }

  loadMemberDetails(id: number): void {
    this.isLoading = true;
    this.teamMemberService.getMemberById(id).subscribe({
      next: (data) => {
        this.member = data;
        this.generateMonthList();
        this.filterHolidays();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement membre :', err);
        this.isLoading = false;
      }
    });
  }

  private generateMonthList(): void {
    this.months = [];
    if (!this.member?.holiday || this.member.holiday.length === 0) {
      // If no holidays, just show the current month
      const currentDate = new Date();
       this.months.push({
        value: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        label: currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });
      this.selectedMonth = this.months[0].value;
      return;
    }

    const uniqueMonths = new Set<string>();
    this.member.holiday.forEach(holidayString => {
      const holidayDate = new Date(holidayString);
      // Use YYYY-MM to ensure uniqueness by month and year
      uniqueMonths.add(`${holidayDate.getFullYear()}-${holidayDate.getMonth()}`);
    });

    // Add current month to the list to make it easily accessible
     const currentDate = new Date();
     uniqueMonths.add(`${currentDate.getFullYear()}-${currentDate.getMonth()}`);

    const sortedMonths = Array.from(uniqueMonths)
      .map(monthYear => {
        const [year, month] = monthYear.split('-').map(Number);
        return new Date(year, month, 1);
      })
      .sort((a, b) => a.getTime() - b.getTime());

    this.months = sortedMonths.map(date => ({
      value: date,
      label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }));

    // Set the selected month to the earliest month with a holiday, or the current month
    const earliestHolidayMonth = sortedMonths.length > 0 ? sortedMonths[0] : new Date();
    this.selectedMonth = new Date(earliestHolidayMonth.getFullYear(), earliestHolidayMonth.getMonth(), 1);
  }

  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedMonth = new Date(select.value);
    this.filterHolidays();
  }

  filterHolidays(): void {
    if (!this.member?.holiday) {
      this.filteredHolidays = [];
      return;
    }

    const selectedMonth = this.selectedMonth.getMonth();
    const selectedYear = this.selectedMonth.getFullYear();

    this.filteredHolidays = this.member.holiday
      .filter(day => {
        const holidayDate = new Date(day);
        return holidayDate.getMonth() === selectedMonth && 
               holidayDate.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  deleteHoliday(day: string): void {
    if (!this.member || !this.member.id || !this.member.holiday) {
      console.error('Impossible de supprimer le congé : données manquantes');
      return;
    }

    this.isDeleting = true;
    const updatedHolidays = this.member.holiday.filter(h => h !== day);
    
    const updatedMember: TeamMember = {
      id: this.member.id,
      name: this.member.name,
      initial: this.member.initial,
      jobTitle: this.member.jobTitle,
      image: this.member.image,
      note: this.member.note,
      role: this.member.role,
      holiday: updatedHolidays,
      teams: this.member.teams || [],
      cost: this.member.cost,
      startDate: this.member.startDate,
      endDate: this.member.endDate,
      status: this.member.status,
      experienceRange: this.member.experienceRange
    };
    
    this.teamMemberService.updateTeamMember(this.member.id, updatedMember).subscribe({
      next: (updatedData) => {
        if (this.member) {
          this.member.holiday = updatedHolidays;
          this.generateMonthList(); // Regenerate month list after deletion
          this.filterHolidays();
        }
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du congé :', err);
        this.isDeleting = false;
      }
    });
  }
}
