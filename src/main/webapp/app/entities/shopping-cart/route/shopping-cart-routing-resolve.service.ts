import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IShoppingCart, ShoppingCart } from '../shopping-cart.model';
import { ShoppingCartService } from '../service/shopping-cart.service';

@Injectable({ providedIn: 'root' })
export class ShoppingCartRoutingResolveService implements Resolve<IShoppingCart> {
  constructor(protected service: ShoppingCartService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IShoppingCart> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((shoppingCart: HttpResponse<ShoppingCart>) => {
          if (shoppingCart.body) {
            return of(shoppingCart.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new ShoppingCart());
  }
}
