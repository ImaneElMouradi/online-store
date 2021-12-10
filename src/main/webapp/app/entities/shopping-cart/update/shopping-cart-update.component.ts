import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IShoppingCart, ShoppingCart } from '../shopping-cart.model';
import { ShoppingCartService } from '../service/shopping-cart.service';
import { ICustomerDetails } from 'app/entities/customer-details/customer-details.model';
import { CustomerDetailsService } from 'app/entities/customer-details/service/customer-details.service';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';

@Component({
  selector: 'jhi-shopping-cart-update',
  templateUrl: './shopping-cart-update.component.html',
})
export class ShoppingCartUpdateComponent implements OnInit {
  isSaving = false;
  orderStatusValues = Object.keys(OrderStatus);
  paymentMethodValues = Object.keys(PaymentMethod);

  customerDetailsSharedCollection: ICustomerDetails[] = [];

  editForm = this.fb.group({
    id: [],
    placedDate: [null, [Validators.required]],
    status: [null, [Validators.required]],
    totalPrice: [null, [Validators.required, Validators.min(0)]],
    paymentMethod: [null, [Validators.required]],
    paymentReference: [],
    customerDetails: [null, Validators.required],
  });

  constructor(
    protected shoppingCartService: ShoppingCartService,
    protected customerDetailsService: CustomerDetailsService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ shoppingCart }) => {
      if (shoppingCart.id === undefined) {
        const today = dayjs().startOf('day');
        shoppingCart.placedDate = today;
      }

      this.updateForm(shoppingCart);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const shoppingCart = this.createFromForm();
    if (shoppingCart.id !== undefined) {
      this.subscribeToSaveResponse(this.shoppingCartService.update(shoppingCart));
    } else {
      this.subscribeToSaveResponse(this.shoppingCartService.create(shoppingCart));
    }
  }

  trackCustomerDetailsById(index: number, item: ICustomerDetails): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IShoppingCart>>): void {
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

  protected updateForm(shoppingCart: IShoppingCart): void {
    this.editForm.patchValue({
      id: shoppingCart.id,
      placedDate: shoppingCart.placedDate ? shoppingCart.placedDate.format(DATE_TIME_FORMAT) : null,
      status: shoppingCart.status,
      totalPrice: shoppingCart.totalPrice,
      paymentMethod: shoppingCart.paymentMethod,
      paymentReference: shoppingCart.paymentReference,
      customerDetails: shoppingCart.customerDetails,
    });

    this.customerDetailsSharedCollection = this.customerDetailsService.addCustomerDetailsToCollectionIfMissing(
      this.customerDetailsSharedCollection,
      shoppingCart.customerDetails
    );
  }

  protected loadRelationshipsOptions(): void {
    this.customerDetailsService
      .query()
      .pipe(map((res: HttpResponse<ICustomerDetails[]>) => res.body ?? []))
      .pipe(
        map((customerDetails: ICustomerDetails[]) =>
          this.customerDetailsService.addCustomerDetailsToCollectionIfMissing(customerDetails, this.editForm.get('customerDetails')!.value)
        )
      )
      .subscribe((customerDetails: ICustomerDetails[]) => (this.customerDetailsSharedCollection = customerDetails));
  }

  protected createFromForm(): IShoppingCart {
    return {
      ...new ShoppingCart(),
      id: this.editForm.get(['id'])!.value,
      placedDate: this.editForm.get(['placedDate'])!.value ? dayjs(this.editForm.get(['placedDate'])!.value, DATE_TIME_FORMAT) : undefined,
      status: this.editForm.get(['status'])!.value,
      totalPrice: this.editForm.get(['totalPrice'])!.value,
      paymentMethod: this.editForm.get(['paymentMethod'])!.value,
      paymentReference: this.editForm.get(['paymentReference'])!.value,
      customerDetails: this.editForm.get(['customerDetails'])!.value,
    };
  }
}
