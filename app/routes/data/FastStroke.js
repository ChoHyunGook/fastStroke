import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import DataService from "../../services/data/DataService.js";
dotenv.config()


const corsOptions = {
    origin : process.env.ORIGIN,
    optionsSuccessStatus : 200
}
const app = express()

app.use(cors({
    origin:true,
    credentials: true
}))
app.use(function(_req, res, next) {
    res.header(
        "Access-Control-Allow-Tabletheaders",
        "x-access-token, Origin, Content-Type, Accept",
        "Access-Control-Allow-Origin", "*"
    );
    next();
});

app.get('/getData',cors(corsOptions),(req,res)=>{
    DataService().getData(req,res)
})
app.get('/getWeekData',cors(corsOptions),(req,res)=>{
    DataService().getWeekData(req,res)
})
app.get('/weekcore',cors(corsOptions),(req,res)=>{
    DataService().weekCores(req,res)
})

app.get('/monthCore',cors(corsOptions),(req,res)=>{
    DataService().monthCore(req,res)
})


export default app
