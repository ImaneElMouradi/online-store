import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ICustomerDetails, getCustomerDetailsIdentifier } from '../customer-details.model';

export type EntityResponseType = HttpResponse<ICustomerDetails>;
export type EntityArrayResponseType = HttpResponse<ICustomerDetails[]>;

@Injectable({ providedIn: 'root' })
export class CustomerDetailsService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/customer-details');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(customerDetails: ICustomerDetails): Observable<EntityResponseType> {
    return this.http.post<ICustomerDetails>(this.resourceUrl, customerDetails, { observe: 'response' });
  }

  update(customerDetails: ICustomerDetails): Observable<EntityResponseType> {
    return this.http.put<ICustomerDetails>(
      `${this.resourceUrl}/${getCustomerDetailsIdentifier(customerDetails) as number}`,
      customerDetails,
      { observe: 'response' }
    );
  }

  partialUpdate(customerDetails: ICustomerDetails): Observable<EntityResponseType> {
    return this.http.patch<ICustomerDetails>(
      `${this.resourceUrl}/${getCustomerDetailsIdentifier(customerDetails) as number}`,
      customerDetails,
      { observe: 'response' }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ICustomerDetails>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ICustomerDetails[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addCustomerDetailsToCollectionIfMissing(
    customerDetailsCollection: ICustomerDetails[],
    ...customerDetailsToCheck: (ICustomerDetails | null | undefined)[]
  ): ICustomerDetails[] {
    const customerDetails: ICustomerDetails[] = customerDetailsToCheck.filter(isPresent);
    if (customerDetails.length > 0) {
      const customerDetailsCollectionIdentifiers = customerDetailsCollection.map(
        customerDetailsItem => getCustomerDetailsIdentifier(customerDetailsItem)!
      );
      const customerDetailsToAdd = customerDetails.filter(customerDetailsItem => {
        const customerDetailsIdentifier = getCustomerDetailsIdentifier(customerDetailsItem);
        if (customerDetailsIdentifier == null || customerDetailsCollectionIdentifiers.includes(customerDetailsIdentifier)) {
          return false;
        }
        customerDetailsCollectionIdentifiers.push(customerDetailsIdentifier);
        return true;
      });
      return [...customerDetailsToAdd, ...customerDetailsCollection];
    }
    return customerDetailsCollection;
  }
}
