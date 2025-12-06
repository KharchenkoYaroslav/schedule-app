/* eslint-disable cypress/no-unnecessary-waiting */
describe('Schedule App Full Cycle Test', () => {
  const TIMESTAMP = Date.now();
  const ADMIN_LOGIN = 'Head Admin';
  const ADMIN_PASS = 'Zxcvb2468';

  const TEST_TEACHER = {
    name: `E2E Teacher ${TIMESTAMP}`,
    dept: 'E2E Dept',
    post: 'Викладач',
  };

  const TEST_TEACHER_2 = {
    name: `E2E Teacher 2 ${TIMESTAMP}`,
    dept: 'E2E Dept',
    post: 'Доцент',
  };

  const TEST_GROUP = {
    code: `E2E-${TIMESTAMP}`,
    faculty: 'E2E Fac',
  };

  const TEST_SUBJECT = `E2E Subject ${TIMESTAMP}`;
  const TEST_SUBJECT_2 = `E2E Subject 2 ${TIMESTAMP}`;

  const TEST_PAIR = {
    audience: `101-${TIMESTAMP}`,
    type: 'Лекція',
  };

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.on('window:confirm', () => true);

    // INTERCEPTS

    cy.intercept('POST', '**/auth/login*').as('loginReq');

    cy.intercept('GET', '**/teacher*').as('getTeachers');
    cy.intercept('POST', '**/teacher*').as('createTeacher');
    cy.intercept('DELETE', '**/teacher/*').as('deleteTeacher');

    cy.intercept('GET', '**/group*').as('getGroups');
    cy.intercept('POST', '**/group*').as('createGroup');
    cy.intercept('DELETE', '**/group/*').as('deleteGroup');

    cy.intercept('GET', '**/curriculum*').as('getCurriculums');
    cy.intercept('POST', '**/curriculum*').as('createCurriculum');
    cy.intercept('PATCH', '**/curriculum/*').as('updateCurriculum');
    cy.intercept('DELETE', '**/curriculum/*').as('deleteCurriculum');

    cy.intercept('POST', '**/pair*').as('createPair');
    cy.intercept('DELETE', '**/pair/*').as('deletePair');

    cy.intercept('POST', '**/*swap*').as('swapPairs');
  });

  it('should pass the full CRUD flow and return to initial state', () => {
    // 1. LOGIN
    cy.visit('/admin');

    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder="Login"]').length > 0) {
        cy.get('input[placeholder="Login"]').type(ADMIN_LOGIN);
        cy.get('input[placeholder="Password"]').type(ADMIN_PASS);
        cy.get('button').contains('Login').click();

        cy.wait('@loginReq').its('response.statusCode').should('eq', 201);
        cy.get('input[placeholder="Login"]', { timeout: 10000 }).should('not.exist');
      }
    });

    cy.url().should('include', '/admin');
    cy.contains('span', 'Супер Адмін', { timeout: 15000 }).should('be.visible');

    // 2. CREATE TEACHER 1
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.wait(500);
    cy.contains('h2', 'Вчителі').should('be.visible');

    cy.contains('button', 'Додати вчителя', { timeout: 10000 }).should('not.be.disabled');

    cy.get('input[placeholder="Введіть ПІБ"]').type(TEST_TEACHER.name);
    cy.get('input[placeholder="Введіть ПІБ"]').should('have.value', TEST_TEACHER.name);

    cy.get('input[placeholder="Введіть кафедру"]').type(TEST_TEACHER.dept);
    cy.get('input[placeholder="Введіть кафедру"]').should('have.value', TEST_TEACHER.dept);

    cy.contains('label', 'Посада:').next('select').select(TEST_TEACHER.post);

    cy.contains('button', 'Додати вчителя').click({ force: true });
    cy.wait('@createTeacher').its('response.statusCode').should('eq', 201);
    cy.contains('Вчителя додано успішно', { timeout: 10000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });
    cy.contains('h2', 'Вчителі').should('not.exist');


    // 3. CREATE GROUP
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.wait(500);

    cy.contains('button', 'Додати групу', { timeout: 10000 }).should('not.be.disabled');
    cy.get('input[placeholder="Введіть ім\'я групи"]').type(TEST_GROUP.code);
    cy.get('input[placeholder="Введіть ім\'я групи"]').should('have.value', TEST_GROUP.code);

    cy.get('input[placeholder="Введіть факультет"]').type(TEST_GROUP.faculty);
    cy.get('input[placeholder="Введіть факультет"]').should('have.value', TEST_GROUP.faculty);

    cy.contains('button', 'Додати групу').click({ force: true });

    cy.wait('@createGroup').its('response.statusCode').should('eq', 201);
    cy.contains('Група додана успішно', { timeout: 10000 }).should('exist');

    cy.contains('h2', 'Групи').parent().next().find('select').first().find('option').contains(TEST_GROUP.code).then($option => {
        cy.contains('h2', 'Групи').parent().next().find('select').first().select($option.val() as string);
    });
    cy.contains('button', 'Вибрати цю групу').click();


    // 4. CREATE PLAN (Subject 1)
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.wait(500);

    cy.get('input[placeholder="Введіть назву"]').type(TEST_SUBJECT);
    cy.get('input[placeholder="Введіть назву"]').should('have.value', TEST_SUBJECT);

    cy.contains('label', "Пов'язані вчителі").parent().within(() => {
        cy.get('select').find('option').contains(TEST_TEACHER.name).then($option => {
             cy.get('select').select($option.val() as string);
        });
        cy.get('button[title="Додати вчителя"]').click();
        cy.contains(TEST_TEACHER.name).should('be.visible');
    });

    cy.contains('label', "Пов'язані групи").parent().within(() => {
        cy.get('select').find('option').contains(TEST_GROUP.code).then($option => {
            cy.get('select').select($option.val() as string);
       });
       cy.get('button[title="Додати групу"]').click();
       cy.contains(TEST_GROUP.code).should('be.visible');
    });

    cy.contains('div[class*="relatedItemRow"]', TEST_TEACHER.name)
      .find('input[placeholder="Лек"]').type('{selectall}1');
    cy.contains('div[class*="relatedItemRow"]', TEST_GROUP.code)
      .find('input[placeholder="Лек"]').type('{selectall}1');

    cy.contains('button', 'Створити предмет').click({ force: true });
    cy.wait('@createCurriculum').its('response.statusCode').should('eq', 201);
    cy.contains('Предмет створено', { timeout: 10000 }).should('exist');
    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 5. CREATE SCHEDULE PAIR 1 (Mon, 1st)
    cy.get('table', { timeout: 10000 }).should('exist');
    cy.get('tbody tr').eq(0).find('td').eq(1).find('div').contains('+').click({ force: true });

    cy.contains('h2', 'Створити пару').should('be.visible');
    cy.wait(500);

    cy.contains('label', 'Предмет:').next('select').select(TEST_SUBJECT);
    cy.contains('label', 'Тип:').next('select').select(TEST_PAIR.type);

    cy.get('body').then(($body) => {
       if ($body.find(`span[class*="itemName"]:contains("${TEST_TEACHER.name}")`).length === 0) {
          cy.contains('label', 'Вчителі:').parent().find('select').first().select(TEST_TEACHER.name);
          cy.get('div[class*="addRelationRow"] button').first().click();
       }
    });

    cy.contains('button', 'Створити пару').click({ force: true });
    cy.wait('@createPair').its('response.statusCode').should('eq', 201);
    cy.contains('Пару створено успішно', { timeout: 10000 }).should('exist');
    cy.contains(TEST_SUBJECT).should('be.visible');


    // 6. PUBLIC ACCESS CHECK
    cy.contains('button', 'Вийти з акаунта').click();
    cy.url().should('include', 'admin/auth');

    cy.visit('/');
    cy.contains('button', 'Я студент').click();
    cy.get('input[type="text"]').type(TEST_GROUP.code);
    cy.contains('div', TEST_GROUP.code, { timeout: 5000 }).click();

    cy.contains('h2', TEST_GROUP.code).should('be.visible');
    cy.contains(TEST_SUBJECT).should('be.visible');

    cy.contains(TEST_SUBJECT).closest('td').find('a[href*="/schedule/teacher/"]').click();
    cy.url().should('include', '/schedule/teacher/');
    cy.contains(TEST_SUBJECT).should('be.visible');


    // 7. RE-LOGIN ADMIN FOR COMPLEX TESTS
    cy.visit('/admin');
    cy.get('input[placeholder="Login"]').type(ADMIN_LOGIN);
    cy.get('input[placeholder="Password"]').type(ADMIN_PASS);
    cy.get('button').contains('Login').click();
    cy.wait('@loginReq');



    // COMPLEX SCENARIOS: CONFLICTS & DND

    // 7.1. CREATE TEACHER 2
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.wait(500);
    cy.contains('button', 'Додати вчителя').should('not.be.disabled');

    cy.get('input[placeholder="Введіть ПІБ"]').type(TEST_TEACHER_2.name);
    cy.get('input[placeholder="Введіть кафедру"]').type(TEST_TEACHER_2.dept);
    cy.contains('label', 'Посада:').next('select').select(TEST_TEACHER_2.post);

    cy.contains('button', 'Додати вчителя').click({ force: true });
    cy.wait('@createTeacher').its('response.statusCode').should('eq', 201);
    cy.contains('Вчителя додано успішно', { timeout: 10000 }).should('exist');
    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 7.2 UPDATE SUBJECT 1 -> Add Teacher 2
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.wait(500);

    cy.contains('h2', 'Навчальний план').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою"]').type(TEST_SUBJECT);
        cy.get('select').first().find('option').contains(TEST_SUBJECT).should('exist');
        cy.get('select').first().select(TEST_SUBJECT);
    });

    cy.contains('label', "Пов'язані вчителі").parent().within(() => {
        cy.get('select').select(TEST_TEACHER_2.name);
        cy.get('button[title="Додати вчителя"]').click();
    });
    cy.contains('div[class*="relatedItemRow"]', TEST_TEACHER_2.name)
        .find('input[placeholder="Лек"]').type('{selectall}1');

    cy.contains('button', 'Оновити предмет').click();
    cy.wait('@updateCurriculum');
    cy.contains('Предмет оновлено', { timeout: 10000 }).should('exist');
    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 7.3. CREATE SUBJECT 2 -> Link BOTH Teachers
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.wait(500);

    cy.get('input[placeholder="Введіть назву"]').type(TEST_SUBJECT_2);

    cy.contains('label', "Пов'язані групи").parent().within(() => {
        cy.get('select').select(TEST_GROUP.code);
        cy.get('button[title="Додати групу"]').click();
    });
    cy.contains('div[class*="relatedItemRow"]', TEST_GROUP.code)
        .find('input[placeholder="Лек"]').type('{selectall}1');

    cy.contains('label', "Пов'язані вчителі").parent().within(() => {
        cy.get('select').select(TEST_TEACHER.name);
        cy.get('button[title="Додати вчителя"]').click();
    });
    cy.contains('div[class*="relatedItemRow"]', TEST_TEACHER.name)
        .find('input[placeholder="Лек"]').type('{selectall}1');

    cy.contains('label', "Пов'язані вчителі").parent().within(() => {
        cy.get('select').select(TEST_TEACHER_2.name);
        cy.get('button[title="Додати вчителя"]').click();
    });
    cy.contains('div[class*="relatedItemRow"]', TEST_TEACHER_2.name)
        .find('input[placeholder="Лек"]').type('{selectall}1');

    cy.contains('button', 'Створити предмет').click({ force: true });
    cy.wait('@createCurriculum');
    cy.contains('Предмет створено', { timeout: 10000 }).should('exist');
    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // CONFLICT CHECKS
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.wait(500);
    cy.contains('h2', 'Групи').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою групи"]').type(TEST_GROUP.code);
        cy.get('select').first().find('option').contains(TEST_GROUP.code).should('exist');
        cy.get('select').first().select(TEST_GROUP.code);
        cy.contains('button', 'Вибрати цю групу').click();
    });
    cy.get('table').should('exist');

    // 7.4. CONFLICT 1: Same Time, Same Teacher
    cy.get('tbody tr').eq(0).find('td').eq(1).find('div').contains('+').click({ force: true });
    cy.contains('h2', 'Створити пару').should('be.visible');

    cy.contains('label', 'Предмет:').next('select').select(TEST_SUBJECT_2);
    cy.contains('label', 'Вчителі:').parent().find('select').first().select(TEST_TEACHER.name);
    cy.get('div[class*="addRelationRow"] button').first().click();

    cy.contains('button', 'Створити пару').click();
    cy.wait('@createPair').its('response.statusCode').should('not.eq', 201);

    cy.contains(/Помилка|Conflict|busy|зайнят/i, { timeout: 10000 }).should('exist');

    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // 7.6. SUCCESS: Same Time, Different Teacher (Multipair)
    cy.get('tbody tr').eq(0).find('td').eq(1).find('div').contains('+').click({ force: true });

    cy.contains('label', 'Предмет:').next('select').select(TEST_SUBJECT_2);
    cy.contains('label', 'Тип:').next('select').select('Лекція');
    cy.contains('label', 'Вчителі:').parent().find('select').first().select(TEST_TEACHER_2.name);
    cy.get('div[class*="addRelationRow"] button').first().click();

    cy.contains('button', 'Створити пару').click();
    cy.wait('@createPair').its('response.statusCode').should('eq', 201);
    cy.contains('Пару створено успішно', { timeout: 10000 }).should('exist');

    cy.contains(TEST_SUBJECT).should('be.visible');
    cy.contains(TEST_SUBJECT_2).should('be.visible');


    // DRAG & DROP TESTS

    // 7.7. MOVE: Pair 2 -> Tue (Empty slot)
    const dataTransfer1 = new DataTransfer();

    cy.contains(TEST_SUBJECT_2)
        .parents('[draggable="true"]')
        .trigger('dragstart', { dataTransfer: dataTransfer1 });

    cy.get('tbody tr').eq(0).find('td').eq(2).as('targetCellMove'); // Tue
    cy.get('@targetCellMove').trigger('dragover', { dataTransfer: dataTransfer1 });
    cy.get('@targetCellMove').trigger('drop', { dataTransfer: dataTransfer1 });

    cy.wait('@swapPairs').its('response.statusCode').should('eq', 201);
    cy.contains('Пари переміщено', { timeout: 10000 }).should('exist');

    cy.wait(1000);

    // 7.8. SWAP: Pair 1 <-> Pair 2
    const dataTransfer2 = new DataTransfer();

    cy.contains(TEST_SUBJECT)
        .parents('[draggable="true"]')
        .trigger('dragstart', { dataTransfer: dataTransfer2 });

    cy.contains(TEST_SUBJECT_2)
        .parents('td')
        .as('targetCellSwap');

    cy.get('@targetCellSwap').trigger('dragover', { dataTransfer: dataTransfer2 });
    cy.get('@targetCellSwap').trigger('drop', { dataTransfer: dataTransfer2 });

    cy.wait('@swapPairs').its('response.statusCode').should('eq', 201);
    cy.contains('Пари переміщено', { timeout: 10000 }).should('exist');


    // 8. CLEANUP & CONSTRAINT CHECKS

    // 8.1 Constraint Checks
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.wait(500);

    cy.contains('h2', 'Навчальний план').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою"]').type(TEST_SUBJECT);
        cy.get('select').first().find('option').contains(TEST_SUBJECT).should('exist');
        cy.get('select').first().select(TEST_SUBJECT);
        cy.contains('button', 'Видалити предмет').click();
    });
    cy.wait('@deleteCurriculum').its('response.statusCode').should('not.eq', 200);
    cy.contains(/Помилка|Error|Failed/i, { timeout: 10000 }).should('exist');
    cy.get('div[class*="headerActions"] svg').click({ force: true });

    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.wait(500);
    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за ім\'ям"]').type(TEST_TEACHER.name);
        cy.get('select').first().find('option').contains(TEST_TEACHER.name).should('exist');
        cy.get('select').first().select(TEST_TEACHER.name);
        cy.contains('button', 'Видалити вчителя').click();
    });
    cy.wait('@deleteTeacher').its('response.statusCode').should('not.eq', 200);
    cy.contains(/Помилка|Error|Failed/i, { timeout: 10000 }).should('exist');
    cy.get('div[class*="headerActions"] svg').click({ force: true });


    // FINAL CLEANUP

    // 8.2 DELET PAIRS
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.wait(500);
    cy.contains('h2', 'Групи').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою групи"]').type(TEST_GROUP.code);
        cy.get('select').first().find('option').contains(TEST_GROUP.code).should('exist');
        cy.get('select').first().select(TEST_GROUP.code);
        cy.contains('button', 'Вибрати цю групу').click();
    });

    cy.contains(TEST_SUBJECT).click({ force: true });
    cy.contains('button', 'Видалити пару').click();
    cy.wait('@deletePair');

    cy.contains(TEST_SUBJECT_2).click({ force: true });
    cy.contains('button', 'Видалити пару').click();
    cy.wait('@deletePair');

    // 8.3 DELETE SUBJECTS
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.wait(500);

    // DELETE SUBJECT 1
    cy.contains('h2', 'Навчальний план').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою"]').as('sub1input');
        cy.get('@sub1input').clear();
        cy.get('@sub1input').type(TEST_SUBJECT);
        cy.get('select').first().find('option').contains(TEST_SUBJECT).should('exist');
        cy.get('select').first().select(TEST_SUBJECT);
        cy.contains('button', 'Видалити предмет').click();
    });
    cy.wait('@deleteCurriculum');

    // DELETE SUBJECT 2
    cy.contains('h2', 'Навчальний план').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою"]').as('sub2input');
        cy.get('@sub2input').clear();
        cy.get('@sub2input').type(TEST_SUBJECT_2);
        cy.get('select').first().find('option').contains(TEST_SUBJECT_2).should('exist');
        cy.get('select').first().select(TEST_SUBJECT_2);
        cy.contains('button', 'Видалити предмет').click();
    });
    cy.wait('@deleteCurriculum');
    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 8.4 DELETE GROUP
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.wait(500);
    cy.contains('h2', 'Групи').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою групи"]').type(TEST_GROUP.code);
        cy.get('select').first().find('option').contains(TEST_GROUP.code).should('exist');
        cy.get('select').first().select(TEST_GROUP.code);
        cy.contains('button', 'Видалити групу').click();
    });
    cy.wait('@deleteGroup');
    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 8.5 DELETE TEACHER
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.wait(500);

    // DELETE TEACHER 1
    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за ім\'ям"]').as('t1input');
        cy.get('@t1input').clear();
        cy.get('@t1input').type(TEST_TEACHER.name);
        cy.get('select').first().find('option').contains(TEST_TEACHER.name).should('exist');
        cy.get('select').first().select(TEST_TEACHER.name);
        cy.contains('button', 'Видалити вчителя').click();
    });
    cy.wait('@deleteTeacher');

    // DELETE TEACHER 2
    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за ім\'ям"]').as('t2input');
        cy.get('@t2input').clear();
        cy.get('@t2input').type(TEST_TEACHER_2.name);
        cy.get('select').first().find('option').contains(TEST_TEACHER_2.name).should('exist');
        cy.get('select').first().select(TEST_TEACHER_2.name);
        cy.contains('button', 'Видалити вчителя').click();
    });
    cy.wait('@deleteTeacher');
    cy.get('div[class*="headerActions"] svg').click({ force: true });
  });
});
