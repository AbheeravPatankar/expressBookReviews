const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    if(users.includes(username)){
        return false;
    }
    else{
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(authenticatedUser(username, password)){
        let accessToken = jwt.sign({data: password}, "access" , {expiresIn: 60*60});
        req.session.authorization = {accessToken, username};
        return res.status(200).send("User successfully logged in");
    }
    else{
        return res.status(208).json({ message: "Invalid Login. Check username and password."});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const user = req.session.authorization.username;
    const review = req.body.reviews;
    const isbn = req.params.isbn;
    if (!review) {
        res.status(400).json({ message: "Review is empty!" });
    }
    else{
        books[isbn].reviews[user] = review;
        res.status(200).json({ message: "Book review updated." });
    }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const user = req.session.authorization.username;
    const isbn = req.params.isbn;
    if(!books[isbn]){
        res.status(400).json({ message: "invalid ISBN." });
    }
    else if(!books[isbn].reviews[user]){
        res.status(404).json({message: `${user} have not added a prior review for this book.`});
    }
    else{
        delete books[isbn].reviews[user];
        res.status(200).json({message: "Book review deleted succesfully!"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
