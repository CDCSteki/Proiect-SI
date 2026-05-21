import { Component, OnInit, signal, computed } from '@angular/core';
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
  fullyBookedDates = signal<string[]>([]);
  loading = signal(false);
  carsLoading = signal(true);
  errorMessage = signal('');

  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1);
  selectedDate = signal<string>('');
  selectedTime = signal<string>('');

  allSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: { date: string; day: number; empty: boolean; past: boolean; fullyBooked: boolean }[] = [];

    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirst; i++) {
      days.push({ date: '', day: 0, empty: true, past: false, fullyBooked: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = date <= today;
      const isFullyBooked = this.fullyBookedDates().includes(dateStr);

      days.push({
        date: dateStr,
        day: d,
        empty: false,
        past: isPast,
        fullyBooked: isFullyBooked
      });
    }

    return days;
  });

  monthLabel = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth() - 1, 1);
    return date.toLocaleString('en', { month: 'long', year: 'numeric' });
  });

  serviceTypes = [
    'Oil Change', 'Brake Inspection', 'Tire Rotation',
    'Engine Diagnostics', 'Annual ITP Inspection',
    'Air Filter Replacement', 'Battery Replacement', 'General Repair'
  ];

  form = { carId: '', serviceType: '', notes: '' };

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
    this.loadFullyBookedDates();
  }

  loadFullyBookedDates(): void {
    this.appointmentService.getFullyBookedDates(
      this.currentYear(),
      this.currentMonth()
    ).subscribe({
      next: (dates) => this.fullyBookedDates.set(dates),
      error: () => {}
    });
  }

  prevMonth(): void {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.selectedDate.set('');
    this.selectedTime.set('');
    this.availableSlots.set([]);
    this.loadFullyBookedDates();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.selectedDate.set('');
    this.selectedTime.set('');
    this.availableSlots.set([]);
    this.loadFullyBookedDates();
  }

  selectDate(day: { date: string; empty: boolean; past: boolean; fullyBooked: boolean }): void {
    if (day.empty || day.past || day.fullyBooked) return;

    this.selectedDate.set(day.date);
    this.selectedTime.set('');

    this.appointmentService.getAvailableSlots(`${day.date}T00:00:00`).subscribe({
      next: (slots) => this.availableSlots.set(slots),
      error: () => this.availableSlots.set([])
    });
  }

  selectTime(slot: string): void {
    if (!this.availableSlots().includes(slot)) return;
    this.selectedTime.set(slot);
  }

  isSlotAvailable(slot: string): boolean {
    return this.availableSlots().includes(slot);
  }

  onSubmit(): void {
    if (!this.form.carId) { this.errorMessage.set('Please select a car.'); return; }
    if (!this.form.serviceType) { this.errorMessage.set('Please select a service type.'); return; }
    if (!this.selectedDate()) { this.errorMessage.set('Please select a date.'); return; }
    if (!this.selectedTime()) { this.errorMessage.set('Please select a time slot.'); return; }

    this.loading.set(true);
    this.errorMessage.set('');

    const request = {
      carId: this.form.carId,
      scheduledAt: `${this.selectedDate()}T${this.selectedTime()}:00`,
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