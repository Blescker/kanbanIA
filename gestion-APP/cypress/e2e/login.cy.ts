describe('🧪 Pruebas del Login con backend real', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Muestra errores si los campos están vacíos', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="correo"]:invalid').should('exist');
    cy.get('input[name="password"]:invalid').should('exist')
  });

  it('Rechaza credenciales inválidas', () => {
    cy.get('input[name="correo"]').type('usuario@invalido.com');
    cy.get('input[name="password"]').type('claveIncorrecta');
    cy.get('button[type="submit"]').click();
    cy.contains('Usuario no encontrado').should('exist');
  });

  it('Permite ingresar con credenciales válidas', () => {
    cy.get('input[name="correo"]').type('blesscker@demo.com');
    cy.get('input[name="password"]').type('1234567');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido').should('exist');
  });

  it('Guarda el token en localStorage', () => {
    cy.get('input[name="correo"]').type('blesscker@demo.com');
    cy.get('input[name="password"]').type('1234567');
    cy.get('button[type="submit"]').click();

    cy.window().then((win) => {
        cy.wrap(null).should(() => {
            const token = win.localStorage.getItem('token'); // ← ajusta si usas otro nombre
            expect(token).to.exist;
        });
        });
  });
});
