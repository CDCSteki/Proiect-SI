import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  cars: Car[] = [];
  availableSlots: string[] = [];
  loading = false;
  carsLoading = true;
  errorMessage = '';

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carService.getMyCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.carsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.carsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get minDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  onDateChange(): void {
    if (!this.form.dropoffDate) {
      this.availableSlots = [];
      return;
    }
    
    const dateParam = `${this.form.dropoffDate}T00:00:00`;
    this.appointmentService.getAvailableSlots(dateParam).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        if (!this.availableSlots.includes(this.form.dropoffTime)) {
          this.form.dropoffTime = this.availableSlots[0] || '';
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.availableSlots = [];
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  onSubmit(): void {
    if (!this.form.carId) {
      this.errorMessage = 'Please select a car.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.form.serviceType) {
      this.errorMessage = 'Please select a service type.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.form.dropoffDate) {
      this.errorMessage = 'Please select a drop-off date.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.form.dropoffTime) {
      this.errorMessage = 'Please select a drop-off time.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const combinedDateTime = `${this.form.dropoffDate}T${this.form.dropoffTime}:00`;

    const request = {
      carId: this.form.carId,
      scheduledAt: new Date(combinedDateTime).toISOString(),
      serviceType: this.form.serviceType,
      notes: this.form.notes || undefined
    };

    this.appointmentService.bookAppointment(request).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to book appointment. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}