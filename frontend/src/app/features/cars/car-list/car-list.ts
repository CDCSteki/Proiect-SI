import { Component, OnInit, signal } from '@angular/core';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { CarService, Car, CarRequest } from '../../../core/services/car';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [MainLayout, FormsModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.scss'
})
export class CarList implements OnInit {

  cars = signal<Car[]>([]);
  loading = signal(true);
  showAddForm = signal(false);
  addLoading = signal(false);
  errorMessage = signal('');

  newCar: CarRequest = {
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear()
  };

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.carService.getMyCars().subscribe({
      next: (data) => {
        this.cars.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addCar(): void {
    if (!this.newCar.licensePlate || !this.newCar.make || !this.newCar.model) {
      this.errorMessage.set('All fields are required.');
      return;
    }

    this.addLoading.set(true);
    this.errorMessage.set('');

    this.carService.addCar(this.newCar).subscribe({
      next: (car) => {
        this.cars.update(cars => [...cars, car]);
        this.showAddForm.set(false);
        this.addLoading.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.addLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to add car.');
      }
    });
  }

  deleteCar(id: string): void {
    if (!confirm('Are you sure you want to delete this car?')) return;

    this.carService.deleteCar(id).subscribe({
      next: () => {
        this.cars.update(cars => cars.filter(c => c.id !== id));
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete car.');
      }
    });
  }

  resetForm(): void {
    this.newCar = {
      licensePlate: '',
      make: '',
      model: '',
      year: new Date().getFullYear()
    };
  }

  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    this.errorMessage.set('');
    this.resetForm();
  }
}