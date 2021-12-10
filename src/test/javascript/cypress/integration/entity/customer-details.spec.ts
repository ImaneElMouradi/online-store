import { entityItemSelector } from '../../support/commands';
import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('CustomerDetails e2e test', () => {
  const customerDetailsPageUrl = '/customer-details';
  const customerDetailsPageUrlPattern = new RegExp('/customer-details(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'admin';
  const password = Cypress.env('E2E_PASSWORD') ?? 'admin';
  const customerDetailsSample = {
    gender: 'FEMALE',
    phone: '308-545-9891',
    addressLine1: 'Assurance Account methodologies',
    city: 'Port Joesph',
    country: 'Uruguay',
  };

  let customerDetails: any;
  //let user: any;

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });
    cy.visit('');
    cy.login(username, password);
    cy.get(entityItemSelector).should('exist');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/users',
      body: {"login":"gold","firstName":"Wilton","lastName":"Buckridge"},
    }).then(({ body }) => {
      user = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/customer-details+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/customer-details').as('postEntityRequest');
    cy.intercept('DELETE', '/api/customer-details/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [user],
    });

    cy.intercept('GET', '/api/shopping-carts', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (customerDetails) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/customer-details/${customerDetails.id}`,
      }).then(() => {
        customerDetails = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (user) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/users/${user.id}`,
      }).then(() => {
        user = undefined;
      });
    }
  });
   */

  it('CustomerDetails menu should load CustomerDetails page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('customer-details');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response!.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('CustomerDetails').should('exist');
    cy.url().should('match', customerDetailsPageUrlPattern);
  });

  describe('CustomerDetails page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(customerDetailsPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create CustomerDetails page', () => {
        cy.get(entityCreateButtonSelector).click({ force: true });
        cy.url().should('match', new RegExp('/customer-details/new$'));
        cy.getEntityCreateUpdateHeading('CustomerDetails');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click({ force: true });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', customerDetailsPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/customer-details',
  
          body: {
            ...customerDetailsSample,
            user: user,
          },
        }).then(({ body }) => {
          customerDetails = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/customer-details+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [customerDetails],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(customerDetailsPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(customerDetailsPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response!.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details CustomerDetails page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('customerDetails');
        cy.get(entityDetailsBackButtonSelector).click({ force: true });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', customerDetailsPageUrlPattern);
      });

      it('edit button click should load edit CustomerDetails page', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('CustomerDetails');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click({ force: true });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', customerDetailsPageUrlPattern);
      });

      it.skip('last delete button click should delete instance of CustomerDetails', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('customerDetails').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', customerDetailsPageUrlPattern);

        customerDetails = undefined;
      });
    });
  });

  describe('new CustomerDetails page', () => {
    beforeEach(() => {
      cy.visit(`${customerDetailsPageUrl}`);
      cy.get(entityCreateButtonSelector).click({ force: true });
      cy.getEntityCreateUpdateHeading('CustomerDetails');
    });

    it.skip('should create an instance of CustomerDetails', () => {
      cy.get(`[data-cy="gender"]`).select('FEMALE');

      cy.get(`[data-cy="phone"]`).type('(898) 546-5581').should('have.value', '(898) 546-5581');

      cy.get(`[data-cy="addressLine1"]`).type('Rubber override').should('have.value', 'Rubber override');

      cy.get(`[data-cy="addressLine2"]`).type('Supervisor primary Metal').should('have.value', 'Supervisor primary Metal');

      cy.get(`[data-cy="city"]`).type('Ettiefurt').should('have.value', 'Ettiefurt');

      cy.get(`[data-cy="country"]`).type('Sierra Leone').should('have.value', 'Sierra Leone');

      cy.get(`[data-cy="user"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response!.statusCode).to.equal(201);
        customerDetails = response!.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response!.statusCode).to.equal(200);
      });
      cy.url().should('match', customerDetailsPageUrlPattern);
    });
  });
});
