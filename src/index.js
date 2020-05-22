var books;
var selectedBooksOnSearch;
var selectedBooks;
var searchBook = document.getElementById("searchText");
const booksList = document.getElementById("booksList");
const notAvailable = document.getElementById("notAvailable");
const currentlyReading = document.getElementById("currentlyReading");
const wantToRead = document.getElementById("wantToRead");
const readDone = document.getElementById("readDone");
const listView = document.getElementById("listView");
const tableView = document.getElementById("tableView");
const listOfBooks = document.getElementById("bookTable");
const back = document.getElementById("back");
let title = document.getElementById("title")
let imageUrl = document.getElementById("url")
let category = document.getElementById("category")
let publisher = document.getElementById("publisher")
let author = document.getElementById("author")
let publishedDate = document.getElementById("date")
var bookStatus = 'none';
var bookID;

var bookOptions = { "empty": "Move to ..", "none": "None", "currentlyReading": "Currently Reading", "wantToRead": "Want To Read", "readDone": "Read Done" }

let urls = { getbooks: "http://localhost:3000/books", selectedBooks: "http://localhost:3000/selectedBooks/" }

function intialize() {
    getData(urls.getbooks)
        .then(response => response.json()
            .then(result => books = result));
    getData(urls.selectedBooks)
        .then(response => response.json()
            .then(result => {
                selectedBooks = result.sort(sortData);
                displayBooks();
            })
        )
}
function sortData(a, b) {
    return a.title > b.title ? 1 : a.title < b.title ? -1 : 0
}

function autoSearch() {
    $('#searchText').autocomplete({
        source: books.map(book => book.title)
    });
}

function changeView(e) {
    listView.value = e.target.value == "false"
    displayBooks()
}

function displayBooks() {
    if (listView && searchBook.value.length <= 0) {
        var isListView = listView.value == "true"
        let content = !isListView ? "Image View" : "List View";
        listView.textContent = content;
        currentlyReading.innerHTML = wantToRead.innerHTML = readDone.innerHTML = listOfBooks.innerHTML = "";
        if (!isListView) {
            selectedBooks.forEach(book => {
                bookStore.className = "hide"
                tableView.className = "table table-bordered"
                addRow(book)
            })
        }
        else {
            bookStore.className = "";
            tableView.className = "hide"
            displayImageView()
        }
    }
}

function home() {
    searchBook.value = "";
    search();
    back.className = "hide"
}

function search() {
    booksList.innerHTML = '';
    let bookStore = document.getElementById("bookStore");
    let searchResults = document.getElementById("searchResults");
    if (searchBook.value.length == 0) {
        displayBooks()
        notAvailable.className = "notAvailable hide"
        searchResults.className = "hide"
    }
    else {
        let reg = new RegExp(searchBook.value.toLowerCase())
        let result = books.filter(book => reg.test(book.title.toLowerCase()))
        if (result.length > 0) {
            searchResults.className = ""
            notAvailable.className = "notAvailable hide";
            selectedBooksOnSearch = result
            selectedBooksOnSearch.forEach(book => {
                addBook(book);
            });
            displayBooks()
        }
        else {
            notAvailable.className = "notAvailable";
        }
        bookStore.className = tableView.className = "hide";
        back.className = "text-dark glyphicon glyphicon-chevron-left"
    }
}

function addBook(book) {
    let bookToAdd = displayBook(book);
    booksList.appendChild(bookToAdd);
}

function displayBook(book) {
    let select = createDropDown()
    select.className = "dropdown"
    select.value = book.status;
    select.id = book.id;
    select.onchange = changeStatus
    let image = document.createElement("img")
    image.setAttribute("src", book.imageUrl);
    image.setAttribute("alt", book.title)
    let titleNode = document.createElement("p")
    titleNode.textContent = book.title
    let authorNode = document.createElement("p");
    authorNode.textContent = "Author : " + book.author
    let bookDiv = document.createElement("div");
    bookDiv.className = "divStyle"
    bookDiv.id = book.id
    bookDiv.append(image, select, titleNode, authorNode);
    bookDiv.setAttribute("draggable", "true");
    bookDiv.setAttribute("ondragstart", "drag(event)");
    return bookDiv;
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

function drop(ev) {
    console.log(ev.target)
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if (ev.target.id == "currentlyReading" || ev.target.id == "wantToRead" || ev.target.id == "readDone") {
        let url = urls.selectedBooks + data
        updateBook(url, "PATCH", { status: ev.target.id })
            .then(res => res.json()
                .then(res => {
                    intialize()
                }))
    }
}

function createDropDown() {
    var select = document.createElement("select");
    Object.keys(bookOptions).forEach(key => {
        let option = document.createElement("OPTION"),
            optionText = document.createTextNode(bookOptions[key]);
        option.appendChild(optionText);
        option.setAttribute("value", key)
        select.append(option);
    });
    select.options[0].disabled = true
    return select;
}

function changeStatus(e) {
    let id = e.target.id;
    let status = e.target.value;
    let selectedBook;
    let method = "POST";
    let getBookSelected = (book) => {
        if (id == book.id)
            return selectedBook = book
    }
    searchBook.value.length > 0 ? selectedBooksOnSearch.forEach(getBookSelected) : selectedBooks.forEach(getBookSelected)
    selectedBook.status = status
    selectedBooks.forEach(book => {
        if (book.id == id)
            method = "PUT"
    })
    let url = method == "POST" ? urls.selectedBooks : urls.selectedBooks + id
    if (status === "none") {
        deleteBook(url).then(response => intialize())
    }
    else {
        updateBook(url, method, selectedBook).then(response => intialize())
    }
}

function deleteBook(url) {
    return fetch(url, {
        method: "delete"
    })
}

function updateBook(url, method, bookDetails) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookDetails)
    })
}

function getData(url) {
    return fetch(url)
}


function displayImageView() {
    selectedBooks.forEach(book => {
        let bookToAdd = displayBook(book)
        let bookDivToAdd = getDivToAdd(book.status)
        bookDivToAdd && bookDivToAdd.appendChild(bookToAdd)
    })
}

function getDivToAdd(value) {
    switch (value) {
        case "currentlyReading": return currentlyReading
        case "readDone": return readDone
        case "wantToRead": return wantToRead
    }
}

function addNewBook() {
    let selectedBook = {}
    selectedBook.title = title.value;
    selectedBook.imageUrl = imageUrl.value;
    selectedBook.category = category.value;
    selectedBook.publisher = publisher.value;
    selectedBook.author = author.value;
    selectedBook.publishedDate = publishedDate.value;
    selectedBook.status = bookStatus;

    if (bookStatus === "none") {
        updateBook(urls.getbooks, "POST", selectedBook)
            .then(res => window.location.href = "index.html")
            .catch(err=>{debugger;alert("Id already exists")})
    }
    else {
        updateBook(urls.selectedBooks + bookID, "PUT", selectedBook).then(res => window.location.href = "index.html")
    }
}

function addRow(book) {
    let tableRow = document.createElement("tr");
    let title = document.createElement("td")
    title.textContent = book.title
    let author = document.createElement("td")
    author.textContent = book.author;
    let publisher = document.createElement("td");
    publisher.textContent = book.publisher;
    let category = document.createElement("td");
    category.textContent = book.category;
    let date = document.createElement("td");
    date.textContent = book.publishedDate
    let status = document.createElement("td")
    let select = createDropDown()
    select.value = book.status;
    select.id = book.id;
    select.onchange = changeStatus
    status.appendChild(select);
    let actions = document.createElement("td")
    let edit = document.createElement("span")
    edit.className = "btn btn-success glyphicon glyphicon-pencil"
    edit.onclick = editRow
    let deleteData = document.createElement("span");
    deleteData.className = "btn btn-warning glyphicon glyphicon-trash";
    deleteData.onclick = deleteRow
    actions.append(edit, deleteData);
    edit.id = deleteData.id = tableRow.id = book.id;
    tableRow.append(title, author, publisher, category, date, status, actions)
    listOfBooks.appendChild(tableRow)
}

function editRow(e) {
    let selectedBook = selectedBooks.filter(book => {
        if (book.id == e.target.id) return book
    })[0]
    window.localStorage.setItem("book", JSON.stringify(selectedBook))
    window.location.href = "addBook.html"
}

function deleteRow(e) {
    let id = e.target.id;
    document.getElementById("bookTable").removeChild(document.getElementById(id))
    deleteBook(urls.selectedBooks + id).then(response => intialize())
}

function setData() {
    let selectedBook = JSON.parse(window.localStorage.getItem("book"))
    if (selectedBook) {
        bookID = selectedBook.id
        title.value = selectedBook.title
        imageUrl.value = selectedBook.imageUrl
        category.value = selectedBook.category
        publisher.value = selectedBook.publisher;
        author.value = selectedBook.author;
        publishedDate.value = selectedBook.publishedDate;
        bookStatus = selectedBook.status
        window.localStorage.removeItem("book")
    }
}

window.onload = () => {
    intialize();
    setData()
}

