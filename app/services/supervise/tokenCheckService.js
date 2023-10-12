import db from '../../DataBase/index.js'
import applyDotenv from "../../Lambdas/applyDotenv.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import e from "express";
dotenv.config()


export default function TokenCheckService(){

    const { access_jwt_secret, AUTH_INFO_SECRET, AUTH_LOGIN_SECRET, AUTHID ,AUTHPW }=applyDotenv(dotenv)

    const User = db.User

    return{
        termsAgreeCheck(req,res){
            const token = req.cookies.termsToken
            jwt.verify(token,access_jwt_secret,(err)=>{
                if(err){
                    res.status(400).send('약관동의가 필요합니다')
                }else {
                    res.status(200).send('Success')
                }
            })

        },

        tokenDelete(req,res){
            res.clearCookie('termsToken')
            res.clearCookie('authInfoToken')
            res.status(200).send('Token Deleted')
        },

        LoginCheck(req,res){
            try {
                const token = req.cookies.accessToken
                const verify = jwt.verify(token,access_jwt_secret)
                jwt.verify(token,access_jwt_secret,(err)=>{
                    if(err){
                        res.status(400).send(err)
                    }else{
                        User.findOne({userId:verify.userId},function (err,user){
                            if(err) throw(err)
                            res.status(200).send(user.admin)
                        })
                    }
                })
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },


        accessTokenData(req,res){
            try {
                const token =req.cookies.accessToken
                const verify = jwt.verify(token,access_jwt_secret)

                User.findOne({userId:verify.userId},function (err,user){
                    if(err) throw(err)
                    res.status(200).send(user)
                })

            }   catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        authInfoToken(req,res){
            try {
                const token =req.cookies.accessToken
                const verify = jwt.verify(token, access_jwt_secret)
                const pw = req.body.password

                User.findOne({userId:verify.userId},function (err,user){
                    if(err) throw err
                    user.comparePassword(pw,function (_err,isMatch){
                        if(!isMatch){
                            res.status(400).send('비밀번호를 다시 한번 확인해주세요.')
                        }else {
                            const authInfoToken = jwt.sign({
                                userId:user.userId,
                                name:user.name,
                                authInfo:'Ok'
                            },AUTH_INFO_SECRET)

                            res.cookie('authInfoToken',authInfoToken,{
                                secure: false,
                                httpOnly: true
                            })
                            res.status(200).send('Success')
                        }
                    })
                })

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        authInfoCheck(req,res){
            try {
                const token =req.cookies.authInfoToken
                const verify = jwt.verify(token, AUTH_INFO_SECRET)
                if(verify.authInfo === 'Ok'){
                    User.findOne({userId:verify.userId},function (err,user){
                        if(err) throw(err)
                        res.status(200).send(user)
                    })
                }else{
                    res.status(400).send('잘못된 접근입니다.')
                }

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        authLogin(req,res){

            if(req.body.authId === AUTHID){
                if(req.body.password === AUTHPW){

                    const authLoginToken = jwt.sign({
                        authSign:'BlaubitAdminOK'
                    },AUTH_LOGIN_SECRET,{expiresIn:'180m'})

                    res.cookie('authLoginToken',authLoginToken,{
                        secure: false,
                        httpOnly: true
                    })

                    res.status(200).send('관리자 로그인 성공')
                }else {
                    res.status(400).send('관리자 비밀번호 불일치')
                }
            }else{
                res.status(400).send('관리자 아이디 불일치')
            }
        },
        authLoginCheck(req,res){
            try {
                const token = req.cookies.authLoginToken
                jwt.verify(token, AUTH_LOGIN_SECRET,(err)=>{
                    if(err){
                        res.status(400).send('관리자로그인 X')
                    }else {
                        res.status(200).send('authLoginOk')
                    }
                })
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('관리자 인증시간이 만료되었습니다.')
                }
            }
        }

    }

}