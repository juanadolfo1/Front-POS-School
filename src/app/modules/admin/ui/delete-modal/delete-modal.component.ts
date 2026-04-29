import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DeleteModalService } from './delete-modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss',
})
export class DeleteModalComponent implements OnInit {
  constructor(private deleteModalService: DeleteModalService) {}

  public callback: () => void;
  public title: string;
  public message: string;
  public isOpenModal: boolean;

  ngOnInit(): void {
    this.deleteModalService.isOpenDeleteModal$.subscribe({
      next: (isOpen) => {
        this.isOpenModal = isOpen;
      },
    });
    this.deleteModalService.callback$.subscribe({
      next: (callback) => {
        this.callback = callback;
      },
    });
    this.deleteModalService.title$.subscribe({
      next: (title) => {
        this.title = title;
      },
    });
    this.deleteModalService.message$.subscribe({
      next: (message) => {
        this.message = message;
      },
    });
  }

  onHide() {
    this.deleteModalService.closeDeleteModal();
  }

  onDelete() {
    this.callback();
    this.deleteModalService.closeDeleteModal();
  }
}
