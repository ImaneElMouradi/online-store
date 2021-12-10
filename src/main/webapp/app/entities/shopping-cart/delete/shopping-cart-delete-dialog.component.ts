import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IShoppingCart } from '../shopping-cart.model';
import { ShoppingCartService } from '../service/shopping-cart.service';

@Component({
  templateUrl: './shopping-cart-delete-dialog.component.html',
})
export class ShoppingCartDeleteDialogComponent {
  shoppingCart?: IShoppingCart;

  constructor(protected shoppingCartService: ShoppingCartService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.shoppingCartService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
