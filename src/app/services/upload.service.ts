import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {}

  /**
   * Upload une image sur Cloudinary.
   * @param file FormData contenant l'image à uploader
   * @returns Observable avec les données de l'image
   */
uploadTeamMemberImage(id: number, data: FormData) {
  return this.http.post(`http://localhost:8080/teamMembers/${id}/upload-image`, data);
}



}