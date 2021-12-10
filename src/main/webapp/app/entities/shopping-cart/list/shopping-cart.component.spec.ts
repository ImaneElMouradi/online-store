import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ShoppingCartService } from '../service/shopping-cart.service';

import { ShoppingCartComponent } from './shopping-cart.component';

describe('ShoppingCart Management Component', () => {
  let comp: ShoppingCartComponent;
  let fixture: ComponentFixture<ShoppingCartComponent>;
  let service: ShoppingCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ShoppingCartComponent],
    })
      .overrideTemplate(ShoppingCartComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ShoppingCartComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ShoppingCartService);

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
    expect(comp.shoppingCarts?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});
