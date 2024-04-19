const camersFeed = document.getElementById('camera-feed');
const studentName = document.getElementById('student-name');
const gradeDropdown = document.getElementById('grade');
const bookSetDropdown = document.getElementById('book-set');
const bookEntry = document.getElementsByClassName('book-entry')[0];
const bookList = document.getElementById('book-list');

let students = {};
let books = {};
let settings = {};

async function getStudents() {
    const studentsJSON = await shared.readData('students.json');
    students = JSON.parse(studentsJSON);
}

async function saveStudents() {
    const studentsJSON = JSON.stringify(students);
    await shared.writeData('students.json', studentsJSON);
}

async function getBooks() {
    const booksJSON = await shared.readData('books.json');
    books = JSON.parse(booksJSON);
}

async function getSettings() {
    const settingsJSON = await shared.readData('settings.json');
    settings = JSON.parse(settingsJSON);
}

async function loadData() {
    await getStudents();
    await getBooks();
    await getSettings();

    const studentId = await shared.getValue('student');
    const student = students[studentId];

    studentName.innerText = student.name;

    for (let i = 1; i <= settings.grades; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        gradeDropdown.append(option);
    }

    if (!student.grade) student.grade = 1;
    gradeDropdown.value = student.grade;
    
    for (let name of settings.classTypes) {
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        bookSetDropdown.append(option);
    }

    if (!student.classType) student.classType = settings.defaultclassType;
    bookSetDropdown.value = student.classType;

    if (!student.books) student.books = [];
    student.books = student.books.map(String);
}

function checkBook(bookId, grade, classType) {
    const book = books[bookId];
    return grade >= book.gradeMin && grade <= book.gradeMax && book.classTypes.includes(classType);
}

function queryBooks(grade, set) {
    const queryResult = [];
    for (let bookId of Object.keys(books)) {
        if (checkBook(bookId, grade, set)) {
            queryResult.push(bookId);
        }
    }
    return queryResult;
}

function removeClasses(...args) { // lol
    let elements = [];
    let classes = [];

    for (let arg of args) {
        if (typeof arg === 'string') {
            classes.push(arg);
        } else if (arg instanceof HTMLElement) {
            elements.push(arg);
        }
    }

    for (let element of elements) {
        for (let className of classes) {
            element.classList.remove(className);
        }
    }
}



async function updateBookEntry(entry) {
    const studentId = await shared.getValue('student');
    const student = students[studentId];

    const bookId = entry.dataset.bookId;
    const book = books[bookId]

    const atStudent = student.books.includes(bookId);
    const required = checkBook(bookId, student.grade, student.classType);

    const image = entry.querySelector('.book-image');
    const bookNameDiv = entry.querySelector('.book-name');
    const bookStateDiv = entry.querySelector('.book-state');
    const inLibraryButton = entry.querySelector('.in-library');
    const atStudentButton = entry.querySelector('.at-student');

    image.src = `../images/${book.thumbnail}`;

    removeClasses(atStudentButton, inLibraryButton, 'active');

    if (atStudent) {
        atStudentButton.classList.add('active');
    } else {
        inLibraryButton.classList.add('active');
    }

    bookNameDiv.innerText = book.title;

    removeClasses(bookStateDiv, 'give', 'take', 'ok');

    if (atStudent) {
        bookStateDiv.innerText = required && 'OK' || 'Нужно забрать';
        bookStateDiv.classList.add(required && 'ok' || 'take');
        return required && 1 || 3;
    } else {
        bookStateDiv.innerText = required && 'Нужно вдать' || 'OK';
        bookStateDiv.classList.add(required && 'give' || 'ok');
        return required && 2 || 1;
    }
}

async function renderStudentBooks() {
    const studentId = await shared.getValue('student');
    const student = students[studentId];

    student.classType = bookSetDropdown.value;
    student.grade = gradeDropdown.value;

    saveStudents();

    let entries = bookList.querySelectorAll('.book-entry');
    entries.forEach((entry) => {
        entry.remove();
    });

    const studentBooks = student.books;
    const requiredBooks = queryBooks(student.grade, student.classType);
    const booksToDispaly = new Set([...studentBooks, ...requiredBooks]);

    const nodes_take = [];
    const nodes_give = [];
    const nodes_ok = [];

    for (let bookId of booksToDispaly) {
        const entry = bookEntry.cloneNode(true);
        entry.dataset.bookId = bookId;
        const type = await updateBookEntry(entry);
        console.log(type)
        if (type === 3) {
            nodes_take.push(entry);
        } else if (type === 2) {
            nodes_give.push(entry);
        } else if (type === 1) {
            nodes_ok.push(entry);
        }
    }
    console.log(nodes_ok)
    bookList.append(...nodes_take, ...nodes_give, ...nodes_ok);
}

async function click(event) {
    if (!event.target) return;
    const classList = event.target.classList;
    if (!classList.contains("btn")) return;
    if (classList.contains("return")) {
        await shared.navigate('home.html');
    } else {
        if (classList.contains("at-student")) {
            const studentId = await shared.getValue('student');
            const student = students[studentId];

            const bookEntry = event.target.closest('.book-entry');
            const bookId = bookEntry.dataset.bookId;

            if (!student.books.includes(bookId)) {
                student.books.push(bookId);
            }

            saveStudents();
            updateBookEntry(bookEntry);
        } else if (classList.contains("in-library")) {
            const studentId = await shared.getValue('student');
            const student = students[studentId];

            const bookEntry = event.target.closest('.book-entry');
            const bookId = bookEntry.dataset.bookId;

            const index = student.books.indexOf(bookId);
            if (index !== -1) {
                student.books.splice(index, 1);
            }

            saveStudents();
            updateBookEntry(bookEntry);
        }
        // ignore other buttons
    }
}

loadData().then(renderStudentBooks);
document.body.addEventListener("click", click);
document.addEventListener('input', renderStudentBooks);