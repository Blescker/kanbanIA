describe('🧪 Pruebas del Registro', () => {
  it('Registra un nuevo usuario correctamente', () => {
    const timestamp = Date.now();
    const correo = `test+${timestamp}@demo.com`;

    cy.visit('/register');

    cy.get('input[name="nombre"]').type('Test Usuario');
    cy.get('input[name="correo"]').type(correo);
    cy.get('input[name="password"]').type('123456');
    cy.get('input[name="confirmPassword"]').type('123456');
    cy.get('input[name="captcha"]').check();
    // si tienes un captcha, simúlalo o desactívalo temporalmente para test

    cy.get('button[type="submit"]').click();

    // Verifica que redirige o muestre éxito
    cy.url().should('include', '/login'); // o /dashboard, depende de tu app
    cy.on('window:alert', (text) => {
        expect(text).to.include('Usuario registrado correctamente');
        });
  });

  it('Muestra errores de validación nativa si se deja todo en blanco', () => {
    cy.visit('/register');

    cy.get('button[type="submit"]').click();

    // Validaciones nativas del navegador
    cy.get('input[name="nombre"]:invalid').should('exist');
    cy.get('input[name="correo"]:invalid').should('exist');
    cy.get('input[name="password"]:invalid').should('exist');
    cy.get('input[name="confirmPassword"]:invalid').should('exist');
    });

  it('Muestra error si la contraseña es menor a 6 caracteres', () => {
    const timestamp = Date.now();
    cy.visit('/register');
    cy.get('input[name="nombre"]').type('Test Corto');
    cy.get('input[name="correo"]').type(`test+${timestamp}@demo.com`);
    cy.get('input[name="password"]').type('123');
    cy.get('input[name="confirmPassword"]').type('123');
    cy.get('input[name="captcha"]').check();

    cy.get('button[type="submit"]').click();
    cy.contains('La contraseña debe tener al menos 6 caracteres').should('exist');
    });
it('Muestra error si no se marca el captcha', () => {
  const timestamp = Date.now();
  const correo = `nocaptcha+${timestamp}@demo.com`;

  cy.visit('/register');

  cy.get('input[name="nombre"]').type('Usuario Sin Captcha');
  cy.get('input[name="correo"]').type(correo);
  cy.get('input[name="password"]').type('123456');
  cy.get('input[name="confirmPassword"]').type('123456');

  // No marcar el checkbox a propósito
  cy.get('button[type="submit"]').click();

  cy.contains('Debes marcar el captcha').should('exist');
});

it('Muestra error si las contraseñas no coinciden', () => {
  const timestamp = Date.now();
  const correo = `mismatch+${timestamp}@demo.com`;

  cy.visit('/register');

  cy.get('input[name="nombre"]').type('Usuario Mismatch');
  cy.get('input[name="correo"]').type(correo);
  cy.get('input[name="password"]').type('123456');
  cy.get('input[name="confirmPassword"]').type('654321'); // Diferente
  cy.get('input[name="captcha"]').check(); // Marcamos el captcha

  cy.get('button[type="submit"]').click();

  cy.contains('Las contraseñas no coinciden').should('exist');
});

it('Muestra error si el correo ya fue registrado', () => {
  cy.visit('/register');

  cy.get('input[name="nombre"]').type('Usuario Existente');
  cy.get('input[name="correo"]').type('blesscker@demo.com'); // Correo ya registrado
  cy.get('input[name="password"]').type('123456');
  cy.get('input[name="confirmPassword"]').type('123456');
  cy.get('input[name="captcha"]').check();

  cy.get('button[type="submit"]').click();

  cy.contains('El correo ya está registrado').should('exist'); // Ajusta el mensaje según tu backend
});

it('Valida formato de correo inválido (HTML5)', () => {
  cy.visit('/register');
  cy.get('input[name="correo"]').type('noesuncorreo');
  cy.get('input[name="correo"]:invalid').should('exist');
});


});
