import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Deliveries } from '../model/deliveries.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {

  private baseUrl = 'http://localhost:8080/deliveries'; // URL backend

  constructor(private http: HttpClient) { }

  // Prépare l'objet delivery avant envoi au backend
  private prepareDeliveryForBackend(delivery: Deliveries): any {
    // Clone l'objet pour ne pas modifier l'original
    const backendDelivery = { ...delivery };
    
    // Assure que les dates sont au format ISO (YYYY-MM-DD) pour le backend
    if (backendDelivery.plannedDate) {
      // Vérifie que c'est bien une chaîne au format date
      if (typeof backendDelivery.plannedDate === 'string' && backendDelivery.plannedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Déjà au bon format, on ne fait rien
      } else {
        // Si c'est un objet Date, on le convertit
        try {
          const date = new Date(backendDelivery.plannedDate);
          backendDelivery.plannedDate = date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Erreur de conversion de date plannedDate', e);
        }
      }
    }
    
    if (backendDelivery.effectiveDate) {
      // Vérifie que c'est bien une chaîne au format date
      if (typeof backendDelivery.effectiveDate === 'string' && backendDelivery.effectiveDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Déjà au bon format, on ne fait rien
      } else {
        // Si c'est un objet Date, on le convertit
        try {
          const date = new Date(backendDelivery.effectiveDate);
          backendDelivery.effectiveDate = date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Erreur de conversion de date effectiveDate', e);
        }
      }
    }
    
    return backendDelivery;
  }

  addDelivery(psrId: number, delivery: Deliveries): Observable<Deliveries> {
    console.log(`📤 Envoi d'une livraison au PSR ${psrId}:`, delivery);
    
    // Prépare l'objet pour le backend
    const backendDelivery = this.prepareDeliveryForBackend(delivery);
    
    return this.http.post<Deliveries>(`${this.baseUrl}/psr/${psrId}`, backendDelivery)
      .pipe(
        tap(response => console.log('✅ Réponse du serveur:', response)),
        catchError(error => {
          this.handleError('Ajout de livraison', error);
          return of({} as Deliveries);
        })
      );
  }

  getDeliveriesByPsr(psrId: number): Observable<Deliveries[]> {
    console.log(`🔍 Récupération des livraisons pour le PSR ${psrId}`);
    return this.http.get<Deliveries[]>(`${this.baseUrl}/psr/${psrId}/deliveries`)
      .pipe(
        tap(deliveries => console.log(`✅ ${deliveries.length} livraisons récupérées`)),
        catchError(error => {
          this.handleError('Récupération des livraisons', error);
          return of([]);
        })
      );
  }

  deleteDelivery(psrId: number, deliveryId: number): Observable<void> {
    console.log(`🗑️ Suppression de la livraison ${deliveryId} du PSR ${psrId}`);
    return this.http.delete<void>(`${this.baseUrl}/${deliveryId}`)
      .pipe(
        tap(() => console.log('✅ Livraison supprimée avec succès')),
        catchError(error => {
          this.handleError('Suppression de livraison', error);
          return of(undefined);
        })
      );
  }

  private handleError(operation: string, error: HttpErrorResponse): void {
    console.error(`❌ Erreur lors de l'opération: ${operation}`, error);
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      console.error(`Erreur client: ${error.error.message}`);
    } else {
      // Erreur côté serveur
      console.error(`Code d'erreur: ${error.status}, ` +
        `Message: ${error.message}`);
      
      // Logs additionnels pour faciliter le débogage
      if (error.status === 0) {
        console.error('Vérifiez que le serveur backend est en cours d\'exécution et accessible');
      } else if (error.status === 404) {
        console.error('URL introuvable. Vérifiez votre configuration d\'API');
      }
    }
  }
}
