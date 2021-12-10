jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { ICustomerDetails, CustomerDetails } from '../customer-details.model';
import { CustomerDetailsService } from '../service/customer-details.service';

import { CustomerDetailsRoutingResolveService } from './customer-details-routing-resolve.service';

describe('CustomerDetails routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: CustomerDetailsRoutingResolveService;
  let service: CustomerDetailsService;
  let resultCustomerDetails: ICustomerDetails | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(CustomerDetailsRoutingResolveService);
    service = TestBed.inject(CustomerDetailsService);
    resultCustomerDetails = undefined;
  });

  describe('resolve', () => {
    it('should return ICustomerDetails returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultCustomerDetails = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultCustomerDetails).toEqual({ id: 123 });
    });

    it('should return new ICustomerDetails if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultCustomerDetails = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultCustomerDetails).toEqual(new CustomerDetails());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as CustomerDetails })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultCustomerDetails = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultCustomerDetails).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
