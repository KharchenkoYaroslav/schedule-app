describe('Security & User Management Flow', () => {
  const HEAD_ADMIN_LOGIN = 'Head Admin';
  const HEAD_ADMIN_PASS = 'Zxcvb2468';
  const TIMESTAMP = Date.now();

  const LOG_GROUP_NAME = `LogCheck-${TIMESTAMP}`;

  const USER_1 = {
    login: `User1-${TIMESTAMP}`,
    pass: 'UserPass1',
    newLogin: `User1-New-${TIMESTAMP}`,
    newPass: 'UserPass1-New',
  };

  const USER_2 = {
    login: `User2-${TIMESTAMP}`,
    pass: 'UserPass2',
  };

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.on('window:confirm', () => true);

    // INTERCEPTS

    cy.intercept('POST', '**/auth/login*').as('loginReq');
    cy.intercept('POST', '**/auth/register*').as('registerReq');

    cy.intercept('POST', '**/group*').as('createGroup');
    cy.intercept('DELETE', '**/group/*').as('deleteGroup');
    cy.intercept('GET', '**/group*').as('getGroups');

    cy.intercept('POST', '**/add-allowed-user*').as('addAllowedUser');
    cy.intercept('DELETE', '**/user/*').as('deleteUser');
    cy.intercept('PATCH', '**/change-user-role*').as('changeRole');
    cy.intercept('PATCH', '**/change-login*').as('changeLogin');
    cy.intercept('PATCH', '**/change-password*').as('changePassword');
    cy.intercept('DELETE', '**/delete-account*').as('deleteAccount');
  });

  it('should verify logs, manage users, and update profile credentials', () => {
    // PART 1: LOGS VERIFICATION

    // 1.1 LOGIN AS HEAD ADMIN
    cy.visit('/admin');
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder="Login"]').length > 0) {
        cy.get('input[placeholder="Login"]').type(HEAD_ADMIN_LOGIN);
        cy.get('input[placeholder="Password"]').type(HEAD_ADMIN_PASS);
        cy.get('button').contains('Login').click();
        cy.wait('@loginReq');
      }
    });
    cy.contains('span', 'Супер Адмін', { timeout: 15000 }).should('be.visible');

    // 1.2 CREATE GROUP TO TRIGGER LOG
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.contains('button', 'Додати групу', { timeout: 10000 }).should(
      'not.be.disabled'
    );

    cy.get('input[placeholder="Введіть ім\'я групи"]').clear();
    cy.get('input[placeholder="Введіть ім\'я групи"]').type(LOG_GROUP_NAME);

    cy.get('input[placeholder="Введіть факультет"]').clear();
    cy.get('input[placeholder="Введіть факультет"]').type('Log Fac');

    cy.contains('button', 'Додати групу').click();
    cy.wait('@createGroup');
    cy.contains('Група додана успішно', { timeout: 10000 }).should('exist');

    // 1.3 DELETE GROUP TO TRIGGER LOG
    cy.wait('@getGroups');
    cy.get('select')
      .first()
      .find('option')
      .contains(LOG_GROUP_NAME)
      .should('exist');
    cy.get('select').first().select(LOG_GROUP_NAME);

    cy.contains('button', 'Видалити групу').click();
    cy.wait('@deleteGroup');
    cy.contains('Група видалена успішно', { timeout: 10000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 1.4 CHECK LOGS
    cy.contains('button', 'Логи').click();

    cy.contains('Завантаження логів...', { timeout: 10000 }).should(
      'not.exist'
    );
    cy.contains('h2', 'Журнал дій').should('be.visible');

    // CHECK CREATE LOG
    cy.contains(
      'td',
      new RegExp(`Created group code:.*${LOG_GROUP_NAME}`, 'i')
    ).should('exist');
    // CHECK DELETE LOG
    cy.contains('td', 'Deleted group ID').should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // PART 2: USER MANAGEMENT & REGISTRATION

    // 2.1 ADD 2 ALLOWED USERS (WHITELIST)
    cy.contains('button', 'Акаунти').click();
    cy.contains('Завантаження...', { timeout: 10000 }).should('not.exist');
    cy.contains('h2', 'Адміністрування користувачів').should('be.visible');

    // SCROLL TO "ALLOWED USERS"
    cy.get('div[class*="dot"]').eq(1).click();
    cy.contains('h3', 'Реєстр дозволених').should('be.visible');

    // ADD USER 1
    cy.get('input[placeholder="Логін користувача"]').type(USER_1.login);
    cy.contains('button', 'Додати').click();
    cy.wait('@addAllowedUser');
    cy.contains(`Користувач ${USER_1.login} успішно доданий`, {
      timeout: 10000,
    }).should('exist');

    // ADD USER 2
    cy.get('input[placeholder="Логін користувача"]').clear();
    cy.get('input[placeholder="Логін користувача"]').type(USER_2.login);
    cy.contains('button', 'Додати').click();
    cy.wait('@addAllowedUser');
    cy.contains(`Користувач ${USER_2.login} успішно доданий`, {
      timeout: 10000,
    }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 2.2 LOGOUT
    cy.contains('button', 'Вийти з акаунта').click();
    cy.url().should('include', 'admin/auth');

    // PART 3: USER 1 FLOW

    // 3.1 REGISTER USER 1
    cy.contains('button', 'Switch to Register').click();
    cy.get('input[placeholder="Login"]').type(USER_1.login);
    cy.get('input[placeholder="Password"]').type(USER_1.pass);
    cy.get('button').contains('Register').click();
    cy.wait('@registerReq');
    cy.contains('span', 'Адмін', { timeout: 15000 }).should('be.visible');
    cy.contains('span', 'Супер Адмін').should('not.exist');

    // 3.2 CHANGE LOGIN
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(USER_1.newLogin);
    });
    cy.contains('button', 'Змінити логін').click();
    cy.wait('@changeLogin');
    cy.contains('Логін успішно змінено', { timeout: 10000 }).should('exist');

    // 3.3 CHANGE PASSWORD
    cy.window().then((win) => {
      interface Stubbable {
        restore?: () => void;
      }
      const promptStub = win.prompt as unknown as Stubbable;

      if (promptStub && typeof promptStub.restore === 'function') {
        promptStub.restore();
      }

      const newPromptStub = cy.stub(win, 'prompt');
      newPromptStub.onCall(0).returns(USER_1.pass);
      newPromptStub.onCall(1).returns(USER_1.newPass);
      newPromptStub.onCall(2).returns(USER_1.newPass);
    });
    cy.contains('button', 'Змінити пароль').click();
    cy.wait('@changePassword');
    cy.contains('Пароль успішно змінено', { timeout: 10000 }).should('exist');

    // 3.4 LOGOUT
    cy.contains('button', 'Вийти з акаунта').click();

    // 3.5 LOGIN WITH NEW CREDENTIALS
    cy.get('input[placeholder="Login"]').type(USER_1.newLogin);
    cy.get('input[placeholder="Password"]').type(USER_1.newPass);
    cy.get('button').contains('Login').click();
    cy.wait('@loginReq');
    cy.contains('span', 'Адмін', { timeout: 15000 }).should('be.visible');

    // 3.6 LOGOUT USER 1
    cy.contains('button', 'Вийти з акаунта').click();

    // PART 4: USER 2 FLOW

    // 4.1 REGISTER USER 2
    cy.contains('button', 'Switch to Register').click();
    cy.get('input[placeholder="Login"]').type(USER_2.login);
    cy.get('input[placeholder="Password"]').type(USER_2.pass);
    cy.get('button').contains('Register').click();
    cy.wait('@registerReq');
    cy.contains('span', 'Адмін', { timeout: 15000 }).should('be.visible');

    // 4.2 LOGOUT USER 2
    cy.contains('button', 'Вийти з акаунта').click();

    // PART 5: HEAD ADMIN VERIFICATION & CLEANUP

    // 5.1 LOGIN HEAD ADMIN
    cy.get('input[placeholder="Login"]').type(HEAD_ADMIN_LOGIN);
    cy.get('input[placeholder="Password"]').type(HEAD_ADMIN_PASS);
    cy.get('button').contains('Login').click();
    cy.wait('@loginReq');
    cy.contains('span', 'Супер Адмін', { timeout: 15000 }).should('be.visible');

    // 5.2 CHECK ACCOUNTS
    cy.contains('button', 'Акаунти').click();
    cy.contains('Завантаження...', { timeout: 10000 }).should('not.exist');

    // CHECK REGISTERED
    cy.contains('div[class*="userLogin"]', USER_1.newLogin).should('exist');
    cy.contains('div[class*="userLogin"]', USER_2.login).should('exist');

    // CHECK ALLOWED (EMPTY)
    cy.get('div[class*="dot"]').eq(1).click();
    cy.get('div[class*="allowedUserList"]').should('not.contain', USER_1.login);
    cy.get('div[class*="allowedUserList"]').should('not.contain', USER_2.login);

    cy.get('div[class*="dot"]').eq(0).click();

    // 5.3 DELETE USER 2
    cy.contains('div[class*="userRow"]', USER_2.login)
      .find('svg[class*="deleteIcon"]')
      .click();
    cy.wait('@deleteUser');
    cy.contains(`Користувача ${USER_2.login} успішно видалено`, {
      timeout: 10000,
    }).should('exist');
    cy.contains('div[class*="userRow"]', USER_2.login).should('not.exist');

    // 5.4 CHANGE ROLE OF USER 1 TO SUPER_ADMIN
    cy.contains('div[class*="userRow"]', USER_1.newLogin).within(() => {
      cy.get('select').select('super_admin');
      cy.contains('button', 'Змінити').click();
    });
    cy.wait('@changeRole');
    cy.contains(`успішно змінено на super_admin`, { timeout: 10000 }).should(
      'exist'
    );

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 5.5 LOGOUT HEAD ADMIN
    cy.contains('button', 'Вийти з акаунта').click();

    // PART 6: USER 1 ROLE VERIFICATION & SELF-DELETION

    // 6.1 LOGIN USER 1 (NEW CREDS)
    cy.get('input[placeholder="Login"]').type(USER_1.newLogin);
    cy.get('input[placeholder="Password"]').type(USER_1.newPass);
    cy.get('button').contains('Login').click();
    cy.wait('@loginReq');

    // 6.2 VERIFY ROLE CHANGE
    cy.contains('span', 'Супер Адмін', { timeout: 15000 }).should('be.visible');
    cy.contains('h3', 'Меню контролю').should('be.visible');

    // 6.3 SELF DELETE
    cy.contains('button', 'Видалити акаунт').click();
    cy.wait('@deleteAccount');
    cy.contains('Обліковий запис успішно видалено', { timeout: 10000 }).should(
      'exist'
    );
    cy.url().should('include', 'admin/auth');

    // PART 7: FINAL CHECK

    // 7.1 LOGIN HEAD ADMIN
    cy.get('input[placeholder="Login"]').type(HEAD_ADMIN_LOGIN);
    cy.get('input[placeholder="Password"]').type(HEAD_ADMIN_PASS);
    cy.get('button').contains('Login').click();
    cy.wait('@loginReq');

    // 7.2 VERIFY USER 1 IS GONE
    cy.contains('button', 'Акаунти').click();
    cy.contains('Завантаження...', { timeout: 10000 }).should('not.exist');
    cy.contains('div[class*="userRow"]', USER_1.newLogin).should('not.exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });
  });
});
