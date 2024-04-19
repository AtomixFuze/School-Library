const searchBar = document.getElementById('search-bar');
const studentsList = document.getElementById('students-list');
const studentEntry = document.getElementsByClassName('student-entry')[0];

let students = {};

async function getStudents() {
    const studentsJSON = await shared.readData('students.json');
    students = JSON.parse(studentsJSON);
}

async function saveStudents() {
    const studentsJSON = JSON.stringify(students);
    await shared.writeData('students.json', studentsJSON);
}


async function filterStudents(query) {
    const list = {};
    for (const [id, student] of Object.entries(students)) {
        const name = student.name || "";
        const words = name.toLowerCase().split(' ');
        if (words.some(word => word.toLowerCase().startsWith(query.toLowerCase()))) {
            list[id] = student;
        }
    }
    return list;
}

async function refreshList (list) {
    if (!list) {
        list = students
    }
    let entries = studentsList.querySelectorAll('.student-entry');
    entries.forEach((entry) => {
        entry.remove();
    });
    for (let [id, student] of Object.entries(list)) {
        const entry = studentEntry.cloneNode(true);
        const columns = Array.from(entry.children);
        columns[0].innerHTML = student.name || "";
        columns[1].innerHTML = student.grade || "";
        const openBtn = entry.querySelector('.btn');
        openBtn.parentNode.dataset.studentId = id;
        studentsList.append(entry);
    }
}

async function input(event) {
    const search = event.target.value || "";
    const list = await filterStudents(search);
    await refreshList(list);
}

function removeStudent(studentId) {
    if (!students.hasOwnProperty(studentId)) {
        console.error(`Student with ID ${studentId} not found.`);
        return;
    }

    delete students[studentId];

    const orderedStudents = {};
    let newId = 1;
    for (const id in students) {
        if (students.hasOwnProperty(id)) {
            orderedStudents[newId] = students[id];
            newId++;
        }
    }

    students = orderedStudents;

    refreshList(students);
}

async function click(event) {
    if (!event.target) return;
    const classList = event.target.classList;
    if (!classList.contains("btn")) return;
    if (classList.contains('settings')) {
        await shared.navigate('add_student.html');
    } else if (classList.contains('delete')) {
        const confirmation = window.confirm("Вы уверены что хотите удалить ученика?");
        if (!confirmation) return;
        const studentId = event.target.parentNode.dataset.studentId;
        removeStudent(studentId);
        await saveStudents();
    } else {
        const studentId = event.target.parentNode.dataset.studentId;
        if (studentId) {
            await shared.setValue('student', studentId);
            await shared.navigate('books.html');
        }
    }
}

getStudents().then(refreshList);

searchBar.addEventListener("input", input);
document.body.addEventListener("click", click);