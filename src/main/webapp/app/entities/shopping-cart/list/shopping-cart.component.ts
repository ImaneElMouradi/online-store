import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IShoppingCart } from '../shopping-cart.model';
import { ShoppingCartService } from '../service/shopping-cart.service';
import { ShoppingCartDeleteDialogComponent } from '../delete/shopping-cart-delete-dialog.component';

@Component({
  selector: 'jhi-shopping-cart',
  templateUrl: './shopping-cart.component.html',
})
export class ShoppingCartComponent implements OnInit {
  shoppingCarts?: IShoppingCart[];
  isLoading = false;

  constructor(protected shoppingCartService: ShoppingCartService, protected modalService: NgbModal) {}

  loadAll(): void {
    this.isLoading = true;

    this.shoppingCartService.query().subscribe(
      (res: HttpResponse<IShoppingCart[]>) => {
        this.isLoading = false;
        this.shoppingCarts = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IShoppingCart): number {
    return item.id!;
  }

  delete(shoppingCart: IShoppingCart): void {
    const modalRef = this.modalService.open(ShoppingCartDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.shoppingCart = shoppingCart;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}
