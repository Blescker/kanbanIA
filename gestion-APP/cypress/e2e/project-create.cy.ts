describe('📁 Creación de proyecto', () => {
  const timestamp = Date.now();
  const nombre = `Proyecto Cypress ${timestamp}`;

  beforeEach(() => {
    // Guardar sesión para evitar relogin constante
    cy.session('usuario-logueado', () => {
      cy.visit('/login');
      cy.get('input[name="correo"]').type('blesscker@demo.com');
      cy.get('input[name="password"]').type('1234567');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.contains('Nuevo proyecto', { timeout: 10000 }).should('exist');
    });

    // Ir al formulario desde el dashboard
    cy.visit('/dashboard');
    cy.contains('Nuevo proyecto').click();
    cy.url().should('include', '/projects/new');
  });

  it('✅ Crea un proyecto exitosamente con todos los campos', () => {
    cy.get('input[name="nombre"]').type(nombre);
    cy.get('input[name="descripcion"]').type('Este proyecto fue creado por Cypress');
    cy.get('select[name="estado"]').select('Planeado');
    cy.get('input[name="fecha"]').type('2025-12-25');

    cy.get('button[type="submit"]').click();

    // Verificar redirección y contenido
    cy.url().should('match', /\/projects\/[a-zA-Z0-9]+/);
    cy.contains(nombre).should('exist');
  });

  it('🚫 Muestra error si se dejan campos vacíos', () => {
    // Sin llenar nada, solo enviar
    cy.get('button[type="submit"]').click();

    // Los campos deben estar en estado inválido por HTML
    cy.get('input[name="nombre"]:invalid').should('exist');
    cy.get('input[name="descripcion"]:invalid').should('exist');
    cy.get('select[name="estado"]:invalid').should('exist');
    cy.get('input[name="fecha"]:invalid').should('exist');
  });
  it('✅ Crea, edita y elimina un proyecto con datos distintos', () => {
  const nombreInicial = `Proyecto Cypress ${Date.now()}`;
  const nombreEditado = `Proyecto Cypress Editado ${Date.now()}`;
  const descripcionEditada = 'Descripción editada desde Cypress';

  // Crear el proyecto
  cy.get('input[name="nombre"]').type(nombreInicial);
  cy.get('input[name="descripcion"]').type('Proyecto de prueba Cypress');
  cy.get('select[name="estado"]').select('Planeado');
  cy.get('input[name="fecha"]').type('2025-12-31');
  cy.get('button[type="submit"]').click();

  // Verifica redirección y contenido
  cy.url().should('include', '/projects/');
  cy.contains(nombreInicial).should('exist');

  // Editar el proyecto (debes ajustar si tienes un botón "✏️ Editar")
  cy.contains('✏️ Editar').click();

  // Cambiar nombre y descripción
  cy.get('input[name="nombre"]').clear().type(nombreEditado);
  cy.get('input[name="descripcion"]').clear().type(descripcionEditada);

  // Guardar cambios
  cy.contains('Guardar cambios').click();

  // Verificar cambios reflejados
  cy.contains(nombreEditado).should('exist');
  cy.contains(descripcionEditada).should('exist');

  // Eliminar el proyecto (ajusta el selector según tu botón real)
  cy.contains('🗑️ Eliminar').click();

  // Confirmar eliminación si usas confirm()
  cy.on('window:confirm', () => true);

  // Asegura que redirige al dashboard o lista
  cy.url().should('include', '/dashboard');

  // Verifica que el nombre ya no esté visible
  cy.contains(nombreEditado).should('not.exist');
});
it('📌 Crea una lista en el tablero Kanban de un proyecto existente', () => {
  const nombreLista = `Lista Cypress ${Date.now()}`;

  // Suponiendo que ya estás logueado desde un beforeEach
  cy.visit('/dashboard');
  cy.contains('Proyecto de prueba').click();

  cy.contains('Kanban').click();
  cy.url().should('include', '/kanban');

  cy.get('input[placeholder="Nombre de la lista"]').type(nombreLista);
  cy.contains('Crear').click();

  cy.contains(nombreLista).should('exist');
});

it('📌 Añade una tarea y configura etiqueta, checklist y fechas', () => {
  // Ir al proyecto y al kanban
  cy.visit('/dashboard');
  cy.contains('Proyecto de prueba').click();
  cy.contains('Kanban').click();

  // Añadir tarea en la primera lista
  cy.get('[data-testid="lista-kanban"]').first().within(() => {
    cy.contains('Añadir tarea').click();
    cy.get('input[name="tarea"]').type('Tarea avanzada Cypress');
    cy.get('input[name="descripcion"]').type('Incluye etiquetas, checklist y fechas');
    cy.contains('Guardar').click();
  });

  // Abrir la tarjeta haciendo clic en su título
  cy.contains('Tarea avanzada Cypress').click();

  // Esperar que se abra el modal
  cy.get('[data-testid="modal-tarea"]').should('exist');

  // 👉 1. Añadir etiqueta
  cy.get('[data-testid="input-etiqueta"]').type('Urgente');
  cy.get('[data-testid="color-etiqueta"]').invoke('val', '#ff0000').trigger('change'); // Color rojo
  cy.get('[data-testid="btn-agregar-etiqueta"]').click();
  cy.get('[data-testid="etiqueta-creada"]').should('contain', 'Urgente');

  // 👉 2. Añadir ítems al checklist
  cy.get('[data-testid="input-checklist"]').type('Revisar código');
  cy.get('[data-testid="btn-agregar-checklist"]').click();
  cy.wait(200);
  cy.get('[data-testid="input-checklist"]').type('Escribir pruebas');
  cy.get('[data-testid="btn-agregar-checklist"]').click();

  cy.contains('Revisar código').should('exist');
  cy.contains('Escribir pruebas').should('exist');

  // 👉 3. Establecer fechas
  cy.get('input[name="fechaInicio"]').clear().type('2025-06-10');
  cy.get('input[name="fechaFin"]').clear().type('2025-06-20');

  // Verifica que se hayan guardado las fechas
  cy.get('input[name="fechaInicio"]').should('have.value', '2025-06-10');
  cy.get('input[name="fechaFin"]').should('have.value', '2025-06-20');
});


});
