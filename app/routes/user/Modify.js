import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import ModifyService from "../../services/user/modifyService.js";
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

app.post('/modifyName',cors(corsOptions),(req,res)=>{
    ModifyService().modifyName(req,res)
})

app.post('/modifyUserId',cors(corsOptions),(req,res)=>{
    ModifyService().modifyUserId(req,res)
})

app.post('/modifyPassword',cors(corsOptions),(req,res)=>{
    ModifyService().modifyPassword(req,res)
})

app.post('/modifyPhone',cors(corsOptions),(req,res)=>{
    ModifyService().modifyPhone(req,res)
})

app.post('/deleteUser',cors(corsOptions),(req,res)=>{
    ModifyService().deleteUser(req,res)
})
app.post('/modifyBirth',cors(corsOptions),(req,res)=>{
    ModifyService().modifyBirth(req,res)
})

export default app