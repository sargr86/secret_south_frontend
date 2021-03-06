import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from '@core/components/layout/header/header.component';
import {FooterComponent} from '@core/components/layout/footer/footer.component';
import {NavbarComponent} from '@core/components/layout/navbar/navbar.component';
import {LeftSidebarComponent} from '@core/components/layout/left-sidebar/left-sidebar.component';
import {SharedModule} from '@shared/shared.module';
import {NotFoundComponent} from '@core/components/not-found/not-found.component';
import {DriverAssignmentDialogComponent} from './components/dialogs/driver-assignment-dialog/driver-assignment-dialog.component';
import {ToastrModule} from 'ngx-toastr';
import {SaveRouteDialogComponent} from './components/dialogs/save-route-dialog/save-route-dialog.component';
import {ChangePricesDialogComponent} from './components/dialogs/change-prices-dialog/change-prices-dialog.component';
import {ConfirmationDialogComponent} from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {SaveLocationDialogComponent} from './components/dialogs/save-location-dialog/save-location-dialog.component';
import { AddDailyTourComponent } from './components/dialogs/add-daily-tour/add-daily-tour.component';
import { SaveDailyTourDialogComponent } from './components/dialogs/save-daily-tour-dialog/save-daily-tour-dialog.component';


@NgModule({
  declarations: [
    NavbarComponent,
    HeaderComponent,
    LeftSidebarComponent,
    FooterComponent,
    NotFoundComponent,
    DriverAssignmentDialogComponent,
    SaveRouteDialogComponent,
    ChangePricesDialogComponent,
    ConfirmationDialogComponent,
    SaveLocationDialogComponent,
    AddDailyTourComponent,
    SaveDailyTourDialogComponent,
    LeftSidebarComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ToastrModule.forRoot({
      preventDuplicates: true
    }),
    NgxMatSelectSearchModule
  ],
  exports: [
    NavbarComponent,
    HeaderComponent,
    LeftSidebarComponent,
    FooterComponent,
  ],
  entryComponents: [
    DriverAssignmentDialogComponent,
    SaveRouteDialogComponent,
    SaveLocationDialogComponent,
    ConfirmationDialogComponent
  ]
})
export class CoreModule {
}
