import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateDemandeValidator(projectStart: string, projectEnd: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const dateDebut = control.get('dateDebut')?.value;
    const dateFin = control.get('dateFin')?.value;

    // Si l’un est vide, on laisse le validateur passer (ou on gère autrement)
    if (!dateDebut || !dateFin) {
      return null;
    }

    // Vérification dateDebut >= projectStart
    if (new Date(dateDebut) < new Date(projectStart)) {
      return { dateDebutTooEarly: true };
    }

    // Vérification dateFin <= projectEnd
    if (new Date(dateFin) > new Date(projectEnd)) {
      return { dateFinTooLate: true };
    }

    // Vérification dateDebut <= dateFin
    if (new Date(dateDebut) > new Date(dateFin)) {
      return { invalidRange: true };
    }

    return null; // OK
  };
}
