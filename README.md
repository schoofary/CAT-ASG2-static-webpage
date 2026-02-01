# Cloud Architeture Assignment 2
This is all hosted on a S3 bucket.
/S3
│ 
├── index.html <-- The main entry point (Static Hosting Target) 
│ 
├── css/ <-- Stylesheets 
│     └── styles.css 
│ 
├── js/ <-- JavaScript Logic 
│     ├── app.js <-- Main logic: Form handling & DOM manipulation 
│     ├── api.js <-- API Gateway configuration & Fetch calls 
│     └── config.js <-- Store API Gateway URL here 
│ 
└── error.html <-- Custom 404 page (Configured in S3)


The webpage has the following features:

- Shows current records of NoSQL DB:
	- shows each item (per ID) as a individual list item
	- uses a get request from the API gateway to get the items of the NoSQL db

- input field for user to be used to add to the DynamoDB.
	1. ID (Mandatory)
	2. Name 
	3. Category
	4. Price
	5. Stock
