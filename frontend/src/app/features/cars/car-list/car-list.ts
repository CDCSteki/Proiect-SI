import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  cars: Car[] = [];
  loading = true;
  showAddForm = false;
  addLoading = false;
  errorMessage = '';

  newCar: CarRequest = {
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear()
  };

  constructor(
    private carService: CarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.carService.getMyCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  addCar(): void {
    if (!this.newCar.licensePlate || !this.newCar.make || !this.newCar.model) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.addLoading = true;
    this.errorMessage = '';

    this.carService.addCar(this.newCar).subscribe({
      next: (car) => {
        this.cars.push(car);
        this.showAddForm = false;
        this.addLoading = false;
        this.resetForm();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.addLoading = false;
        this.errorMessage = err.error?.message || 'Failed to add car.';
        this.cdr.markForCheck();
      }
    });
  }

  deleteCar(id: string): void {
    if (!confirm('Are you sure you want to delete this car?')) return;

    this.carService.deleteCar(id).subscribe({
      next: () => {
        this.cars = this.cars.filter(c => c.id !== id);
        this.cdr.markForCheck();
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
    this.showAddForm = !this.showAddForm;
    this.errorMessage = '';
    this.resetForm();
  }
}