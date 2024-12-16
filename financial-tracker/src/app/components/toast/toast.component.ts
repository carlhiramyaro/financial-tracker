import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" [class.show]="show">
      <div class="toast-content" [class.success]="type === 'success'">
        <i class="fas" [class.fa-check-circle]="type === 'success'"></i>
        <span>{{ message }}</span>
        <button class="close-btn" (click)="onClose()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      margin-top: 1rem;
      opacity: 0;
      height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .toast-container.show {
      opacity: 1;
      height: auto;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      text-align: center;
    }

    .toast-content.success {
      border-left: 4px solid #10B981;
    }

    .toast-content i.fa-check-circle {
      color: #10B981;
      font-size: 1.25rem;
    }

    .toast-content span {
      flex-grow: 1;
      color: #1F2937;
      font-weight: 500;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #4B5563;
    }
  `]
})
export class ToastComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Input() show: boolean = false;
  @Output() closeToast = new EventEmitter<void>();

  onClose() {
    this.closeToast.emit();
  }
} 