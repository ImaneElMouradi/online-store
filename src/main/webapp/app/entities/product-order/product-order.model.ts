import { IProduct } from 'app/entities/product/product.model';
import { IShoppingCart } from 'app/entities/shopping-cart/shopping-cart.model';

export interface IProductOrder {
  id?: number;
  quantity?: number;
  totalPrice?: number;
  product?: IProduct;
  cart?: IShoppingCart;
}

export class ProductOrder implements IProductOrder {
  constructor(
    public id?: number,
    public quantity?: number,
    public totalPrice?: number,
    public product?: IProduct,
    public cart?: IShoppingCart
  ) {}
}

export function getProductOrderIdentifier(productOrder: IProductOrder): number | undefined {
  return productOrder.id;
}
