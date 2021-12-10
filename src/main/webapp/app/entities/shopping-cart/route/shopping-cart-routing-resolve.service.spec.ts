jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IShoppingCart, ShoppingCart } from '../shopping-cart.model';
import { ShoppingCartService } from '../service/shopping-cart.service';

import { ShoppingCartRoutingResolveService } from './shopping-cart-routing-resolve.service';

describe('ShoppingCart routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: ShoppingCartRoutingResolveService;
  let service: ShoppingCartService;
  let resultShoppingCart: IShoppingCart | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(ShoppingCartRoutingResolveService);
    service = TestBed.inject(ShoppingCartService);
    resultShoppingCart = undefined;
  });

  describe('resolve', () => {
    it('should return IShoppingCart returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultShoppingCart = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultShoppingCart).toEqual({ id: 123 });
    });

    it('should return new IShoppingCart if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultShoppingCart = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultShoppingCart).toEqual(new ShoppingCart());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as ShoppingCart })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultShoppingCart = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultShoppingCart).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
