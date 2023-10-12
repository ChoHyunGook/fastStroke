import db from '../../DataBase/index.js'
import jwt from "jsonwebtoken";
import applyDotenv from "../../Lambdas/applyDotenv.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";



dotenv.config()



export default function EmailService(){

    const {
        authNum_jwt_secret,
        NODEMAILER_USER, NODEMAILER_PASS,
        NODEMAILER_SERVICE, NODEMAILER_HOST,

    } = applyDotenv(dotenv)

    const User = db.User

    return{
        modifyUserIdEmail(req,res){
            const data = req.body
            User.findOne({userId:req.body.changeUserid},function (err,user) {
                if (err) throw err
                if (!user) {
                    let transporter = nodemailer.createTransport({
                        service: NODEMAILER_SERVICE,
                        host: NODEMAILER_HOST,
                        port: 587,
                        secure: false,
                        auth: {
                            user: NODEMAILER_USER,
                            pass: NODEMAILER_PASS
                        }
                    });

                    let authNum = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");

                    const authNumToken = jwt.sign({
                        userId: data.changeUserid,
                        authNum: authNum
                    }, authNum_jwt_secret, {expiresIn: '5m'})


                    res.cookie("authNumToken", authNumToken, {
                        secure: false,
                        httpOnly: true
                    })

                    transporter.sendMail({
                        from: `SleepCore`,
                        to: req.body.changeUserid,
                        subject: `[SleepCore] ${req.body.emailSubject} 인증번호 서비스 입니다.`,
                        text: `안녕하세요 ${req.body.name} 고객님 아래의 인증번호를 확인하여 이메일 주소 인증을 완료해 주세요.\n 
                        인증번호: ${authNum} \n
                        해당 인증번호는 5분간 유효합니다.`

                    }, function (error, info) {
                        if (error) {
                            console.log(error)
                            res.status(500).json({message: "발송실패!",data:error})
                        }else{
                            res.send('이메일이 전송되었습니다. 인증번호 유효시간은 5분입니다.');
                        }

                    })
                    transporter.close()
                }
                else {
                    res.status(400).send('이미 사용중인 이메일(ID)입니다.')
                }
            })
        }

    }


}