import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../core/layout/main-layout/main-layout';
import { AppointmentService } from '../../../core/services/appointment';
import { CarService, Car } from '../../../core/services/car';

@Component({
  selector: 'app-appointment-new',
  standalone: true,
  imports: [MainLayout, FormsModule],
  templateUrl: './appointment-new.html',
  styleUrl: './appointment-new.scss'
})
export class AppointmentNew implements OnInit {

  cars = signal<Car[]>([]);
  availableSlots = signal<string[]>([]);
  loading = signal(false);
  carsLoading = signal(true);
  errorMessage = signal('');

  serviceTypes = [
    'Oil Change',
    'Brake Inspection',
    'Tire Rotation',
    'Engine Diagnostics',
    'Annual ITP Inspection',
    'Air Filter Replacement',
    'Battery Replacement',
    'General Repair'
  ];

  form = {
    carId: '',
    dropoffDate: '',
    dropoffTime: '',
    serviceType: '',
    notes: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private carService: CarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carService.getMyCars().subscribe({
      next: (data) => {
        this.cars.set(data);
        this.carsLoading.set(false);
      },
      error: () => this.carsLoading.set(false)
    });
  }

  get minDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  onDateChange(): void {
    if (!this.form.dropoffDate) {
      this.availableSlots.set([]);
      return;
    }

    const dateParam = `${this.form.dropoffDate}T00:00:00`;
    this.appointmentService.getAvailableSlots(dateParam).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        if (!slots.includes(this.form.dropoffTime)) {
          this.form.dropoffTime = slots[0] || '';
        }
      },
      error: () => this.availableSlots.set([])
    });
  }

  onSubmit(): void {
    if (!this.form.carId) {
      this.errorMessage.set('Please select a car.');
      return;
    }
    if (!this.form.serviceType) {
      this.errorMessage.set('Please select a service type.');
      return;
    }
    if (!this.form.dropoffDate) {
      this.errorMessage.set('Please select a drop-off date.');
      return;
    }
    if (!this.form.dropoffTime) {
      this.errorMessage.set('Please select a drop-off time.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const combinedDateTime = `${this.form.dropoffDate}T${this.form.dropoffTime}:00`;

    const request = {
      carId: this.form.carId,
      scheduledAt: new Date(combinedDateTime).toISOString(),
      serviceType: this.form.serviceType,
      notes: this.form.notes || undefined
    };

    this.appointmentService.bookAppointment(request).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to book appointment.');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}