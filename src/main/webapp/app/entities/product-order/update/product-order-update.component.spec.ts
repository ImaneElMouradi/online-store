jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ProductOrderService } from '../service/product-order.service';
import { IProductOrder, ProductOrder } from '../product-order.model';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IShoppingCart } from 'app/entities/shopping-cart/shopping-cart.model';
import { ShoppingCartService } from 'app/entities/shopping-cart/service/shopping-cart.service';

import { ProductOrderUpdateComponent } from './product-order-update.component';

describe('ProductOrder Management Update Component', () => {
  let comp: ProductOrderUpdateComponent;
  let fixture: ComponentFixture<ProductOrderUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let productOrderService: ProductOrderService;
  let productService: ProductService;
  let shoppingCartService: ShoppingCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ProductOrderUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(ProductOrderUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ProductOrderUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    productOrderService = TestBed.inject(ProductOrderService);
    productService = TestBed.inject(ProductService);
    shoppingCartService = TestBed.inject(ShoppingCartService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Product query and add missing value', () => {
      const productOrder: IProductOrder = { id: 456 };
      const product: IProduct = { id: 80438 };
      productOrder.product = product;

      const productCollection: IProduct[] = [{ id: 76511 }];
      jest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      jest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ productOrder });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(productCollection, ...additionalProducts);
      expect(comp.productsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call ShoppingCart query and add missing value', () => {
      const productOrder: IProductOrder = { id: 456 };
      const cart: IShoppingCart = { id: 47590 };
      productOrder.cart = cart;

      const shoppingCartCollection: IShoppingCart[] = [{ id: 67760 }];
      jest.spyOn(shoppingCartService, 'query').mockReturnValue(of(new HttpResponse({ body: shoppingCartCollection })));
      const additionalShoppingCarts = [cart];
      const expectedCollection: IShoppingCart[] = [...additionalShoppingCarts, ...shoppingCartCollection];
      jest.spyOn(shoppingCartService, 'addShoppingCartToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ productOrder });
      comp.ngOnInit();

      expect(shoppingCartService.query).toHaveBeenCalled();
      expect(shoppingCartService.addShoppingCartToCollectionIfMissing).toHaveBeenCalledWith(
        shoppingCartCollection,
        ...additionalShoppingCarts
      );
      expect(comp.shoppingCartsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const productOrder: IProductOrder = { id: 456 };
      const product: IProduct = { id: 59499 };
      productOrder.product = product;
      const cart: IShoppingCart = { id: 69791 };
      productOrder.cart = cart;

      activatedRoute.data = of({ productOrder });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(productOrder));
      expect(comp.productsSharedCollection).toContain(product);
      expect(comp.shoppingCartsSharedCollection).toContain(cart);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ProductOrder>>();
      const productOrder = { id: 123 };
      jest.spyOn(productOrderService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productOrder });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: productOrder }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(productOrderService.update).toHaveBeenCalledWith(productOrder);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ProductOrder>>();
      const productOrder = new ProductOrder();
      jest.spyOn(productOrderService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productOrder });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: productOrder }));
      saveSubject.complete();

      // THEN
      expect(productOrderService.create).toHaveBeenCalledWith(productOrder);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ProductOrder>>();
      const productOrder = { id: 123 };
      jest.spyOn(productOrderService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productOrder });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(productOrderService.update).toHaveBeenCalledWith(productOrder);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackProductById', () => {
      it('Should return tracked Product primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackProductById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackShoppingCartById', () => {
      it('Should return tracked ShoppingCart primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackShoppingCartById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
