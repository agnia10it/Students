// Этап 1. В HTML файле создайте верстку элементов, которые будут статичны(неизменны).
(function () {
  // Этап 2. Создайте массив объектов студентов.Добавьте в него объекты студентов, например 5 студентов.

  async function createStudentObj(nm, sn, pt, bd, yr, dp) {

    const response = await fetch(`http://localhost:3000/api/students`, {
      method: 'POST',
      body: JSON.stringify({
        name: nm,
        surname: sn,
        lastname: pt,
        birthday: new Date(bd).toString(),
        studyStart: yr,
        faculty: dp
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const student = await response.json();
    return student;
  };

  async function cleanList() {
    const studList = await loadStudentList();
    studList.forEach(studentObj => {
      fetch(`http://localhost:3000/api/students/${studentObj.id}`, {
        method: 'DELETE',
      });
    });
    toLocalStorage([]);
  }


  async function loadStudentList() {
    const response = await fetch(`http://localhost:3000/api/students`);
    const studentItemList = await response.json();
    return studentItemList;
  }

  function toLocalStorage(listObj) {
    localStorage.removeItem('students');
    localStorage.setItem('students', JSON.stringify(listObj));
    renderStudentsTable(listObj);
    console.log(listObj);
  }

  function fromLocalStorage() {
    let listObj = localStorage.getItem('students');
    listObj = listObj ? JSON.parse(listObj) : [];
    return listObj;
  }

  function cleanError() {
    let errors = document.getElementsByClassName('error-message');
    while (errors.length) {
      errors[0].remove();
    }
  }

  // Этап 3. Создайте функцию вывода одного студента в таблицу, по аналогии с тем,
  //как вы делали вывод одного дела в модуле 8. Функция должна вернуть html элемент
  //с информацией и пользователе.У функции должен быть один аргумент - объект студента.

  function getStudentItem(studentObj) {
    let tableList = document.getElementsByClassName('tbody__tr');
    let studentRow = document.createElement('tr');
    studentRow.classList.add('tbody__tr');
    let studentNum = document.createElement('td');
    studentNum.classList.add('tbody__td');
    studentNum.classList.add('tbody__td_num');
    studentNum.textContent = tableList.length + 1;
    studentRow.append(studentNum);
    let studentName = document.createElement('td');
    studentName.classList.add('tbody__td');
    studentName.classList.add('tbody__td_fio');
    studentName.textContent = studentObj.surname + ' ' + studentObj.name + ' ' + studentObj.lastname;
    studentRow.append(studentName);
    let studentDepart = document.createElement('td');
    studentDepart.classList.add('tbody__td');
    studentDepart.textContent = studentObj.faculty;
    studentRow.append(studentDepart);
    let studentBDay = document.createElement('td');
    studentBDay.classList.add('tbody__td');
    let years = new Date().getFullYear() - new Date(studentObj.birthday).getFullYear();
    switch (years % 10) {
      case 0:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        years = years + ' лет)';
        break;
      case 1:
        years = years + ' год)';
        break;
      case 2:
      case 3:
      case 4:
        years = years + ' года)';
    }
    let day = new Date(studentObj.birthday).getDate() < 10 ? "0" + new Date(studentObj.birthday).getDate() : new Date(studentObj.birthday).getDate();
    let month = new Date(studentObj.birthday).getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    studentBDay.textContent = day + '.' + month + '.' + new Date(studentObj.birthday).getFullYear() + ' (' + years;
    studentRow.append(studentBDay);
    let studentYears = document.createElement('td');
    studentYears.classList.add('tbody__td');
    let cours;
    if ((new Date().getFullYear() > (parseInt(studentObj.studyStart) + 4)) || ((new Date().getFullYear() === (studentObj.studyStart + 4)) && (new Date().getMonth() > 9))) {
      cours = ' (закончил)';
    } else {
      cours = new Date().getFullYear() - parseInt(studentObj.studyStart);
      cours = ' (' + cours + ' курс)';
    }
    studentYears.textContent = studentObj.studyStart + '-' + (parseInt(studentObj.studyStart) + 4) + cours;
    studentRow.append(studentYears);
    let studentDel = document.createElement('td');
    studentDel.classList.add('tbody__td');
    let delImg = document.createElement('img');
    delImg.classList.add('table_img');
    delImg.setAttribute('src', 'delete.png');
    delImg.addEventListener('click', async () => {
      if (!confirm('Вы уверены?')) {
        return;
      }
      fetch(`http://localhost:3000/api/students/${studentObj.id}`, {
        method: 'DELETE',
      });
      const newList = await loadStudentList();
      toLocalStorage(newList);
    })
    studentDel.append(delImg);
    studentRow.append(studentDel);
    return studentRow;
  }

  // Этап 4. Создайте функцию отрисовки всех студентов. Аргументом функции будет массив студентов.
  //Функция должна использовать ранее созданную функцию создания одной записи для студента.
  //Цикл поможет вам создать список студентов.Каждый раз при изменении списка студента
  //вы будете вызывать эту функцию для отрисовки таблицы.

  function renderStudentsTable(studentsArray) {
    let tableBody = document.getElementById('tbody');
    while (tableBody.children.length) {
      tableBody.children[0].remove();
    };

    studentsArray.forEach(studentObj => {
      tableBody.append(getStudentItem(studentObj));
    });
  }

  // Этап 5. К форме добавления студента добавьте слушатель события отправки формы,
  //в котором будет проверка введенных данных.Если проверка пройдет успешно,
  //добавляйте объект с данными студентов в массив студентов и запустите функцию отрисовки таблицы студентов,
  //созданную на этапе 4.

  function cleanAdd() {
    document.getElementById('input_name').value = "";
    document.getElementById('input_surname').value = "";
    document.getElementById('input_patron').value = "";
    document.getElementById('input_b_day').value = "";
    document.getElementById('input_year_start').value = "";
    document.getElementById('input_department').value = "";
    cleanError();
  }

  function addStudent() {
    cleanError();
    let inname = document.getElementById('input_name');
    let insSurname = document.getElementById('input_surname');
    let inslastnameon = document.getElementById('input_patron');
    let insBDay = document.getElementById('input_b_day');
    let insYear = document.getElementById('input_year_start');
    let insDepart = document.getElementById('input_department');
    let nm = inname.value;
    let s = insSurname.value;
    let p = inslastnameon.value;
    let bd = insBDay.value;
    let y = parseInt(insYear.value);
    let d = insDepart.value;
    let flag = true;
    if (nm.trim().length === 0) {
      flag = false;
      let errNm = document.createElement('span');
      errNm.classList.add('error-message');
      errNm.textContent = 'Слишком короткое имя';
      inname.parentElement.append(errNm);
    }
    if (s.trim().length === 0) {
      flag = false;
      let errS = document.createElement('span');
      errS.classList.add('error-message');
      errS.textContent = 'Слишком короткая фамилия';
      insSurname.parentElement.append(errS);
    }
    if (p.trim().length === 0) {
      flag = false;
      let errP = document.createElement('span');
      errP.classList.add('error-message');
      errP.textContent = 'Слишком короткое отчество';
      inslastnameon.parentElement.append(errP);
    }
    if (bd.trim().length) {
      if ((new Date(bd) > new Date()) || (new Date(bd) < new Date('1900-01-01'))) {
        flag = false;
        let errBD = document.createElement('span');
        errBD.classList.add('error-message');
        errBD.textContent = 'Дата рождения должна быть между 01.01.1900 и текущей';
        insBDay.parentElement.append(errBD);
      }
    } else {
      flag = false;
      let errBD = document.createElement('span');
      errBD.classList.add('error-message');
      errBD.textContent = 'Укажите дату рождения';
      insBDay.parentElement.append(errBD);
    }
    if (insYear.value.trim().length) {
      if ((y < 2000) || (y > new Date().getFullYear())) {
        flag = false;
        let errY = document.createElement('span');
        errY.classList.add('error-message');
        errY.textContent = 'Год начала обучения должен находиться в диапазоне от 2000-го до текущего года';
        insYear.parentElement.append(errY);
      }
    } else {
      flag = false;
      let errY = document.createElement('span');
      errY.classList.add('error-message');
      errY.textContent = 'Введите год начала обучения';
      insYear.parentElement.append(errY);
    }
    if (d.trim().length === 0) {
      flag = false;
      let errD = document.createElement('span');
      errD.classList.add('error-message');
      errD.textContent = 'Слишком короткое название факультета';
      insDepart.parentElement.append(errD);
    }

    if (flag) {
      let sList = fromLocalStorage();
      sList.push(createStudentObj(nm, s, p, bd, y.toString(), d));
      toLocalStorage(sList);
      cleanAdd();
    }
  }

  // Этап 5. Создайте функцию сортировки массива студентов и добавьте события кликов
  //на соответствующие колонки.

  function sortTable(head) {
    head.children[1].addEventListener('click', () => {
      studentsList = fromLocalStorage();
      studentsList.sort(function (a, b) {
        if (a.surname + a.name + a.lastname > b.surname + b.name + b.lastname) return 1;
        if (a.surname + a.name + a.lastname < b.surname + b.name + b.lastname) return -1;
        if (a.surname + a.name + a.lastname === b.surname + b.name + b.lastname) return 0;
      });
      toLocalStorage(studentsList);
    });
    head.children[2].addEventListener('click', () => {
      studentsList = fromLocalStorage();
      studentsList.sort(function (a, b) {
        if (a.faculty > b.faculty) return 1;
        if (a.faculty < b.faculty) return -1;
        if (a.faculty === b.faculty) return 0;
      });
      toLocalStorage(studentsList);
    });
    head.children[3].addEventListener('click', () => {
      studentsList = fromLocalStorage();
      studentsList.sort(function (a, b) {
        if (a.birthday > b.birthday) return 1;
        if (a.birthday < b.birthday) return -1;
        if (a.birthday === b.birthday) return 0;
      });
      toLocalStorage(studentsList);
    });
    head.children[4].addEventListener('click', () => {
      studentsList = fromLocalStorage();
      studentsList.sort(function (a, b) {
        if (parseInt(a.studyStart) > parseInt(b.studyStart)) return 1;
        if (parseInt(a.studyStart) < parseInt(b.studyStart)) return -1;
        if (parseInt(a.studyStart) === parseInt(b.studyStart)) return 0;
      });
      toLocalStorage(studentsList);
    });
  }

  // Этап 6. Создайте функцию фильтрации массива студентов и добавьте события для элементов формы.

  function filterTable() {
    const filtFio = document.getElementById('filter__fio');
    const filtDep = document.getElementById('filter__depart');
    const filtYearStart = document.getElementById('filter__yearstart');
    const filtYearFin = document.getElementById('filter__yearfin');
    const offFiltBTN = document.getElementById('off-filter-btn');

    function filter() {
      const fio = filtFio.value.toLowerCase().trim();
      const dep = filtDep.value.toLowerCase().trim();
      const yearStart = filtYearStart.value.trim();
      const yearFin = filtYearFin.value.trim();

      let filtarr = fromLocalStorage();

      if (fio) {
        filtarr = filtarr.filter((student) =>
          (student.name.toLowerCase().includes(fio) ||
            student.surname.toLowerCase().includes(fio) ||
            student.lastname.toLowerCase().includes(fio))
        );
      }
      if (dep) {
        filtarr = filtarr.filter((student) =>
          student.faculty.toLowerCase().includes(dep)
        )
      }

      if (yearStart) {
        filtarr = filtarr.filter((student) => student.studyStart === yearStart);
      }
      if (yearFin) {
        filtarr = filtarr.filter((student) => (parseInt(student.studyStart) + 4) === parseInt(yearFin));
      }
      renderStudentsTable(filtarr);
    };

    filtFio.addEventListener('change', () => filter());
    filtDep.addEventListener('change', () => filter());
    filtYearStart.addEventListener('change', () => filter());
    filtYearFin.addEventListener('change', () => filter());

    offFiltBTN.addEventListener('click', () => {
      filtFio.value = "";
      filtDep.value = "";
      filtYearStart.value = "";
      filtYearFin.value = "";
      studentsList = fromLocalStorage();
      renderStudentsTable(studentsList);
    })

  };


  //старт
  async function createStudentListApp(e) {
    const table = document.getElementById('student_table');
    let form = document.getElementById('input_form');
    const startBtn = document.getElementById('start-btn');
    const clearBtn = document.getElementById('clear-form-btn');
    const cleanListBtn = document.getElementById('clean-btn');

    const startList = await loadStudentList();
    toLocalStorage(startList);

    startBtn.addEventListener('click', () => {
      cleanList();
      let studentsList = [];
      studentsList.push(createStudentObj('Петр', 'Петров', 'Петрович', '2002-12-17', '2023', 'Геодезия'));
      studentsList.push(createStudentObj('Анна', 'Антонова', 'Антоновна', '2005-01-01', '2023', 'Педагогика'));
      studentsList.push(createStudentObj('Антон', 'Антонов', 'Антонович', '2005-08-07', '2022', 'Механика'));
      studentsList.push(createStudentObj('Сергей', 'Сергеев', 'Сергеевич', '2000-05-15', '2019', 'Механика'));
      toLocalStorage(studentsList);
    });

    cleanListBtn.addEventListener('click', async () => {
      cleanList();
    })

    clearBtn.addEventListener('click', (event) => {
      event.preventDefault();
      cleanAdd();
      cleanError();
    })

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      addStudent();
    });

    sortTable(table.children[0].children[0]);
    filterTable();
    renderStudentsTable(fromLocalStorage());
  }
  window.createStudentListApp = createStudentListApp;
})();
