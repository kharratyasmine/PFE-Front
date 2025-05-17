import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/app/model/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  getUSerById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
    }
  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number,user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getRoles(): Observable<string[]> { // ✅ Retourne un tableau de string depuis l'API
    return this.http.get<string[]>(`${this.apiUrl}/roles`);
  }


updateProfileWithPhoto(data: any, photoFile?: File): Observable<any> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  return this.http.patch(`${this.apiUrl}/users/profile`, formData);
}

updateMyProfile(data: User): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/users/me`, data);
}

}