const nameInput = document.getElementById("name");
const gradeDropdown = document.getElementById("grade");
const classDropdown = document.getElementById("class-type");
const booksGivenBox = document.getElementById("books-given");
const confirmButton = document.getElementById("confirm");
const cancelButton = document.getElementById("cancel");

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
    await getBooks();
    await getSettings();

    for (let i = 1; i <= settings.grades; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        gradeDropdown.append(option);
    }

    for (let name of settings.classTypes) {
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        classDropdown.append(option);
    }
}

loadData();

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

async function addStudent() {
    const name = nameInput.value;
    const grade = gradeDropdown.value;
    const classType = classDropdown.value;
    const booksGiven = booksGivenBox.value == "on"? true : false;

    await getStudents();

    const student = {name, grade, classType};

    if (booksGiven) {
        student.books = queryBooks(grade, classType);
    } else {
        student.books = [];
    }

    const currentStudents = Object.keys(students).length;
    students[String(currentStudents + 1)] = student;
    await saveStudents();
    shared.navigate("home.html");
}

function goBack() {
    shared.navigate("home.html");
}

cancelButton.addEventListener("click", goBack);
confirmButton.addEventListener("click", addStudent);