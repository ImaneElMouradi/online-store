import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ICustomerDetails, CustomerDetails } from '../customer-details.model';
import { CustomerDetailsService } from '../service/customer-details.service';

@Injectable({ providedIn: 'root' })
export class CustomerDetailsRoutingResolveService implements Resolve<ICustomerDetails> {
  constructor(protected service: CustomerDetailsService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ICustomerDetails> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((customerDetails: HttpResponse<CustomerDetails>) => {
          if (customerDetails.body) {
            return of(customerDetails.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new CustomerDetails());
  }
}
