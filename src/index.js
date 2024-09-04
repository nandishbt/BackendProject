import dotenv from 'dotenv'     //we do this in package.json file
dotenv.config({
    path: './.env'              //we need to config .env bcz it is needed as eearly as possible is used in project
})

import { app } from './app.js';
import mongodb from './Db/index.js';

const port = process.env.PORT || 8000;

mongodb()
  .then(() => {
    app.listen(port, () => {
      console.log(`app listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('index', err);
  });


