import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../service/branch.service';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { GridModule, FilterService, PageService, ToolbarService, EditService, CommandColumnService } from '@syncfusion/ej2-angular-grids';
import { DialogModule, DialogComponent, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { SearchInputComponent, SearchInputConfig } from '../../shared/search-input/search-input.component';
import { CompanyService, Company } from '../service/company.service';
import { IdentificationTypeService } from '../service/identification-type.service';
import { environment } from '../../../environments/environment';

interface Branch {
  id?: number;
  name: string;
  companyId: number;
  cityId: number | null;
  countryId?: number | null;
  provinceId?: number | null;
  country?: any;
  province?: any;
  city?: any;
}

@Component({
  selector: 'app-crud-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    TextBoxModule,
    UploaderModule,
    DropDownListModule,
    ButtonModule,
    GridModule,
    DialogModule,
    TooltipModule,
    SearchInputComponent
  ],
  templateUrl: './crud_company.component.html',
  styleUrls: ['./crud_company.component.scss'],
  providers: [FilterService, PageService, ToolbarService, EditService, CommandColumnService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CrudCompanyComponent implements OnInit {
  companyForm!: FormGroup;
  isEditMode = false;
  companyId: number | null = null;
  isLoading = false;
  activeTab: 'general' | 'branches' = 'general';
  environment = environment;

  // Datos para dropdowns
  identificationTypes: any[] = [];
  countries: any[] = [];
  provinces: any[] = [];
  cities: any[] = [];
  provincesLoading = false;
  citiesLoading = false;
  selectedCountryId: number | null = null;
  selectedCountry: any = null;
  selectedProvince: any = null;
  selectedCity: any = null;
  branches: Branch[] = [];
  private branchLocalSequence = 1;

  // Configuración de búsqueda para Country
  countrySearchConfig: SearchInputConfig = {
    columns: [
      { field: 'name', headerText: 'País', width: 200 },
      { field: 'isoCode', headerText: 'Código', width: 100 },
      { field: 'phonePrefix', headerText: 'Prefijo', width: 100 }
    ],
    method: environment.api.url + environment.api.pathCountry,
    params: {},
    title: 'Seleccione el país'
  };

  provinceSearchConfig: SearchInputConfig | null = null;
  citySearchConfig: SearchInputConfig | null = null;

  // Sucursales
  branchForm!: FormGroup;
  isAddingBranch = false;
  editingBranchId: number | null = null;
  isCertificateModalOpen = false;
  selectedPfxFile: File | null = null;
  pfxPassword = '';
  showPfxPassword = false;
  isUploadingCertificate = false;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private identificationTypeService: IdentificationTypeService,
    private branchService: BranchService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
    this.initializeBranchForm();
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.companyId = +params['id'];
        this.loadCompany(this.companyId);
        // Also load branches immediately for edit mode
        this.loadBranches(this.companyId);
      }
    });
  }

  activateTab(tab: 'general' | 'branches'): void {
    this.activeTab = tab;
    console.log(tab);
    console.log(this.companyId);
    if (tab == 'branches' && this.companyId) {
        console.log("entro a branches");
      this.loadBranches(this.companyId);
    }
  }

  initializeForm(): void {
    this.companyForm = this.fb.group({
      identificationTypeId: ['', [Validators.required]],
      identificationNumber: ['', [Validators.required]],
      legalName: ['', [Validators.required]],
      tradeName: ['', [Validators.required]],
      address: ['', [Validators.required]],
      countryId: ['', [Validators.required]],
      provinceId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      legalRepresentativeName: ['', [Validators.required]],
      legalRepresentativeIdentification: ['', [Validators.required]],
      pfxRoute: [''],
      pfxKey: [''],
      accountantName: ['', [Validators.required]],
      accountantIdentification: ['', [Validators.required]]
    });

    // Deshabilitar selects dependientes hasta tener datos
    this.companyForm.get('provinceId')?.disable({ emitEvent: false });
    this.companyForm.get('cityId')?.disable({ emitEvent: false });
  }

  initializeBranchForm(): void {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required]],
      cityId: ['', [Validators.required]]
    });
  }

  loadDropdownData(): void {
    // Cargar tipos de identificación desde API
    this.identificationTypeService.getAll().subscribe({
      next: (data) => {
        console.log('IdentificationType data loaded:', data);
        this.identificationTypes = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tipos de identificación:', error);
        this.identificationTypes = [];
      }
    });
  }

  loadBranches(companyId: number): void {
    this.branchService.getByCompany(companyId).subscribe({
      next: (list: any[]) => {
        console.log('Branches loaded:', list);
        // Normalize keeping only companyId, keep nested objects for display
        this.branches = (list || []).map((b: any) => this.normalizeBranchRow({
          id: b.id,
          name: b.name,
          companyId: b.company?.id ?? companyId,
          countryId: b.country?.id ?? null,
          provinceId: b.province?.id ?? null,
          cityId: b.city?.id ?? null,
          city: b.city || null,
          province: b.province || null,
          country: b.country || null
        }));
        console.log('Branches normalized:', this.branches);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar sucursales:', err);
        this.branches = [];
      }
    });
  }

  onIdentificationTypeChange(event: any): void {
    console.log('Identification Type selected:', event);
  }

  loadCompany(id: number): void {
    this.isLoading = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (company: any) => {
        const countryId = company.country?.id ?? company.countryId;
        const provinceId = company.province?.id ?? company.provinceId;
        const cityId = company.city?.id ?? company.cityId;
        this.companyForm.patchValue({
          identificationTypeId: company.identificationTypeId,
          identificationNumber: company.identificationNumber,
          legalName: company.legalName,
          tradeName: company.tradeName,
          address: company.address,
          countryId,
          provinceId,
          cityId,
          phoneNumber: company.phoneNumber,
          email: company.email,
          legalRepresentativeName: company.legalRepresentativeName,
          legalRepresentativeIdentification: company.legalRepresentativeIdentification,
          pfxRoute: company.pfxRoute || '',
          pfxKey: company.pfxKey || '',
          accountantName: company.accountantName,
          accountantIdentification: company.accountantIdentification
        });
        this.selectedCountryId = countryId;
        this.selectedCountry = company.country || null;
        this.selectedProvince = company.province || null;
        this.selectedCity = company.city || null;
        this.cdr.detectChanges();
        // Preconfigure search inputs when editing
        if (countryId) {
          this.provinceSearchConfig = {
            columns: [
              { field: 'name', headerText: 'Provincia', width: 200 },
              { field: 'isoCode', headerText: 'Código', width: 100 }
            ],
            method: `${environment.api.url}/api/general/Province/getProvinceByCountry/${countryId}`,
            params: {},
            title: 'Seleccione la provincia'
          };
        }
        if (provinceId) {
          this.citySearchConfig = {
            columns: [
              { field: 'name', headerText: 'Ciudad', width: 200 }
            ],
            method: `${environment.api.url}/api/general/City/getCityByProvince/${provinceId}`,
            params: {},
            title: 'Seleccione la ciudad'
          };
        }
        if (countryId) {
          this.loadProvinces(countryId, provinceId, cityId);
        }
        this.branches = company.branchesFk || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar la empresa:', error);
        alert('Error al cargar la empresa. Por favor, intente nuevamente.');
        this.isLoading = false;
        this.router.navigate(['/general/company']);
      }
    });
  }

  openCertificateModal(): void {
    this.isCertificateModalOpen = true;
    this.selectedPfxFile = null;
    this.pfxPassword = this.companyForm.get('pfxKey')?.value || '';
    this.showPfxPassword = false;
  }

  closeCertificateModal(): void {
    this.isCertificateModalOpen = false;
    this.selectedPfxFile = null;
    this.showPfxPassword = false;
  }

  onPfxFileSelected(args: any): void {
    const file = args?.filesData?.[0]?.rawFile as File;
    this.selectedPfxFile = file || null;
  }

  togglePfxPasswordVisibility(): void {
    this.showPfxPassword = !this.showPfxPassword;
  }

  uploadCertificate(): void {
    if (!this.selectedPfxFile) {
      alert('Debe seleccionar un archivo .pfx');
      return;
    }

    if (!this.pfxPassword || !this.pfxPassword.trim()) {
      alert('Debe ingresar la clave del certificado.');
      return;
    }

    this.isUploadingCertificate = true;
    this.companyService.uploadPfxCertificate(this.selectedPfxFile).subscribe({
      next: (response) => {
        this.companyForm.patchValue({
          pfxRoute: response?.route || '',
          pfxKey: this.pfxPassword
        });
        this.isUploadingCertificate = false;
        this.closeCertificateModal();
      },
      error: (error) => {
        console.error('Error al cargar certificado pfx:', error);
        alert(error?.error?.message || 'No fue posible cargar el certificado pfx.');
        this.isUploadingCertificate = false;
      }
    });
  }

  onCountryChange(countryId: number): void {
    // Cargar provincias del país seleccionado
    console.log('País seleccionado:', countryId);
  }

  onCountrySelect(country: any): void {
    const countryId = country?.id || null;
    this.selectedCountryId = countryId;
    this.selectedCountry = country;
    this.selectedProvince = null;
    this.selectedCity = null;
    this.companyForm.patchValue({ countryId, provinceId: '', cityId: '' });
    this.companyForm.get('provinceId')?.disable({ emitEvent: false });
    this.companyForm.get('cityId')?.disable({ emitEvent: false });
    this.cities = [];
    this.citySearchConfig = null;
    this.provinceSearchConfig = countryId
      ? {
          columns: [
            { field: 'name', headerText: 'Provincia', width: 200 },
            { field: 'isoCode', headerText: 'Código', width: 100 }
          ],
          method: `${environment.api.url}/api/general/Province/getProvinceByCountry/${countryId}`,
          params: {},
          title: 'Seleccione la provincia'
        }
      : null;

    if (countryId) {
      this.loadProvinces(countryId);
    }
  }

  onCountryClear(): void {
    this.selectedCountryId = null;
    this.selectedCountry = null;
    this.selectedProvince = null;
    this.selectedCity = null;
    this.companyForm.patchValue({ countryId: '', provinceId: '', cityId: '' });
    this.provinces = [];
    this.cities = [];
    this.companyForm.get('provinceId')?.disable({ emitEvent: false });
    this.companyForm.get('cityId')?.disable({ emitEvent: false });
    this.provinceSearchConfig = null;
    this.citySearchConfig = null;
  }

  onProvinceChange(provinceId: number): void {
    // Cargar ciudades de la provincia seleccionada
    console.log('Provincia seleccionada:', provinceId);
    if (!provinceId) {
      this.companyForm.patchValue({ cityId: '' });
      this.companyForm.get('cityId')?.disable({ emitEvent: false });
      this.citySearchConfig = null;
      return;
    }

    this.companyForm.get('cityId')?.enable({ emitEvent: false });
    this.citySearchConfig = {
      columns: [
        { field: 'name', headerText: 'Ciudad', width: 200 }
      ],
      method: `${environment.api.url}/api/general/City/getCityByProvince/${provinceId}`,
      params: {},
      title: 'Seleccione la ciudad'
    };
    this.loadCities(provinceId);
  }

  onProvinceSelect(province: any): void {
    const provinceId = province?.id || null;
    this.selectedProvince = province;
    this.selectedCity = null;
    this.companyForm.patchValue({ provinceId, cityId: '' });
    this.onProvinceChange(provinceId);
  }

  onProvinceClear(): void {
    this.selectedProvince = null;
    this.selectedCity = null;
    this.companyForm.patchValue({ provinceId: '', cityId: '' });
    this.companyForm.get('cityId')?.disable({ emitEvent: false });
    this.citySearchConfig = null;
  }

  onCitySelect(city: any): void {
    const cityId = city?.id || null;
    this.selectedCity = city;
    this.companyForm.patchValue({ cityId });
  }

  onCityClear(): void {
    this.selectedCity = null;
    this.companyForm.patchValue({ cityId: '' });
  }

  // Grid event handlers for branches grid
  onBranchActionBegin(args: any): void {
    if (!args) {
      return;
    }

    if (args.requestType === 'add' && args.data) {
      args.data.companyId = this.companyId || 0;
      args.data.country = null;
      args.data.province = null;
      args.data.city = null;
      args.data.countryId = null;
      args.data.provinceId = null;
      args.data.cityId = null;
      (args.data as any)._localId = this.branchLocalSequence++;
    }

    if (args.requestType === 'save' && args.data) {
      const data: any = this.normalizeBranchRow(args.data);

      if (!data.name || !String(data.name).trim()) {
        args.cancel = true;
        alert('Debe ingresar el nombre de la sucursal.');
        return;
      }

      if (!data.countryId) {
        args.cancel = true;
        alert('Debe seleccionar un país.');
        return;
      }

      if (!data.provinceId) {
        args.cancel = true;
        alert('Debe seleccionar una provincia.');
        return;
      }

      if (!data.cityId) {
        args.cancel = true;
        alert('Debe seleccionar una ciudad.');
        return;
      }

      Object.assign(args.data, data);
    }
  }

  onBranchActionComplete(args: any): void {
    if (!args) {
      return;
    }

    if (args.requestType === 'save' && args.data) {
      const savedRow = this.normalizeBranchRow(args.data);
      const byIdIndex = savedRow.id ? this.branches.findIndex(b => b.id === savedRow.id) : -1;
      const byLocalIndex = byIdIndex < 0 ? this.branches.findIndex((b: any) => (b as any)._localId === (savedRow as any)._localId) : -1;
      const rowIndex = byIdIndex >= 0 ? byIdIndex : byLocalIndex;

      if (rowIndex >= 0) {
        this.branches[rowIndex] = savedRow;
      } else {
        this.branches = [...this.branches, savedRow];
      }

      this.branches = [...this.branches];
      this.cdr.detectChanges();
    }

    if (args.requestType === 'delete') {
      this.branches = [...this.branches];
      this.cdr.detectChanges();
    }
  }

  // Accessors for nested names in grid display
  countryNameAccessor(field: string, data: any, column: any): string {
    return data?.country?.name || '';
  }

  provinceNameAccessor(field: string, data: any, column: any): string {
    return data?.province?.name || '';
  }

  cityNameAccessor(field: string, data: any, column: any): string {
    return data?.city?.name || '';
  }

  // Helpers for dynamic search configs per row in branches grid
  getProvinceSearchConfigForRow(row: any): SearchInputConfig | null {
    const countryId = row?.country?.id || row?.countryId;
    if (!countryId) return null;
    return {
      columns: [
        { field: 'name', headerText: 'Provincia', width: 200 },
        { field: 'isoCode', headerText: 'Código', width: 100 }
      ],
      method: `${environment.api.url}/api/general/Province/getProvinceByCountry/${countryId}`,
      params: {},
      title: 'Seleccione la provincia'
    };
  }

  getCitySearchConfigForRow(row: any): SearchInputConfig | null {
    const provinceId = row?.province?.id || row?.provinceId;
    if (!provinceId) return null;
    return {
      columns: [
        { field: 'name', headerText: 'Ciudad', width: 200 }
      ],
      method: `${environment.api.url}/api/general/City/getCityByProvince/${provinceId}`,
      params: {},
      title: 'Seleccione la ciudad'
    };
  }

  private loadProvinces(countryId: number, provinceToSelect?: number, cityToSelect?: number): void {
    this.provincesLoading = true;
    this.provinces = [];
    const shouldClearProvince = !provinceToSelect;
    const shouldClearCity = !cityToSelect;
    if (shouldClearProvince) {
      this.companyForm.patchValue({ provinceId: '' });
      this.companyForm.get('provinceId')?.disable({ emitEvent: false });
    }
    if (shouldClearCity) {
      this.companyForm.patchValue({ cityId: '' });
      this.companyForm.get('cityId')?.disable({ emitEvent: false });
    }

    const url = `${environment.api.url}/api/general/Province/getProvinceByCountry/${countryId}`;
    this.http.get<any>(url, { headers: this.buildHeaders() }).subscribe({
      next: (response) => {
        this.provinces = response?.result || response?.data || response || [];
        if (this.provinces.length) {
          this.companyForm.get('provinceId')?.enable({ emitEvent: false });
          if (provinceToSelect) {
            this.companyForm.patchValue({ provinceId: provinceToSelect });
            this.companyForm.get('cityId')?.enable({ emitEvent: false });
            this.citySearchConfig = {
              columns: [
                { field: 'name', headerText: 'Ciudad', width: 200 }
              ],
              method: `${environment.api.url}/api/general/City/getCityByProvince/${provinceToSelect}`,
              params: {},
              title: 'Seleccione la ciudad'
            };
            this.loadCities(provinceToSelect, cityToSelect);
          }
        }
        this.provincesLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar provincias:', err);
        this.provinces = [];
        this.provincesLoading = false;
        this.companyForm.get('provinceId')?.disable({ emitEvent: false });
        this.companyForm.get('cityId')?.disable({ emitEvent: false });
        this.citySearchConfig = null;
      }
    });
  }

  private loadCities(provinceId: number, cityToSelect?: number): void {
    if (!provinceId) {
      this.cities = [];
      this.companyForm.patchValue({ cityId: '' });
      this.companyForm.get('cityId')?.disable({ emitEvent: false });
      this.citySearchConfig = null;
      return;
    }

    this.citiesLoading = true;
    this.cities = [];
    this.companyForm.patchValue({ cityId: '' });
    this.companyForm.get('cityId')?.disable({ emitEvent: false });

    const url = `${environment.api.url}/api/general/City/getCityByProvince/${provinceId}`;
    this.http.get<any>(url, { headers: this.buildHeaders() }).subscribe({
      next: (response) => {
        this.cities = response?.result || response?.data || response || [];
        if (this.cities.length) {
          this.companyForm.get('cityId')?.enable({ emitEvent: false });
          if (cityToSelect) {
            this.companyForm.patchValue({ cityId: cityToSelect });
          }
        }
        this.citiesLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
        this.cities = [];
        this.citiesLoading = false;
        this.companyForm.get('cityId')?.disable({ emitEvent: false });
      }
    });
  }

  private buildHeaders(): HttpHeaders {
    const token = this.getTokenFromCookie();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  private getTokenFromCookie(): string {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'authToken') {
        return decodeURIComponent(value);
      }
    }
    return '';
  }

  onSubmit(): void {
    if (!this.companyForm.valid) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    this.isLoading = true;
    const formData = {
      id: this.companyId || 0,
      ...this.companyForm.value,
      branchesFk: this.branches.map(branch => ({
        id: branch.id,
        name: branch.name,
        companyId: branch.companyId || this.companyId || 0,
        cityId: branch.city?.id ?? branch.cityId ?? 0
      }))
    };

    if (this.isEditMode && this.companyId) {
      this.companyService.updateCompany(this.companyId, formData).subscribe({
        next: () => {
          alert('Empresa actualizada correctamente');
          this.router.navigate(['/general/company']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al actualizar la empresa:', error);
          alert('Error al actualizar la empresa. Por favor, intente nuevamente.');
          this.isLoading = false;
        }
      });
    } else {
      this.companyService.createCompany(formData).subscribe({
        next: () => {
          alert('Empresa creada correctamente');
          this.router.navigate(['/general/company']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al crear la empresa:', error);
          alert('Error al crear la empresa. Por favor, intente nuevamente.');
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (confirm('¿Desea descartar los cambios?')) {
      this.router.navigate(['/general/company']);
    }
  }

  // Métodos para sucursales
  addBranch(): void {
    if (!this.branchForm.valid) {
      alert('Por favor, complete los datos de la sucursal');
      return;
    }

    const newBranch: Branch = {
      ...this.branchForm.value,
      companyId: this.companyId || 0
    };

    this.branches.push(newBranch);
    this.branchForm.reset();
    this.isAddingBranch = false;
  }

  editBranch(index: number): void {
    const branch = this.branches[index];
    this.branchForm.patchValue(branch);
    this.editingBranchId = branch.id || null;
    this.isAddingBranch = true;
  }

  saveBranch(): void {
    if (!this.branchForm.valid) {
      alert('Por favor, complete los datos de la sucursal');
      return;
    }

    const updatedBranch: Branch = {
      ...this.branchForm.value,
      id: this.editingBranchId || undefined,
      companyId: this.companyId || 0
    };

    const index = this.branches.findIndex(b => b.id === this.editingBranchId);
    if (index >= 0) {
      this.branches[index] = updatedBranch;
    }

    this.branchForm.reset();
    this.editingBranchId = null;
    this.isAddingBranch = false;
  }

  deleteBranch(index: number): void {
    if (confirm('¿Desea eliminar esta sucursal?')) {
      this.branches.splice(index, 1);
    }
  }

  cancelBranch(): void {
    this.branchForm.reset();
    this.editingBranchId = null;
    this.isAddingBranch = false;
  }

  onBranchCountrySelect(row: any, country: any): void {
    row.country = country || null;
    row.countryId = country?.id || null;
    row.province = null;
    row.provinceId = null;
    row.city = null;
    row.cityId = null;
    this.cdr.detectChanges();
  }

  onBranchCountryClear(row: any): void {
    row.country = null;
    row.countryId = null;
    row.province = null;
    row.provinceId = null;
    row.city = null;
    row.cityId = null;
    this.cdr.detectChanges();
  }

  onBranchProvinceSelect(row: any, province: any): void {
    row.province = province || null;
    row.provinceId = province?.id || null;
    row.city = null;
    row.cityId = null;
    this.cdr.detectChanges();
  }

  onBranchProvinceClear(row: any): void {
    row.province = null;
    row.provinceId = null;
    row.city = null;
    row.cityId = null;
    this.cdr.detectChanges();
  }

  onBranchCitySelect(row: any, city: any): void {
    row.city = city || null;
    row.cityId = city?.id || null;
    this.cdr.detectChanges();
  }

  onBranchCityClear(row: any): void {
    row.city = null;
    row.cityId = null;
    this.cdr.detectChanges();
  }

  private normalizeBranchRow(row: any): Branch {
    const normalized = {
      ...row,
      name: (row?.name || '').trim(),
      companyId: row?.companyId || this.companyId || 0,
      countryId: row?.country?.id ?? row?.countryId ?? null,
      provinceId: row?.province?.id ?? row?.provinceId ?? null,
      cityId: row?.city?.id ?? row?.cityId ?? null,
      country: row?.country || null,
      province: row?.province || null,
      city: row?.city || null
    } as Branch;

    if (!(normalized as any)._localId) {
      (normalized as any)._localId = this.branchLocalSequence++;
    }

    return normalized;
  }
}
