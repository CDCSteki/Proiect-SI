import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {

  visible = signal(false);
  title = signal('');
  message = signal('');

  private resolvePromise!: (value: boolean) => void;

  open(title: string, message: string): Promise<boolean> {
    this.title.set(title);
    this.message.set(message);
    this.visible.set(true);

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  confirm(): void {
    this.visible.set(false);
    this.resolvePromise(true);
  }

  cancel(): void {
    this.visible.set(false);
    this.resolvePromise(false);
  }
}