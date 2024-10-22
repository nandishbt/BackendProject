import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
  cors({
    //telling the  express server that it can get request from specified origins
    origin: process.env.CORS,
    credentials: true
  })
);

app.use(express.json({ limit: '16kb' })); //tell express server that it can receive request in json format

app.use(express.urlencoded({ extended: true, limit: '16kb' })); //tell express server that it can receive request in urlencodedformat

app.use(express.static('public')); //used to store images,pdfs and some other date in this folder in our server

app.use(cookieParser()); //server  can be able to access & set cookies from user brower , server can perform crud operations from that cookies


//import routes

import userRoute from './routes/user.route.js'
import commentRoute from './routes/comment.route.js'
import videoRoute from './routes/video.route.js'
import dashboardRoute from './routes/dashboard.route.js'
import healthRoute from './routes/healthcheck.route.js'
import likeRoute from './routes/like.route.js'
import playlistRoute from './routes/playlist.route.js'
 
//middleware routes
app.use('/api/healthcheck',healthRoute)
app.use('/api/users', userRoute);
app.use('/api/comment',commentRoute);
app.use('/api/video', videoRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/likes',likeRoute)
app.use('/api/playlist',playlistRoute)






const port = process.env.PORT || 8000;

export { app };
