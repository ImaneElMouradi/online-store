import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IProductOrder, getProductOrderIdentifier } from '../product-order.model';

export type EntityResponseType = HttpResponse<IProductOrder>;
export type EntityArrayResponseType = HttpResponse<IProductOrder[]>;

@Injectable({ providedIn: 'root' })
export class ProductOrderService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/product-orders');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(productOrder: IProductOrder): Observable<EntityResponseType> {
    return this.http.post<IProductOrder>(this.resourceUrl, productOrder, { observe: 'response' });
  }

  update(productOrder: IProductOrder): Observable<EntityResponseType> {
    return this.http.put<IProductOrder>(`${this.resourceUrl}/${getProductOrderIdentifier(productOrder) as number}`, productOrder, {
      observe: 'response',
    });
  }

  partialUpdate(productOrder: IProductOrder): Observable<EntityResponseType> {
    return this.http.patch<IProductOrder>(`${this.resourceUrl}/${getProductOrderIdentifier(productOrder) as number}`, productOrder, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IProductOrder>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProductOrder[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addProductOrderToCollectionIfMissing(
    productOrderCollection: IProductOrder[],
    ...productOrdersToCheck: (IProductOrder | null | undefined)[]
  ): IProductOrder[] {
    const productOrders: IProductOrder[] = productOrdersToCheck.filter(isPresent);
    if (productOrders.length > 0) {
      const productOrderCollectionIdentifiers = productOrderCollection.map(
        productOrderItem => getProductOrderIdentifier(productOrderItem)!
      );
      const productOrdersToAdd = productOrders.filter(productOrderItem => {
        const productOrderIdentifier = getProductOrderIdentifier(productOrderItem);
        if (productOrderIdentifier == null || productOrderCollectionIdentifiers.includes(productOrderIdentifier)) {
          return false;
        }
        productOrderCollectionIdentifiers.push(productOrderIdentifier);
        return true;
      });
      return [...productOrdersToAdd, ...productOrderCollection];
    }
    return productOrderCollection;
  }
}
