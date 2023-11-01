import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import SMS_service from "../../services/send/SMS_service.js";
import EmailService from "../../services/send/EmailService.js";


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

app.post('/findInfoSMS',cors(corsOptions),(req,res)=>{
    SMS_service().findInfoSMS(req,res)
})

app.post('/modifyBirthSMS',cors(corsOptions),(req,res)=>{
    SMS_service().modifyBirthSMS(req,res)
})

app.post('/sendRegisterSMS',cors(corsOptions), (req,res)=>{
    SMS_service().RegisterSMS(req,res)
})

app.post('/modifyNameSMS',cors(corsOptions),(req,res)=>{
    SMS_service().modifyNameSMS(req,res)
})

app.post('/modifyPasswordSMS',cors(corsOptions),(req,res)=>{
    SMS_service().modifyPasswordSMS(req,res)
})

app.post('/modifyPhoneSMS',cors(corsOptions),(req,res)=>{
    SMS_service().modifyPhoneSMS(req,res)
})

app.post('/modifyUserIdEmail',cors(corsOptions),(req,res)=>{
    EmailService().modifyUserIdEmail(req,res)
})
app.post('/customer/service',cors(corsOptions),(req,res)=>{
    EmailService().customerService(req,res)
})


export default app
