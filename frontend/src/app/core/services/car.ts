import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  clientId: string;
}

export interface CarRequest {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
}

@Injectable({ providedIn: 'root' })
export class CarService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getMyCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars/my`);
  }

  addCar(data: CarRequest): Observable<Car> {
    return this.http.post<Car>(`${this.apiUrl}/cars`, data);
  }

  deleteCar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cars/${id}`);
  }

  getCarHistory(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cars/${id}/history`);
  }
}