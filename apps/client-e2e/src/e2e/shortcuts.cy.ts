/* eslint-disable cypress/no-unnecessary-waiting */
describe('Schedule Shortcuts (Ctrl+C, V, X, S, Delete) & Context Validation', () => {
  const TIMESTAMP = Date.now();
  const ADMIN_LOGIN = 'Head Admin';
  const ADMIN_PASS = 'Zxcvb2468';

  const TEACHER_IN_PAIR = {
    name: `T_IN_${TIMESTAMP}`,
    dept: 'TestDept',
    post: 'Викладач',
  };

  const TEACHER_OUT_OF_PAIR = {
    name: `T_OUT_${TIMESTAMP}`,
    dept: 'TestDept',
    post: 'Доцент',
  };

  const GROUP_IN_PAIR = {
    code: `G_IN_${TIMESTAMP}`,
    faculty: 'TestFac',
  };

  const GROUP_OUT_OF_PAIR = {
    code: `G_OUT_${TIMESTAMP}`,
    faculty: 'TestFac',
  };

  const TEST_SUBJECT_1 = `Subj_1_${TIMESTAMP}`;
  const TEST_SUBJECT_2 = `Subj_2_${TIMESTAMP}`;

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
    cy.intercept('DELETE', '**/curriculum/*').as('deleteCurriculum');

    cy.intercept('POST', '**/pair').as('createPair');
    cy.intercept('DELETE', '**/pair/*').as('deletePair');
    cy.intercept('POST', '**/*swap*').as('swapPairs');
  });

  it('should test full shortcut lifecycle: Copy, Paste, Cut, Swap, Context Checks, Delete', () => {

    // 1. SETUP: LOGIN & CREATE ENTITIES

    cy.visit('/admin');
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder="Login"]').length > 0) {
        cy.get('input[placeholder="Login"]').type(ADMIN_LOGIN);
        cy.get('input[placeholder="Password"]').type(ADMIN_PASS);
        cy.get('button').contains('Login').click();
        cy.wait('@loginReq');
      }
    });

    // 1.1 Create Teachers
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');

    // Teacher 1 (Will be in pair)
    cy.get('input[placeholder="Введіть ПІБ"]').type(TEACHER_IN_PAIR.name);
    cy.get('input[placeholder="Введіть кафедру"]').type(TEACHER_IN_PAIR.dept);
    cy.contains('label', 'Посада:').next('select').select(TEACHER_IN_PAIR.post);
    cy.contains('button', 'Додати вчителя').click({ force: true });
    cy.wait('@createTeacher');

    // Teacher 2 (Will NOT be in pair)
    cy.get('input[placeholder="Введіть ПІБ"]').clear();
    cy.get('input[placeholder="Введіть ПІБ"]').type(TEACHER_OUT_OF_PAIR.name);
    cy.get('input[placeholder="Введіть кафедру"]').clear();
    cy.get('input[placeholder="Введіть кафедру"]').type(TEACHER_OUT_OF_PAIR.dept);
    cy.contains('button', 'Додати вчителя').click({ force: true });
    cy.wait('@createTeacher');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 1.2 Create Groups
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    // Group 1 (Will be in pair)
    cy.get('input[placeholder="Введіть ім\'я групи"]').type(GROUP_IN_PAIR.code);
    cy.get('input[placeholder="Введіть факультет"]').type(GROUP_IN_PAIR.faculty);
    cy.contains('button', 'Додати групу').click({ force: true });
    cy.wait('@createGroup');

    // Group 2 (Will NOT be in pair)
    cy.get('input[placeholder="Введіть ім\'я групи"]').clear();
    cy.get('input[placeholder="Введіть ім\'я групи"]').type(GROUP_OUT_OF_PAIR.code);
    cy.get('input[placeholder="Введіть факультет"]').clear();
    cy.get('input[placeholder="Введіть факультет"]').type(GROUP_OUT_OF_PAIR.faculty);
    cy.contains('button', 'Додати групу').click({ force: true });
    cy.wait('@createGroup');

    // Select Group 1 to start
    cy.contains('h2', 'Групи').parent().next().find('select').first().find('option').contains(GROUP_IN_PAIR.code).then($option => {
        cy.contains('h2', 'Групи').parent().next().find('select').first().select($option.val() as string);
    });
    cy.contains('button', 'Вибрати цю групу').click();

    // 1.3 Create Subject 1 (Link T1 and G1)
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.get('input[placeholder="Введіть назву"]').type(TEST_SUBJECT_1);

    cy.contains('label', "Пов'язані вчителі").parent().within(() => {
        cy.get('select').find('option').contains(TEACHER_IN_PAIR.name).then($option => {
             cy.get('select').select($option.val() as string);
        });
        cy.get('button[title="Додати вчителя"]').click();
    });

    cy.contains('label', "Пов'язані групи").parent().within(() => {
        cy.get('select').find('option').contains(GROUP_IN_PAIR.code).then($option => {
            cy.get('select').select($option.val() as string);
       });
       cy.get('button[title="Додати групу"]').click();
    });

    cy.contains('button', 'Створити предмет').click({ force: true });
    cy.wait('@createCurriculum');

    // 1.4 Create Subject 2 (Link T1 and G1) - For Swap Test
    cy.get('input[placeholder="Введіть назву"]').clear();
    cy.get('input[placeholder="Введіть назву"]').type(TEST_SUBJECT_2);

    cy.contains('label', "Пов'язані вчителі").parent().within(() => {
        cy.get('select').find('option').contains(TEACHER_IN_PAIR.name).then($option => {
             cy.get('select').select($option.val() as string);
        });
        cy.get('button[title="Додати вчителя"]').click();
    });

    cy.contains('label', "Пов'язані групи").parent().within(() => {
        cy.get('select').find('option').contains(GROUP_IN_PAIR.code).then($option => {
            cy.get('select').select($option.val() as string);
       });
       cy.get('button[title="Додати групу"]').click();
    });

    cy.contains('button', 'Створити предмет').click({ force: true });
    cy.wait('@createCurriculum');
    cy.get('div[class*="headerActions"] svg').click({ force: true });



    // 2. CREATE INITIAL PAIR (Subj 1 on Mon)

    cy.get('table').should('exist');
    cy.contains('h2', `Розклад: ${GROUP_IN_PAIR.code}`).should('be.visible');

    cy.get('tbody tr').eq(0).find('td').eq(1).as('cellMon1');
    cy.get('@cellMon1').find('div').contains('+').click({ force: true });

    cy.contains('label', 'Предмет:').next('select').select(TEST_SUBJECT_1);
    cy.contains('label', 'Вчителі:').parent().find('select').first().select(TEACHER_IN_PAIR.name);
    cy.get('div[class*="addRelationRow"] button').first().click();
    cy.contains('button', 'Створити пару').click({ force: true });
    cy.wait('@createPair');
    cy.contains(TEST_SUBJECT_1).should('be.visible');



    // 3. TEST COPY (Ctrl+C) & PASTE (Ctrl+V)

    cy.contains(TEST_SUBJECT_1).parents('div[class*="pairItem"]').as('pairSubj1');

    // Copy Mon 1
    cy.get('@pairSubj1').trigger('mouseover', { force: true });
    cy.get('@pairSubj1').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').click({ force: true });
    cy.get('body').type('{ctrl}c');
    cy.contains('Пару скопійовано').should('be.visible');

    // Paste to Tue 1
    cy.get('tbody tr').eq(0).find('td').eq(2).as('cellTue1');
    cy.get('@cellTue1').trigger('mouseover', { force: true });
    cy.get('@cellTue1').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}v');

    cy.wait('@createPair');
    cy.contains('Пару додано').should('be.visible');
    // Result: Mon1=Subj1, Tue1=Subj1



    // 4. TEST CUT (Ctrl+X) & PASTE (Ctrl+V)


    // Cut Tue 1
    cy.get('@cellTue1').find('div[class*="pairItem"]').as('pairTue1');
    cy.get('@pairTue1').trigger('mouseover', { force: true });
    cy.get('@pairTue1').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}x');
    cy.contains('Пару вирізано').should('be.visible');

    // Paste to Wed 1
    cy.get('tbody tr').eq(0).find('td').eq(3).as('cellWed1');
    cy.get('@cellWed1').trigger('mouseover', { force: true });
    cy.get('@cellWed1').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}v');

    cy.wait('@createPair');
    cy.wait('@deletePair'); // Old pair deleted
    cy.contains('Пару додано').should('be.visible');

    // Check: Tue1 is empty, Wed1 has Subj1
    cy.get('@cellTue1').find('div[class*="pairItem"]').should('not.exist');
    cy.get('@cellWed1').contains(TEST_SUBJECT_1).should('exist');



    // 5. TEST SWAP (Ctrl+S)


    // 5.1 Create Second Pair (Subj 2 on Thu 1)
    cy.get('tbody tr').eq(0).find('td').eq(4).as('cellThu1');
    cy.get('@cellThu1').find('div').contains('+').click({ force: true });
    cy.contains('label', 'Предмет:').next('select').select(TEST_SUBJECT_2);
    cy.contains('label', 'Вчителі:').parent().find('select').first().select(TEACHER_IN_PAIR.name);
    cy.get('div[class*="addRelationRow"] button').first().click();
    cy.contains('button', 'Створити пару').click({ force: true });
    cy.wait('@createPair');
    cy.contains(TEST_SUBJECT_2).should('be.visible');

    // 5.2 Copy Subj 1 (from Wed 1)
    cy.get('@cellWed1').find('div[class*="pairItem"]').trigger('mouseover', { force: true });
    cy.get('@cellWed1').find('div[class*="pairItem"]').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}c');
    cy.contains('Пару скопійовано').should('be.visible');

    // 5.3 Swap with Subj 2 (on Thu 1)
    cy.get('@cellThu1').find('div[class*="pairItem"]').trigger('mouseover', { force: true });
    cy.get('@cellThu1').find('div[class*="pairItem"]').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}s');

    cy.wait('@swapPairs');
    cy.contains('Пари поміняно місцями').should('be.visible');

    // Result: Wed1=Subj2, Thu1=Subj1
    cy.get('@cellWed1').contains(TEST_SUBJECT_2).should('exist');
    cy.get('@cellThu1').contains(TEST_SUBJECT_1).should('exist');



    // 6. VALIDATE CONTEXT CHECKS (PASTE)


    // Copy Subj 1 (now on Thu 1) to use for testing
    cy.get('@cellThu1').find('div[class*="pairItem"]').trigger('mouseover', { force: true });
    cy.get('@cellThu1').find('div[class*="pairItem"]').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}c');
    cy.contains('Пару скопійовано').should('be.visible');

    // 6.1 Test Paste into VALID Teacher Schedule
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за ім\'ям"]').clear();
        cy.get('input[placeholder="Фільтр за ім\'ям"]').type(TEACHER_IN_PAIR.name);
        cy.get('select').first().find('option').contains(TEACHER_IN_PAIR.name).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Вибрати цього вчителя').click();
        });
    });

    // Paste into Fri 1
    cy.get('tbody tr').eq(0).find('td').eq(5).as('cellFri1');
    cy.get('@cellFri1').trigger('mouseover', { force: true });
    cy.get('@cellFri1').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}v');

    cy.wait('@createPair');
    cy.contains('Пару додано').should('be.visible');
    cy.get('@cellFri1').contains(TEST_SUBJECT_1).should('exist');

    // 6.2 Test Paste into INVALID Teacher Schedule (Teacher not in pair)
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за ім\'ям"]').clear();
        cy.get('input[placeholder="Фільтр за ім\'ям"]').type(TEACHER_OUT_OF_PAIR.name);

        cy.get('select').first().find('option').contains(TEACHER_OUT_OF_PAIR.name).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Вибрати цього вчителя').click();
        });
    });

    cy.get('tbody tr').eq(0).find('td').eq(5).as('targetCellFriOut');
    cy.get('@targetCellFriOut').trigger('mouseover', { force: true });
    cy.get('@targetCellFriOut').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}v');

    cy.contains('Неможливо вставити: пара не містить поточного вчителя').should('be.visible');
    cy.get('@targetCellFriOut').find('div[class*="pairItem"]').should('not.exist');

    // 6.3 Test Paste into INVALID Group Schedule (Group not in pair)
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');
    cy.contains('h2', 'Групи').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за назвою групи"]').clear();
        cy.get('input[placeholder="Фільтр за назвою групи"]').type(GROUP_OUT_OF_PAIR.code);

        cy.get('select').first().find('option').contains(GROUP_OUT_OF_PAIR.code).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Вибрати цю групу').click();
        });
    });

    cy.get('tbody tr').eq(0).find('td').eq(5).as('targetCellFriGroupOut');
    cy.get('@targetCellFriGroupOut').trigger('mouseover', { force: true });
    cy.get('@targetCellFriGroupOut').trigger('mouseenter', { force: true });
    cy.wait(300);
    cy.get('body').type('{ctrl}v');

    cy.contains('Неможливо вставити: пара не містить поточну групу').should('be.visible');
    cy.get('@targetCellFriGroupOut').find('div[class*="pairItem"]').should('not.exist');



    // 7. CLEANUP USING DELETE SHORTCUT


    const deleteAllPairs = () => {
      cy.get('body').then(($body) => {
        const pairs = $body.find('div[class*="pairItem"]');
        if (pairs.length > 0) {
          cy.wrap(pairs.first()).then(($el) => {
             cy.wrap($el).scrollIntoView();

             cy.wrap($el).trigger('mouseover', { force: true });
             cy.wrap($el).trigger('mouseenter', { force: true });
             cy.wait(500);

             cy.get('body').click({ force: true });
             cy.wrap($el).trigger('mouseenter', { force: true });
             cy.wait(200);

             cy.get('body').type('{del}');
             cy.wait('@deletePair');

             cy.wait(1500);
             deleteAllPairs();
          });
        }
      });
    };

    // 7.1 Clear Teacher 1/Group 1 Schedule
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');
    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('input[placeholder="Фільтр за ім\'ям"]').clear();
        cy.get('input[placeholder="Фільтр за ім\'ям"]').type(TEACHER_IN_PAIR.name);
        cy.get('select').first().find('option').contains(TEACHER_IN_PAIR.name).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Вибрати цього вчителя').click();
        });
    });
    deleteAllPairs();



    // 8. DELETE ENTITIES (Subject -> Group/Teacher)


    // 8.1 Delete Subjects
    cy.contains('button', 'Предмети').click();
    cy.wait('@getCurriculums');
    cy.contains('h2', 'Навчальний план').parent().next().within(() => {
         cy.get('select').first().find('option').contains(TEST_SUBJECT_1).then($opt => {
             cy.get('select').first().select($opt.val() as string);
             cy.contains('button', 'Видалити предмет').click();
         });
    });
    cy.wait('@deleteCurriculum');

    cy.contains('h2', 'Навчальний план').parent().next().within(() => {
         cy.get('select').first().find('option').contains(TEST_SUBJECT_2).then($opt => {
             cy.get('select').first().select($opt.val() as string);
             cy.contains('button', 'Видалити предмет').click();
         });
    });
    cy.wait('@deleteCurriculum');

    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 8.2 Delete Groups
    cy.contains('button', 'Групи').click();
    cy.wait('@getGroups');

    cy.contains('h2', 'Групи').parent().next().within(() => {
        cy.get('select').first().find('option').contains(GROUP_IN_PAIR.code).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Видалити групу').click();
        });
    });
    cy.wait('@deleteGroup');

    cy.contains('h2', 'Групи').parent().next().within(() => {
        cy.get('select').first().find('option').contains(GROUP_OUT_OF_PAIR.code).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Видалити групу').click();
        });
    });
    cy.wait('@deleteGroup');
    cy.get('div[class*="headerActions"] svg').click({ force: true });

    // 8.3 Delete Teachers
    cy.contains('button', 'Вчителі').click();
    cy.wait('@getTeachers');

    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('select').first().find('option').contains(TEACHER_IN_PAIR.name).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Видалити вчителя').click();
        });
    });
    cy.wait('@deleteTeacher');

    cy.contains('h2', 'Вчителі').parent().next().within(() => {
        cy.get('select').first().find('option').contains(TEACHER_OUT_OF_PAIR.name).then($opt => {
            cy.get('select').first().select($opt.val() as string);
            cy.contains('button', 'Видалити вчителя').click();
        });
    });
    cy.wait('@deleteTeacher');
    cy.get('div[class*="headerActions"] svg').click({ force: true });

  });
});
