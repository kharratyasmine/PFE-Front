import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  private cloudName = 'dvvr5uv1d';  // 🔥 Remplace par ton Cloud Name Cloudinary
  private uploadPreset = 'PFE-Workpilot';  // 🔥 Remplace par ton upload preset (configuré dans Cloudinary)

  constructor(private http: HttpClient) {}

  /**
   * Upload une image sur Cloudinary.
   * @param file FormData contenant l'image à uploader
   * @returns Observable avec les données de l'image
   */
  uploadImage(file: FormData): Observable<any> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    return this.http.post(url, file);
  }
}
