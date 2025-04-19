# chatimport
To set up and run the project locally, please follow these steps: 

Update the JWT_SECRET environment variable in the .env file to your JWT secret key, like this: JWT_SECRET=your_jwt_secret_key.

  1.npm i 
  2. npx tsc to compile
  3. node dist/app.js to start the server


API Endpoints
🔹 Register API
Endpoint: /api/auth/registerUser

Method: POST

Request Body:
{
  "userName": "yourUserName",
  "email": "yourEmail@example.com",
  "password": "yourPassword"
}

🔹 Login API
Endpoint: /api/auth/login

Method: POST

Request Body:
{
  "email": "yourEmail@example.com",
  "password": "yourPassword"
}

🔹 Import Chat History API
Endpoint: /api/auth/importChatHistory

Method: POST

Headers: Authorization: Bearer ${token}

Request Body (form-data):
file: .xl (Excel file)

In the Excel sheet, please add the fields: sender, receiver, and message.
user1	user2	Hello there!
tamil	john	Hey, what's up?
admin	empployee	Welcome!

⚙️ Database Configuration
🔧 Use your own local database credentials in the configuration file (e.g. db.js, or config.js) to connect to the database.


