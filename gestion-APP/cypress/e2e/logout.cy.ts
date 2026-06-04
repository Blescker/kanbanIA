describe('🧪 Prueba de Logout', () => {
  it('Cierra sesión correctamente y redirige a login', () => {
    const correo = 'blesscker@demo.com'; // ← usuario ya registrado
    const password = '1234567';

    // Login
    cy.visit('/login');
    cy.get('input[name="correo"]').type(correo);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Logout (ajusta el selector según tu botón o ícono real)
    cy.contains('Cerrar sesión').click(); // o cy.get('#logout'), etc.

    // Verifica que se limpió sesión y se redirige
    cy.url().should('include', '/login');

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token'); // ajusta el nombre si es diferente
      expect(token).to.be.null;
    });
  });
});
