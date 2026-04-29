import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteModalService {
  private isOpenDeleteModal = new BehaviorSubject<boolean>(false);
  private title = new BehaviorSubject<string>('');
  private message = new BehaviorSubject<string>('');
  private callbackOnConfirm = new BehaviorSubject<(() => void) | null>(null);

  constructor() { }

  public get isOpenDeleteModal$() {
    return this.isOpenDeleteModal.asObservable();
  }

  public get callback$() {
    return this.callbackOnConfirm.asObservable();
  }

  public get title$() {
    return this.title.asObservable();
  }

  public get message$() {
    return this.message.asObservable();
  }

  openDeleteModal(callback: () => void, title: string, message: string): void {
    this.callbackOnConfirm.next(callback);
    this.title.next(title);
    this.message.next(message);
    this.isOpenDeleteModal.next(true);

  }

  closeDeleteModal(): void {
    this.isOpenDeleteModal.next(false);
    this.title.next('');
    this.message.next('');
    this.callbackOnConfirm.next(null);
  }
}
