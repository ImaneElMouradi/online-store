import { IUser } from 'app/entities/user/user.model';
import { IShoppingCart } from 'app/entities/shopping-cart/shopping-cart.model';
import { Gender } from 'app/entities/enumerations/gender.model';

export interface ICustomerDetails {
  id?: number;
  gender?: Gender;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  country?: string;
  user?: IUser;
  carts?: IShoppingCart[] | null;
}

export class CustomerDetails implements ICustomerDetails {
  constructor(
    public id?: number,
    public gender?: Gender,
    public phone?: string,
    public addressLine1?: string,
    public addressLine2?: string | null,
    public city?: string,
    public country?: string,
    public user?: IUser,
    public carts?: IShoppingCart[] | null
  ) {}
}

export function getCustomerDetailsIdentifier(customerDetails: ICustomerDetails): number | undefined {
  return customerDetails.id;
}
