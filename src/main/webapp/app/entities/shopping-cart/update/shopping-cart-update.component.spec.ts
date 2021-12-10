jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ShoppingCartService } from '../service/shopping-cart.service';
import { IShoppingCart, ShoppingCart } from '../shopping-cart.model';
import { ICustomerDetails } from 'app/entities/customer-details/customer-details.model';
import { CustomerDetailsService } from 'app/entities/customer-details/service/customer-details.service';

import { ShoppingCartUpdateComponent } from './shopping-cart-update.component';

describe('ShoppingCart Management Update Component', () => {
  let comp: ShoppingCartUpdateComponent;
  let fixture: ComponentFixture<ShoppingCartUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let shoppingCartService: ShoppingCartService;
  let customerDetailsService: CustomerDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ShoppingCartUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(ShoppingCartUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ShoppingCartUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    shoppingCartService = TestBed.inject(ShoppingCartService);
    customerDetailsService = TestBed.inject(CustomerDetailsService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call CustomerDetails query and add missing value', () => {
      const shoppingCart: IShoppingCart = { id: 456 };
      const customerDetails: ICustomerDetails = { id: 17423 };
      shoppingCart.customerDetails = customerDetails;

      const customerDetailsCollection: ICustomerDetails[] = [{ id: 29286 }];
      jest.spyOn(customerDetailsService, 'query').mockReturnValue(of(new HttpResponse({ body: customerDetailsCollection })));
      const additionalCustomerDetails = [customerDetails];
      const expectedCollection: ICustomerDetails[] = [...additionalCustomerDetails, ...customerDetailsCollection];
      jest.spyOn(customerDetailsService, 'addCustomerDetailsToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ shoppingCart });
      comp.ngOnInit();

      expect(customerDetailsService.query).toHaveBeenCalled();
      expect(customerDetailsService.addCustomerDetailsToCollectionIfMissing).toHaveBeenCalledWith(
        customerDetailsCollection,
        ...additionalCustomerDetails
      );
      expect(comp.customerDetailsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const shoppingCart: IShoppingCart = { id: 456 };
      const customerDetails: ICustomerDetails = { id: 26989 };
      shoppingCart.customerDetails = customerDetails;

      activatedRoute.data = of({ shoppingCart });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(shoppingCart));
      expect(comp.customerDetailsSharedCollection).toContain(customerDetails);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ShoppingCart>>();
      const shoppingCart = { id: 123 };
      jest.spyOn(shoppingCartService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ shoppingCart });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: shoppingCart }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(shoppingCartService.update).toHaveBeenCalledWith(shoppingCart);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ShoppingCart>>();
      const shoppingCart = new ShoppingCart();
      jest.spyOn(shoppingCartService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ shoppingCart });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: shoppingCart }));
      saveSubject.complete();

      // THEN
      expect(shoppingCartService.create).toHaveBeenCalledWith(shoppingCart);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ShoppingCart>>();
      const shoppingCart = { id: 123 };
      jest.spyOn(shoppingCartService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ shoppingCart });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(shoppingCartService.update).toHaveBeenCalledWith(shoppingCart);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackCustomerDetailsById', () => {
      it('Should return tracked CustomerDetails primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackCustomerDetailsById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
