import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FerriesService} from '@core/services/ferries.service';
import {preventDuplicateLocations} from '@core/helpers/prevent-duplicate-locations';
import {MIN_PEOPLE_ON_FERRY} from '@core/constants/global';

@Component({
  selector: 'app-save-route-dialog',
  templateUrl: './save-route-dialog.component.html',
  styleUrls: ['./save-route-dialog.component.scss']
})
export class SaveRouteDialogComponent implements OnInit {

  saveRouteForm: FormGroup;
  locations;
  isSubmitted = false;
  routeName;
  suggestedRoutes;
  fromMap = false;
  totalPrice: number;
  routeData;
  edit = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private ferriesService: FerriesService,
    private dialog: MatDialogRef<SaveRouteDialogComponent>
  ) {
    console.log(data)
    this.fromMap = data.map;
    this.routeData = data.route;
    this.edit = !!this.routeData;
    if (this.fromMap) {

    }


    this.getSuggestedRoutes();

    this.saveRouteForm = this.fb.group({
      name: ['', Validators.required],
      start_point: ['', Validators.required],
      stop_1: [''],
      stop_2: [''],
      end_point: ['', Validators.required],
      geometry_type: ['LineString'],
      coordinates: [data.coordinates], // Validators.required,
      map: this.fromMap,
      single: ['0'],
      return: ['0'],
      total: new FormControl({value: '', disabled: true}, Validators.required),
    }, {validators: preventDuplicateLocations('start_point', 'stop_1', 'stop_2', 'end_point')});


    // Edit route case
    if (this.routeData) {
      this.totalPrice = this.routeData.total;
      this.routeName = this.routeData.name;
      this.saveRouteForm.addControl('_id', new FormControl('', Validators.required));
      this.saveRouteForm.patchValue(this.routeData);
    }


  }

  ngOnInit(): void {
    this.ferriesService.getLocations().subscribe(dt => {
      this.locations = dt;
    });


  }

  getSuggestedRoutes() {
    this.ferriesService.getAllRoutes().subscribe((dt: any) => {
      this.suggestedRoutes = dt;
    });
  }

  saveRoute() {
    this.isSubmitted = true;
    if (this.saveRouteForm.valid) {
      this.ferriesService.saveRoutePrice(this.saveRouteForm.value).subscribe(dt => {
        this.dialog.close(dt);
      });
    }
  }

  generateRouteName() {
    const startPoint = this.startPoint.value;
    const stop1 = this.stop_1.value;
    const stop2 = this.stop_2.value;
    const endPoint = this.endPoint.value;
    this.routeName = `${startPoint ? startPoint : ''}${stop1 ? ' - ' + stop1 : ''}${stop2 ? ' - ' + stop2 : ''}${endPoint ? ' - ' + endPoint : ''}`;
    console.log(this.routeName)
    this.saveRouteForm.patchValue({name: this.routeName});
  }

  useRouteCoordinates(e) {
    const routeName = e.source.selected._element.nativeElement.innerText;
    const selectedRoute = this.suggestedRoutes.find(r => r.name === routeName);
    this.saveRouteForm.patchValue({coordinates: selectedRoute.coordinates});
  }

  countTotalPrice(ctrl) {
    const changedPrice = this.saveRouteForm.value[ctrl];
    this.totalPrice = MIN_PEOPLE_ON_FERRY * changedPrice;
  }

  get startPoint(): AbstractControl {
    return this.saveRouteForm.get('start_point');
  }

  get endPoint(): AbstractControl {
    return this.saveRouteForm.get('end_point');
  }

  get stop_1(): AbstractControl {
    return this.saveRouteForm.get('stop_1');
  }

  get stop_2(): AbstractControl {
    return this.saveRouteForm.get('stop_2');
  }

  get coordinates(): AbstractControl {
    return this.saveRouteForm.get('coordinates');
  }

}
