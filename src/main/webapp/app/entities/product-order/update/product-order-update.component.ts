import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IProductOrder, ProductOrder } from '../product-order.model';
import { ProductOrderService } from '../service/product-order.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IShoppingCart } from 'app/entities/shopping-cart/shopping-cart.model';
import { ShoppingCartService } from 'app/entities/shopping-cart/service/shopping-cart.service';

@Component({
  selector: 'jhi-product-order-update',
  templateUrl: './product-order-update.component.html',
})
export class ProductOrderUpdateComponent implements OnInit {
  isSaving = false;

  productsSharedCollection: IProduct[] = [];
  shoppingCartsSharedCollection: IShoppingCart[] = [];

  editForm = this.fb.group({
    id: [],
    quantity: [null, [Validators.required, Validators.min(0)]],
    totalPrice: [null, [Validators.required, Validators.min(0)]],
    product: [null, Validators.required],
    cart: [null, Validators.required],
  });

  constructor(
    protected productOrderService: ProductOrderService,
    protected productService: ProductService,
    protected shoppingCartService: ShoppingCartService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ productOrder }) => {
      this.updateForm(productOrder);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const productOrder = this.createFromForm();
    if (productOrder.id !== undefined) {
      this.subscribeToSaveResponse(this.productOrderService.update(productOrder));
    } else {
      this.subscribeToSaveResponse(this.productOrderService.create(productOrder));
    }
  }

  trackProductById(index: number, item: IProduct): number {
    return item.id!;
  }

  trackShoppingCartById(index: number, item: IShoppingCart): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProductOrder>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(productOrder: IProductOrder): void {
    this.editForm.patchValue({
      id: productOrder.id,
      quantity: productOrder.quantity,
      totalPrice: productOrder.totalPrice,
      product: productOrder.product,
      cart: productOrder.cart,
    });

    this.productsSharedCollection = this.productService.addProductToCollectionIfMissing(
      this.productsSharedCollection,
      productOrder.product
    );
    this.shoppingCartsSharedCollection = this.shoppingCartService.addShoppingCartToCollectionIfMissing(
      this.shoppingCartsSharedCollection,
      productOrder.cart
    );
  }

  protected loadRelationshipsOptions(): void {
    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing(products, this.editForm.get('product')!.value))
      )
      .subscribe((products: IProduct[]) => (this.productsSharedCollection = products));

    this.shoppingCartService
      .query()
      .pipe(map((res: HttpResponse<IShoppingCart[]>) => res.body ?? []))
      .pipe(
        map((shoppingCarts: IShoppingCart[]) =>
          this.shoppingCartService.addShoppingCartToCollectionIfMissing(shoppingCarts, this.editForm.get('cart')!.value)
        )
      )
      .subscribe((shoppingCarts: IShoppingCart[]) => (this.shoppingCartsSharedCollection = shoppingCarts));
  }

  protected createFromForm(): IProductOrder {
    return {
      ...new ProductOrder(),
      id: this.editForm.get(['id'])!.value,
      quantity: this.editForm.get(['quantity'])!.value,
      totalPrice: this.editForm.get(['totalPrice'])!.value,
      product: this.editForm.get(['product'])!.value,
      cart: this.editForm.get(['cart'])!.value,
    };
  }
}
