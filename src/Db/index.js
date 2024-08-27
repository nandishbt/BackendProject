import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const mongodb = async () => {
  try {
    const res = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("connected to MongoDB");
    console.log(res.connections[0].host);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default mongodb;
