import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleService } from 'src/app/shared/title.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(public titleService: TitleService) {}

  @Output() toggleSidebar = new EventEmitter<void>();

  onToggle(): void {
    console.log('HeaderComponent: Emitting toggleSidebar event');
    this.toggleSidebar.emit();
  }
}