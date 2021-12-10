import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { IShoppingCart, ShoppingCart } from '../shopping-cart.model';

import { ShoppingCartService } from './shopping-cart.service';

describe('ShoppingCart Service', () => {
  let service: ShoppingCartService;
  let httpMock: HttpTestingController;
  let elemDefault: IShoppingCart;
  let expectedResult: IShoppingCart | IShoppingCart[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ShoppingCartService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      placedDate: currentDate,
      status: OrderStatus.COMPLETED,
      totalPrice: 0,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentReference: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          placedDate: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a ShoppingCart', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          placedDate: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          placedDate: currentDate,
        },
        returnedFromService
      );

      service.create(new ShoppingCart()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ShoppingCart', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          placedDate: currentDate.format(DATE_TIME_FORMAT),
          status: 'BBBBBB',
          totalPrice: 1,
          paymentMethod: 'BBBBBB',
          paymentReference: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          placedDate: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ShoppingCart', () => {
      const patchObject = Object.assign(
        {
          placedDate: currentDate.format(DATE_TIME_FORMAT),
        },
        new ShoppingCart()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          placedDate: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ShoppingCart', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          placedDate: currentDate.format(DATE_TIME_FORMAT),
          status: 'BBBBBB',
          totalPrice: 1,
          paymentMethod: 'BBBBBB',
          paymentReference: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          placedDate: currentDate,
        },
        returnedFromService
      );

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a ShoppingCart', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addShoppingCartToCollectionIfMissing', () => {
      it('should add a ShoppingCart to an empty array', () => {
        const shoppingCart: IShoppingCart = { id: 123 };
        expectedResult = service.addShoppingCartToCollectionIfMissing([], shoppingCart);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(shoppingCart);
      });

      it('should not add a ShoppingCart to an array that contains it', () => {
        const shoppingCart: IShoppingCart = { id: 123 };
        const shoppingCartCollection: IShoppingCart[] = [
          {
            ...shoppingCart,
          },
          { id: 456 },
        ];
        expectedResult = service.addShoppingCartToCollectionIfMissing(shoppingCartCollection, shoppingCart);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ShoppingCart to an array that doesn't contain it", () => {
        const shoppingCart: IShoppingCart = { id: 123 };
        const shoppingCartCollection: IShoppingCart[] = [{ id: 456 }];
        expectedResult = service.addShoppingCartToCollectionIfMissing(shoppingCartCollection, shoppingCart);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(shoppingCart);
      });

      it('should add only unique ShoppingCart to an array', () => {
        const shoppingCartArray: IShoppingCart[] = [{ id: 123 }, { id: 456 }, { id: 44614 }];
        const shoppingCartCollection: IShoppingCart[] = [{ id: 123 }];
        expectedResult = service.addShoppingCartToCollectionIfMissing(shoppingCartCollection, ...shoppingCartArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const shoppingCart: IShoppingCart = { id: 123 };
        const shoppingCart2: IShoppingCart = { id: 456 };
        expectedResult = service.addShoppingCartToCollectionIfMissing([], shoppingCart, shoppingCart2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(shoppingCart);
        expect(expectedResult).toContain(shoppingCart2);
      });

      it('should accept null and undefined values', () => {
        const shoppingCart: IShoppingCart = { id: 123 };
        expectedResult = service.addShoppingCartToCollectionIfMissing([], null, shoppingCart, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(shoppingCart);
      });

      it('should return initial array if no ShoppingCart is added', () => {
        const shoppingCartCollection: IShoppingCart[] = [{ id: 123 }];
        expectedResult = service.addShoppingCartToCollectionIfMissing(shoppingCartCollection, undefined, null);
        expect(expectedResult).toEqual(shoppingCartCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
