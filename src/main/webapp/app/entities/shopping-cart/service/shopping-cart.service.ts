import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IShoppingCart, getShoppingCartIdentifier } from '../shopping-cart.model';

export type EntityResponseType = HttpResponse<IShoppingCart>;
export type EntityArrayResponseType = HttpResponse<IShoppingCart[]>;

@Injectable({ providedIn: 'root' })
export class ShoppingCartService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/shopping-carts');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(shoppingCart: IShoppingCart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(shoppingCart);
    return this.http
      .post<IShoppingCart>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(shoppingCart: IShoppingCart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(shoppingCart);
    return this.http
      .put<IShoppingCart>(`${this.resourceUrl}/${getShoppingCartIdentifier(shoppingCart) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(shoppingCart: IShoppingCart): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(shoppingCart);
    return this.http
      .patch<IShoppingCart>(`${this.resourceUrl}/${getShoppingCartIdentifier(shoppingCart) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IShoppingCart>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IShoppingCart[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addShoppingCartToCollectionIfMissing(
    shoppingCartCollection: IShoppingCart[],
    ...shoppingCartsToCheck: (IShoppingCart | null | undefined)[]
  ): IShoppingCart[] {
    const shoppingCarts: IShoppingCart[] = shoppingCartsToCheck.filter(isPresent);
    if (shoppingCarts.length > 0) {
      const shoppingCartCollectionIdentifiers = shoppingCartCollection.map(
        shoppingCartItem => getShoppingCartIdentifier(shoppingCartItem)!
      );
      const shoppingCartsToAdd = shoppingCarts.filter(shoppingCartItem => {
        const shoppingCartIdentifier = getShoppingCartIdentifier(shoppingCartItem);
        if (shoppingCartIdentifier == null || shoppingCartCollectionIdentifiers.includes(shoppingCartIdentifier)) {
          return false;
        }
        shoppingCartCollectionIdentifiers.push(shoppingCartIdentifier);
        return true;
      });
      return [...shoppingCartsToAdd, ...shoppingCartCollection];
    }
    return shoppingCartCollection;
  }

  protected convertDateFromClient(shoppingCart: IShoppingCart): IShoppingCart {
    return Object.assign({}, shoppingCart, {
      placedDate: shoppingCart.placedDate?.isValid() ? shoppingCart.placedDate.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.placedDate = res.body.placedDate ? dayjs(res.body.placedDate) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((shoppingCart: IShoppingCart) => {
        shoppingCart.placedDate = shoppingCart.placedDate ? dayjs(shoppingCart.placedDate) : undefined;
      });
    }
    return res;
  }
}
