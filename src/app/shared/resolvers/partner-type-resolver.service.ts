import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {FerryService} from '../../admin/services/ferry.service';
import {PartnerService} from '../../admin/services/partner.service';

@Injectable({
  providedIn: 'root'
})
export class PartnerTypeResolverService implements Resolve<any> {

  constructor(
      private _ferries: FerryService,
      private _partners: PartnerService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    return this._partners.getTypes();
  }
}
