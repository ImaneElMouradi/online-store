import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProductOrder } from '../product-order.model';
import { ProductOrderService } from '../service/product-order.service';
import { ProductOrderDeleteDialogComponent } from '../delete/product-order-delete-dialog.component';

@Component({
  selector: 'jhi-product-order',
  templateUrl: './product-order.component.html',
})
export class ProductOrderComponent implements OnInit {
  productOrders?: IProductOrder[];
  isLoading = false;

  constructor(protected productOrderService: ProductOrderService, protected modalService: NgbModal) {}

  loadAll(): void {
    this.isLoading = true;

    this.productOrderService.query().subscribe(
      (res: HttpResponse<IProductOrder[]>) => {
        this.isLoading = false;
        this.productOrders = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IProductOrder): number {
    return item.id!;
  }

  delete(productOrder: IProductOrder): void {
    const modalRef = this.modalService.open(ProductOrderDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.productOrder = productOrder;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}
