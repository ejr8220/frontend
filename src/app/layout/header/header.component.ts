import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TitleService } from 'src/app/shared/title.service';
import { CompanySessionService, CurrentCompany } from 'src/app/shared/company-session.service';
import { CompanyService } from 'src/app/general/service/company.service';
import { AuthService } from 'src/app/Auth/auth.service';
import { DialogModule, DialogComponent } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('companyDialog') companyDialog?: DialogComponent;
  
  @Output() toggleSidebar = new EventEmitter<void>();

  currentCompany: CurrentCompany | null = null;
  allCompanies: any[] = [];
  showCompanyDialog = false;

  constructor(
    public titleService: TitleService,
    private companySessionService: CompanySessionService,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentCompany = this.companySessionService.getCurrentCompany();
    this.companySessionService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
    });
    this.loadAllCompanies();
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  openCompanySelector(): void {
    this.showCompanyDialog = true;
  }

  loadAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (response: any) => {
        this.allCompanies = response.result || response;
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
      }
    });
  }

  selectCompany(company: any): void {
    const currentCompany: CurrentCompany = {
      id: company.id,
      name: company.legalName
    };
    this.companySessionService.setCurrentCompany(currentCompany);
    this.showCompanyDialog = false;
    if (this.companyDialog) {
      this.companyDialog.hide();
    }
  }

  closeDialog(): void {
    this.showCompanyDialog = false;
    if (this.companyDialog) {
      this.companyDialog.hide();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
