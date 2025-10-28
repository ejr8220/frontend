import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private currentTitle = 'Inicio';

  setTitle(title: string): void {
    this.currentTitle = title;
  }

  getTitle(): string {
    return this.currentTitle;
  }
}