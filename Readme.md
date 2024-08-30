# backend notes

[DB Models](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## dotenv

- **npm install dotenv**
- npm package which is need to be installed and configured as early as possible to use the variables which are declared in the .env file

## CORS

### Cross-Origin Resource Sharing

- **npm i cors**
- used to allow different origins(URLS/frontend) to send send request to our server

## app.use(express.json())

- express server allow that it can receive request in json format

## app.use(express.urlencoded())

- express server allow that it can receive request in urlencoded format

## cookie-parser

- **npm i cookie-parser**
- server can be able to access and set cookie in the user browser

## mongoose-aggregate-paginate-v2

- **npm i mongoose-aggregate-paginate-v2**
- which enables us to use mongodb aggregation pipeline

## bcrypt

- **npm i bcrypt**
- which enables us to store a passwords in hashed form into our DB that no can see original password by looking into DB

## JWT

- **npm i jsonwebtoken**
- which enables us to create a jwt token ( usually a long string) which is encoded and used to transmit data in the JSON format
- JSON Web Tokens (JWT) are compact, URL-safe tokens used for securely transmitting information between parties as a JSON object. They are commonly used for authentication and information exchange.

## multer
 
 -  **npm i multer**
 -  used for file uploading in the server 

## cloudinary
- cloud platform to store files(images,video,pdf) which will provide link in return cantaining our data
