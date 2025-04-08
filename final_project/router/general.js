const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) =>{
    try {
        // Simulate an asynchronous operation using a Promise
        const data = await new Promise((resolve, reject) => {
            // Here you can perform any asynchronous operation, like fetching data
            // For demonstration, we'll resolve the promise immediately with the books data
            resolve({ books });
        });

        // Send the response with the books data
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        // Handle any errors that occur during the promise execution
        res.status(400).send("An error occurred while fetching the books.");
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    new Promise((resolve, reject) => {
        const book_isbn = parseInt(req.params.isbn);
        const bookDetails = books[book_isbn];

        if(bookDetails){
            resolve(bookDetails);
        }
        else{
            reject("Book not found");
        }
    })
    .then((data) => {
        res.send(data);
    })
    .catch((error) => {
        res.status(404).send(error);
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    new Promise((resolve, reject) => {
        // get array of matching book objects
        const matchingBooks = Object.values(books).filter(
            (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
          );
        if(matchingBooks.length > 0){
            resolve(matchingBooks);
        }
        else{
            reject("Book not found.");
        }
    })
    .then((data) => {
        res.status(200).send(JSON.stringify(data , null , 4));
    })
    .catch((error) => {
        res.status(404).json({message : error});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    new Promise((resolve, reject) => {
        // get array of matching book objects
        const matchingBooks = Object.values(books).filter(
            (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
          );
        if(matchingBooks.length > 0){
            resolve(matchingBooks);
        }
        else{
            reject("Book not found.");
        }
    })
    .then((data) => {
        res.status(200).send(JSON.stringify(data , null , 4));
    })
    .catch((error) => {
        res.status(404).json({message : error});
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    let targetBook = books[isbn];
    if(targetBook){
        return res.status(200).send(JSON.stringify(targetBook.reviews, null ,4));
    }
    else{
        return res.status(404).json({message:"Book not available!"});
    }
});

module.exports.general = public_users;
