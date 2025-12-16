describe('Additional Year Manipulation Test', () => {
  const ADMIN_LOGIN = 'Head Admin';
  const ADMIN_PASS = 'Zxcvb2468';

  const GROUP_1_START = 'ТВ-22';
  const GROUP_2_START = 'ТВ-42';

  const GROUP_1_NEXT_1 = 'ТВ-32';
  const GROUP_2_NEXT_1 = 'ТВ-52';

  const GROUP_1_NEXT_2 = 'ТВ-42';

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.on('window:confirm', () => true);

    // INTERCEPTS
    cy.intercept('POST', '**/auth/login*').as('loginReq');
    cy.intercept('GET', '**/group*').as('getGroups');
    cy.intercept('POST', '**/group*').as('createGroup');
    cy.intercept('DELETE', '**/group*/*').as('deleteGroup');

    cy.intercept('POST', '**/update-groups*').as('updateGroupsAction');
  });

  it('should handle year transition logic correctly', () => {
    // 1. LOGIN
    cy.login(ADMIN_LOGIN, ADMIN_PASS);

    cy.visit('/admin');
    cy.contains('span', 'Супер Адмін', { timeout: 15000 }).should('be.visible');

    // 2. CLEANUP & SETUP GROUPS
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.contains('h2', 'Групи').should('be.visible');

    const deleteGroupIfExists = (name: string) => {
      cy.get('body').then(($body) => {
        if ($body.find(`select option:contains("${name}")`).length > 0) {
           cy.log(`Deleting existing group: ${name}`);
           cy.get('select').first().select(name);
           cy.contains('button', 'Видалити групу', { timeout: 10000 }).should('not.be.disabled');
           cy.contains('button', 'Видалити групу').click();
           cy.wait('@deleteGroup');
           cy.wait('@getGroups');
        }
      });
    };

    deleteGroupIfExists(GROUP_1_START);
    deleteGroupIfExists(GROUP_2_START);
    deleteGroupIfExists(GROUP_1_NEXT_1);
    deleteGroupIfExists(GROUP_2_NEXT_1);
    deleteGroupIfExists(GROUP_1_NEXT_2);

    cy.contains('button', 'Додати групу', { timeout: 10000 }).should('not.be.disabled');

    cy.get('input[placeholder="Введіть ім\'я групи"]').should('not.be.disabled');
    cy.get('input[placeholder="Введіть ім\'я групи"]').clear();
    cy.get('input[placeholder="Введіть ім\'я групи"]').type(GROUP_1_START);

    cy.get('input[placeholder="Введіть факультет"]').should('not.be.disabled');
    cy.get('input[placeholder="Введіть факультет"]').clear();
    cy.get('input[placeholder="Введіть факультет"]').type('Test Fac');

    cy.contains('button', 'Додати групу').click();
    cy.wait('@createGroup');
    cy.contains('Група додана успішно', { timeout: 10000 }).should('exist');

    cy.contains('button', 'Додати групу', { timeout: 10000 }).should('not.be.disabled');

    cy.get('input[placeholder="Введіть ім\'я групи"]').should('not.be.disabled');
    cy.get('input[placeholder="Введіть ім\'я групи"]').clear();
    cy.get('input[placeholder="Введіть ім\'я групи"]').type(GROUP_2_START);

    cy.get('input[placeholder="Введіть факультет"]').should('not.be.disabled');
    cy.get('input[placeholder="Введіть факультет"]').clear();
    cy.get('input[placeholder="Введіть факультет"]').type('Test Fac');

    cy.contains('button', 'Додати групу').click();
    cy.wait('@createGroup');
    cy.contains('Група додана успішно', { timeout: 10000 }).should('exist');

    cy.get('select').first().should('contain', GROUP_1_START);
    cy.get('select').first().should('contain', GROUP_2_START);

    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 3. MOVE YEAR FORWARD (+1)
    cy.contains('button', 'Додатково').click();
    cy.contains('h2', 'Додатково').should('be.visible');

    cy.contains('button', 'Перенести розклад на наступний рік').click();
    cy.wait('@updateGroupsAction').its('response.statusCode').should('eq', 201);
    cy.contains('Операцію виконано успішно', { timeout: 15000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    cy.get('select').first().should('not.contain', GROUP_1_START);
    cy.get('select').first().should('not.contain', GROUP_2_START);
    cy.get('select').first().should('contain', GROUP_1_NEXT_1);
    cy.get('select').first().should('contain', GROUP_2_NEXT_1);

    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 4. MOVE YEAR FORWARD (+1 AGAIN)
    cy.contains('button', 'Додатково').click();
    cy.contains('button', 'Перенести розклад на наступний рік').click();

    cy.wait('@updateGroupsAction').its('response.statusCode').should('eq', 201);
    cy.contains('Операцію виконано успішно', { timeout: 15000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    cy.get('select').first().should('not.contain', GROUP_1_NEXT_1); // ТВ-32 deleted
    cy.get('select').first().should('not.contain', GROUP_2_NEXT_1); // ТВ-52 deleted

    cy.get('select').first().should('contain', GROUP_1_NEXT_2); // ТВ-42

    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 5. MOVE YEAR BACKWARD (-1)
    cy.contains('button', 'Додатково').click();
    cy.contains('button', 'Скинути групи').click();

    cy.wait('@updateGroupsAction').its('response.statusCode').should('eq', 201);
    cy.contains('Операцію виконано успішно', { timeout: 15000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    cy.get('select').first().should('not.contain', GROUP_1_NEXT_2);
    cy.get('select').first().should('contain', GROUP_1_NEXT_1); // ТВ-32 back

    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 6. MOVE YEAR BACKWARD (-1 AGAIN)
    cy.contains('button', 'Додатково').click();
    cy.contains('button', 'Скинути групи').click();

    cy.wait('@updateGroupsAction').its('response.statusCode').should('eq', 201);
    cy.contains('Операцію виконано успішно', { timeout: 15000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    cy.get('select').first().should('not.contain', GROUP_1_NEXT_1);
    cy.get('select').first().should('contain', GROUP_1_START); // ТВ-22 back

    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 7. MOVE YEAR BACKWARD (-1 AGAIN)
    cy.contains('button', 'Додатково').click();
    cy.contains('button', 'Скинути групи').click();

    cy.wait('@updateGroupsAction').its('response.statusCode').should('eq', 201);
    cy.contains('Операцію виконано успішно', { timeout: 15000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    cy.get('select').first().should('not.contain', GROUP_1_START); // ТВ-22 deleted
    cy.get('div[class*="headerActions"] svg').click({ force: true });
  });
});
