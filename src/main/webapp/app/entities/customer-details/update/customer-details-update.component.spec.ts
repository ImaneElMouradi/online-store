jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { CustomerDetailsService } from '../service/customer-details.service';
import { ICustomerDetails, CustomerDetails } from '../customer-details.model';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { CustomerDetailsUpdateComponent } from './customer-details-update.component';

describe('CustomerDetails Management Update Component', () => {
  let comp: CustomerDetailsUpdateComponent;
  let fixture: ComponentFixture<CustomerDetailsUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let customerDetailsService: CustomerDetailsService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [CustomerDetailsUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(CustomerDetailsUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    customerDetailsService = TestBed.inject(CustomerDetailsService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const customerDetails: ICustomerDetails = { id: 456 };
      const user: IUser = { id: 29616 };
      customerDetails.user = user;

      const userCollection: IUser[] = [{ id: 31025 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ customerDetails });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(userCollection, ...additionalUsers);
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const customerDetails: ICustomerDetails = { id: 456 };
      const user: IUser = { id: 785 };
      customerDetails.user = user;

      activatedRoute.data = of({ customerDetails });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(customerDetails));
      expect(comp.usersSharedCollection).toContain(user);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<CustomerDetails>>();
      const customerDetails = { id: 123 };
      jest.spyOn(customerDetailsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customerDetails });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: customerDetails }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(customerDetailsService.update).toHaveBeenCalledWith(customerDetails);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<CustomerDetails>>();
      const customerDetails = new CustomerDetails();
      jest.spyOn(customerDetailsService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customerDetails });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: customerDetails }));
      saveSubject.complete();

      // THEN
      expect(customerDetailsService.create).toHaveBeenCalledWith(customerDetails);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<CustomerDetails>>();
      const customerDetails = { id: 123 };
      jest.spyOn(customerDetailsService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customerDetails });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(customerDetailsService.update).toHaveBeenCalledWith(customerDetails);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackUserById', () => {
      it('Should return tracked User primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackUserById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
