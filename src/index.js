var books;
var selectedBooksOnSearch;
var selectedBooks;
var searchBook = document.getElementById("searchText");
const booksList = document.getElementById("booksList");
const notAvailable = document.getElementById("notAvailable");
const currentlyReading = document.getElementById("currentlyReading");
const wantToRead = document.getElementById("wantToRead");
const readDone = document.getElementById("readDone");
let listView = document.getElementById("listView");
var bookOptions = { "empty": "Move to ..", "none": "None", "currentlyReading": "Currently Reading", "wantToRead": "Want To Read", "readDone": "Read Done" }
const jsonHeader = { 'Content-Type': 'application/json' };
let urls = { getbooks: "http://localhost:3000/books", selectedBooks: "http://localhost:3000/selectedBooks/" }

function intialize() {
    getData(urls.getbooks)
        .then(response => response.json()
            .then(result => books = result));
    getData(urls.selectedBooks)
        .then(response => response.json()
            .then(result => {
                selectedBooks = result;
                displayBooks();
            })
        )
}

function autoSearch() {
    $('#searchText').autocomplete({
        source: Object.keys(books)
    });
}

function changeView(e) {
    listView.value = e.target.value == "false"
    displayBooks()
}

function displayBooks() {
    if (listView) {
        var isListView = listView.value == "true"
        let content = !isListView ? "Image View" : "List View";
        listView.textContent = content;
        currentlyReading.innerHTML = wantToRead.innerHTML = readDone.innerHTML = ""
    }
    if (!isListView) {
        selectedBooks.forEach(book => {
            let booklist = addList(book)
            let bookDivToAdd = getDivToAdd(book.status)
            bookDivToAdd && bookDivToAdd.appendChild(booklist)
        })
    }
    else {
        displayImageView()
    }
}

function addList(book) {
    let booklist = document.createElement("li")
    booklist.className = "listStyle"
    let title = document.createTextNode(`Title:${book.title},\t`)
    let author = document.createTextNode(`Author:${book.author},\t`);
    let select = createDropDown()
    select.value = book.status;
    select.id = book.id;
    select.className = "alignRight"
    select.onchange = changeStatus
    booklist.id = book.id
    booklist.append(title, author, select)
    return booklist
};

function search() {
    booksList.innerHTML = '';
    if (Object.keys(books).indexOf(searchBook.value) >= 0) {
        notAvailable.className = "notAvailable hide"
        selectedBooksOnSearch = books[searchBook.value]
        selectedBooksOnSearch.forEach(book => {
            addBook(book)
        });
    }
    else {
        notAvailable.className = "notAvailable"
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
    bookDiv.append(image, select, titleNode, authorNode)
    return bookDiv;
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
    searchBook ? selectedBooksOnSearch.forEach(getBookSelected) : selectedBooks.forEach(getBookSelected)
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
        headers: jsonHeader,
        body: JSON.stringify(bookDetails)
    })
}

function getData(url) {
    return fetch(url)
}


function displayImageView() {
    console.log(selectedBooks);
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

window.onload = intialize
