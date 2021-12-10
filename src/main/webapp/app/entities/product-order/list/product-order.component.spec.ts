import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ProductOrderService } from '../service/product-order.service';

import { ProductOrderComponent } from './product-order.component';

describe('ProductOrder Management Component', () => {
  let comp: ProductOrderComponent;
  let fixture: ComponentFixture<ProductOrderComponent>;
  let service: ProductOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ProductOrderComponent],
    })
      .overrideTemplate(ProductOrderComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ProductOrderComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ProductOrderService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.productOrders?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});
