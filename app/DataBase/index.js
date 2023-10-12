import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "./User.js";
import FastStrokeModel from "./FastStroke.js";


const db = {}
db.mongoose = mongoose
db.url = dotenv.MONGO_URI
db.User=new UserModel(mongoose)
db.Stroke=new FastStrokeModel(mongoose)



export default db
