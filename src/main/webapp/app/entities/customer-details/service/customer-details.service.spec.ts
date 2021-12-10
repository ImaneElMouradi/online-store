import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Gender } from 'app/entities/enumerations/gender.model';
import { ICustomerDetails, CustomerDetails } from '../customer-details.model';

import { CustomerDetailsService } from './customer-details.service';

describe('CustomerDetails Service', () => {
  let service: CustomerDetailsService;
  let httpMock: HttpTestingController;
  let elemDefault: ICustomerDetails;
  let expectedResult: ICustomerDetails | ICustomerDetails[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(CustomerDetailsService);
    httpMock = TestBed.inject(HttpTestingController);

    elemDefault = {
      id: 0,
      gender: Gender.MALE,
      phone: 'AAAAAAA',
      addressLine1: 'AAAAAAA',
      addressLine2: 'AAAAAAA',
      city: 'AAAAAAA',
      country: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign({}, elemDefault);

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a CustomerDetails', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.create(new CustomerDetails()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a CustomerDetails', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          gender: 'BBBBBB',
          phone: 'BBBBBB',
          addressLine1: 'BBBBBB',
          addressLine2: 'BBBBBB',
          city: 'BBBBBB',
          country: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a CustomerDetails', () => {
      const patchObject = Object.assign(
        {
          addressLine1: 'BBBBBB',
          addressLine2: 'BBBBBB',
          city: 'BBBBBB',
        },
        new CustomerDetails()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign({}, returnedFromService);

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of CustomerDetails', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          gender: 'BBBBBB',
          phone: 'BBBBBB',
          addressLine1: 'BBBBBB',
          addressLine2: 'BBBBBB',
          city: 'BBBBBB',
          country: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a CustomerDetails', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addCustomerDetailsToCollectionIfMissing', () => {
      it('should add a CustomerDetails to an empty array', () => {
        const customerDetails: ICustomerDetails = { id: 123 };
        expectedResult = service.addCustomerDetailsToCollectionIfMissing([], customerDetails);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(customerDetails);
      });

      it('should not add a CustomerDetails to an array that contains it', () => {
        const customerDetails: ICustomerDetails = { id: 123 };
        const customerDetailsCollection: ICustomerDetails[] = [
          {
            ...customerDetails,
          },
          { id: 456 },
        ];
        expectedResult = service.addCustomerDetailsToCollectionIfMissing(customerDetailsCollection, customerDetails);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a CustomerDetails to an array that doesn't contain it", () => {
        const customerDetails: ICustomerDetails = { id: 123 };
        const customerDetailsCollection: ICustomerDetails[] = [{ id: 456 }];
        expectedResult = service.addCustomerDetailsToCollectionIfMissing(customerDetailsCollection, customerDetails);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(customerDetails);
      });

      it('should add only unique CustomerDetails to an array', () => {
        const customerDetailsArray: ICustomerDetails[] = [{ id: 123 }, { id: 456 }, { id: 31832 }];
        const customerDetailsCollection: ICustomerDetails[] = [{ id: 123 }];
        expectedResult = service.addCustomerDetailsToCollectionIfMissing(customerDetailsCollection, ...customerDetailsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const customerDetails: ICustomerDetails = { id: 123 };
        const customerDetails2: ICustomerDetails = { id: 456 };
        expectedResult = service.addCustomerDetailsToCollectionIfMissing([], customerDetails, customerDetails2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(customerDetails);
        expect(expectedResult).toContain(customerDetails2);
      });

      it('should accept null and undefined values', () => {
        const customerDetails: ICustomerDetails = { id: 123 };
        expectedResult = service.addCustomerDetailsToCollectionIfMissing([], null, customerDetails, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(customerDetails);
      });

      it('should return initial array if no CustomerDetails is added', () => {
        const customerDetailsCollection: ICustomerDetails[] = [{ id: 123 }];
        expectedResult = service.addCustomerDetailsToCollectionIfMissing(customerDetailsCollection, undefined, null);
        expect(expectedResult).toEqual(customerDetailsCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
