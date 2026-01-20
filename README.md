# 🎬 myFlix API

The myFlix API is a RESTful web service built with Node.js, Express, and MongoDB.
It provides access to information about movies, genres, and directors, and allows users to register, authenticate, manage profiles, and maintain a list of favorite movies.

This project was developed as part of the CareerFoundry Full-Stack Immersion Program.

---

## 📌 Project Overview

### Purpose

The purpose of this API is to serve as the backend for the myFlix client applications (Angular and React Native). It demonstrates RESTful API design, authentication with JWT, database modeling with Mongoose, and secure handling of user data.

---

## 🛠️ Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Passport
- bcrypt
- CORS
- Morgan
- JSDoc

---

## ⚙️ Setup Instructions

### 1️⃣ Prerequisites

Make sure you have the following installed:

- Node.js (v16+ recommended)
- npm
- MongoDB (local installation or MongoDB Atlas)

---

### 2️⃣ Clone the Repository

git clone <your-repository-url>
cd movie_api

---

### 3️⃣ Install Dependencies

npm install

---

## 🗄️ Database Configuration

This API uses MongoDB for data persistence.

### Environment Variables

Create a .env file in the project root and add the following:

CONNECTION_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myFlixDB
PORT=8080

IMPORTANT:
Do not commit the .env file to version control. It should be listed in .gitignore.

---

## ▶️ Running the Server

Start the server with:

npm start

The API will be available at:

http://localhost:8080

---

## 📄 API Documentation

This project includes two forms of API documentation.

### 1️⃣ Generated Documentation (JSDoc)

API documentation generated using JSDoc is located in the out/ folder.

To view it:
Open out/index.html in your browser.

---

### 2️⃣ Static HTML Documentation

A manually written API reference is available at:

public/documentation.html

This file provides endpoint descriptions, request formats, and response examples.

---

## 🔐 Authentication

Most API endpoints are protected using JWT authentication.

After logging in, include the token in request headers:

Authorization: Bearer <token>

---

## 🤖 AI Usage Disclosure

AI tools were used to assist with drafting and structuring documentation and Readme.
All generated content was reviewed, edited, and verified for accuracy by the author.
