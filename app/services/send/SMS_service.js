import db from '../../DataBase/index.js'
import jwt from 'jsonwebtoken'
import applyDotenv from "../../Lambdas/applyDotenv.js";
import dotenv from "dotenv";
import CryptoJS from 'crypto-js';
import axios from "axios";
import bcrypt from "bcrypt";
import moment from "moment-timezone";


dotenv.config()

export default function SMS_service(){
    const {
        SMS_service_id,SMS_secret_key,SMS_access_key,SMS_PHONE,authNum_jwt_secret
    } = applyDotenv(dotenv)

    const User = db.User

    const date = Date.now().toString()

    const serviceId = SMS_service_id;
    const secretKey = SMS_secret_key;
    const accessKey = SMS_access_key;
    const smsPhone = SMS_PHONE;

    const method = "POST";
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`;
    const url2 = `/sms/v2/services/${serviceId}/messages`;

    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    hmac.update(accessKey);
    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);

    let authNum = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");

    return {
        findInfoSMS(req,res){
            const data =req.body
            console.log(data.name)
            if(data.name !== undefined){
                User.findOne({name:data.name,phone:data.phone})
                    .then(user=>{
                        if(!user){
                            res.status(400).send('가입된 정보가 없습니다.')
                        }else{
                            const user_phone = req.body.phone
                            const phoneNumber = user_phone.split("-").join("");
                            const phoneSubject = req.body.phoneSubject

                            const authNumToken = jwt.sign({
                                authNum: authNum,
                                name:data.name,
                                phone: req.body.phone,
                            }, authNum_jwt_secret, {expiresIn: '3m'})


                            res.cookie("authNumToken", authNumToken, {
                                secure: false,
                                httpOnly: true
                            })

                            axios({
                                method: method,
                                json: true,
                                url: url,
                                headers: {
                                    "Contenc-type": "application/json; charset=utf-8",
                                    "x-ncp-iam-access-key": accessKey,
                                    "x-ncp-apigw-timestamp": date
                                    ,
                                    "x-ncp-apigw-signature-v2": signature,
                                },
                                data: {
                                    type: "SMS",
                                    countryCode: "82",
                                    from: smsPhone,
                                    content: `[FastStroke]\n[${phoneSubject} 서비스]\n인증번호는 [${authNum}] 입니다.`,
                                    messages: [{to: `${phoneNumber}`}],
                                },
                            });
                            console.log(authNum)
                            return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                        }
                    })
            }else{
                User.findOne({userId:data.userId,phone:data.phone})
                    .then(user=>{
                        if(!user){
                            res.status(400).send('가입된 정보가 없습니다.')
                        }else{
                            const user_phone = req.body.phone
                            const phoneNumber = user_phone.split("-").join("");
                            const phoneSubject = req.body.phoneSubject

                            const authNumToken = jwt.sign({
                                authNum: authNum,
                                userId:data.userId,
                                phone: req.body.phone,
                            }, authNum_jwt_secret, {expiresIn: '3m'})


                            res.cookie("authNumToken", authNumToken, {
                                secure: false,
                                httpOnly: true
                            })

                            axios({
                                method: method,
                                json: true,
                                url: url,
                                headers: {
                                    "Contenc-type": "application/json; charset=utf-8",
                                    "x-ncp-iam-access-key": accessKey,
                                    "x-ncp-apigw-timestamp": date
                                    ,
                                    "x-ncp-apigw-signature-v2": signature,
                                },
                                data: {
                                    type: "SMS",
                                    countryCode: "82",
                                    from: smsPhone,
                                    content: `[FastStroke]\n[${phoneSubject} 서비스]\n인증번호는 [${authNum}] 입니다.`,
                                    messages: [{to: `${phoneNumber}`}],
                                },
                            });
                            console.log(authNum)
                            return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                        }
                    })
            }

        },


        RegisterSMS(req,res) {
            const data = req.body

            User.findOne({phone: data.phone}, function (err, user) {

                if (err) throw err
                if (!user) {

                    const user_phone = req.body.phone
                    const phoneNumber = user_phone.split("-").join("");
                    const phoneSubject = req.body.phoneSubject

                    const authNumToken = jwt.sign({
                        authNum: authNum,
                        phone: req.body.phone,
                    }, authNum_jwt_secret, {expiresIn: '3m'})


                    res.cookie("authNumToken", authNumToken, {
                        secure: false,
                        httpOnly: true
                    })

                    axios({
                        method: method,
                        json: true,
                        url: url,
                        headers: {
                            "Contenc-type": "application/json; charset=utf-8",
                            "x-ncp-iam-access-key": accessKey,
                            "x-ncp-apigw-timestamp": date
                            ,
                            "x-ncp-apigw-signature-v2": signature,
                        },
                        data: {
                            type: "SMS",
                            countryCode: "82",
                            from: smsPhone,
                            content: `[FastStroke]\n [${phoneSubject} 서비스]\n 인증번호는 [${authNum}] 입니다.`,
                            messages: [{to: `${phoneNumber}`}],
                        },
                    });

                    return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                } else {
                    res.status(500).send('이미 등록되어있는 핸드폰번호입니다. 이미 가입하셨다면 아이디/비밀번호찾기를 이용해주세요.')
                }
            })


        },

        modifyNameSMS(req,res){
            User.findOne({userId:req.body.userId, phone:req.body.phoneNum},function (err,user) {
                if (err) throw err
                if (!user) {
                    res.status(500).send('등록되어있지 않는 아이디(이메일) 또는 핸드폰 번호입니다. 다시 한번 확인해 주세요.')
                }else{
                    const user_phone = req.body.phoneNum
                    const phoneNumber = user_phone.split("-").join("");
                    const phoneSubject = req.body.phoneSubject
                    const beforeName = req.body.name
                    const AfterName = req.body.changeName

                    const authNumToken = jwt.sign({
                        phone: phoneNumber,
                        name: beforeName,
                        changeName:AfterName,
                        authNum: authNum,
                        userId: req.body.userId,
                    }, authNum_jwt_secret, {expiresIn: '3m'})


                    res.cookie("authNumToken", authNumToken, {
                        secure: false,
                        httpOnly: true
                    })


                    axios({
                        method:method,
                        json:true,
                        url:url,
                        headers: {
                            "Contenc-type": "application/json; charset=utf-8",
                            "x-ncp-iam-access-key": accessKey,
                            "x-ncp-apigw-timestamp": date
                            ,
                            "x-ncp-apigw-signature-v2": signature,
                        },
                        data:{
                            type:"SMS",
                            countryCode: "82",
                            from: smsPhone,
                            content: `[FastStroke]\n [${phoneSubject} 서비스]\n 인증번호는 [${authNum}] 입니다.`,
                            messages: [{ to: `${phoneNumber}` }],
                        },
                    });
                    return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                }
            })
        },
        modifyBirthSMS(req,res){
          const data =req.body
            User.findOne({userId:data.userId,phone:data.phone})
                .then(user=>{
                    if(!user){
                        res.status(400).send('등록되지 않은 아이디 또는 전화번호입니다.')
                    }else{
                        if(user.birth.split('-').join('') === data.birth.split('-').join('')){
                            res.status(400).send('변경하려는 생년월일이 동일합니다.')
                        }else{
                            const open = moment().tz('Asia/Seoul')
                            const today = open.format('YYYY-MM-DD').split('-').join('')

                            if(Number(today) <= Number(data.birth.split('-').join(''))){
                                res.status(400).send('변경하려는 생년월일이 현재 날짜와 동일하거나 높을수 없습니다.')
                            }else{
                                const user_phone = req.body.phone
                                const phoneNumber = user_phone.split("-").join("");
                                const phoneSubject = req.body.phoneSubject
                                const name = req.body.name

                                const authNumToken = jwt.sign({
                                    phone: phoneNumber,
                                    name:name,
                                    birth:data.birth,
                                    authNum: authNum,
                                    userId: data.userId,
                                }, authNum_jwt_secret, {expiresIn: '3m'})


                                res.cookie("authNumToken", authNumToken, {
                                    secure: false,
                                    httpOnly: true
                                })


                                axios({
                                    method:method,
                                    json:true,
                                    url:url,
                                    headers: {
                                        "Contenc-type": "application/json; charset=utf-8",
                                        "x-ncp-iam-access-key": accessKey,
                                        "x-ncp-apigw-timestamp": date
                                        ,
                                        "x-ncp-apigw-signature-v2": signature,
                                    },
                                    data:{
                                        type:"SMS",
                                        countryCode: "82",
                                        from: smsPhone,
                                        content: `[FastStroke]\n [${phoneSubject} 서비스]\n 인증번호는 [${authNum}] 입니다.`,
                                        messages: [{ to: `${phoneNumber}` }],
                                    },
                                });
                                return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                            }
                        }
                    }
                })
        },

        modifyPasswordSMS(req,res){
            const data = req.body

            User.findOne({userId:data.userId, phone:data.phone},function (err,user) {
                if (err) throw err
                if (!user) {
                    res.status(500).send('등록되어있지 않는 아이디(이메일) 또는 핸드폰 번호입니다. 다시 한번 확인해 주세요.')
                }else{
                    const user_phone = req.body.phone
                    const phoneNumber = user_phone.split("-").join("");
                    const phoneSubject = req.body.phoneSubject

                    const beforePw = req.body.password
                    const beforeBcryptPwData = bcrypt.hashSync(beforePw, 10)
                    const beforeInsertPwData = {password: beforeBcryptPwData}

                    const AfterPw = req.body.changePassword
                    const afterBcryptPwData = bcrypt.hashSync(AfterPw, 10)
                    const afterInsertPwData = {password: afterBcryptPwData}


                    const authNumToken = jwt.sign({
                        password: beforeInsertPwData,
                        changePassword:afterInsertPwData,
                        authNum: authNum,
                        userId: req.body.userId,

                    }, authNum_jwt_secret, {expiresIn: '3m'})


                    res.cookie("authNumToken", authNumToken, {
                        secure: false,
                        httpOnly: true
                    })

                    axios({
                        method:method,
                        json:true,
                        url:url,
                        headers: {
                            "Contenc-type": "application/json; charset=utf-8",
                            "x-ncp-iam-access-key": accessKey,
                            "x-ncp-apigw-timestamp": date
                            ,
                            "x-ncp-apigw-signature-v2": signature,
                        },
                        data:{
                            type:"SMS",
                            countryCode: "82",
                            from: smsPhone,
                            content: `[FastStroke]\n [${phoneSubject} 서비스]\n 인증번호는 [${authNum}] 입니다.`,
                            messages: [{ to: `${phoneNumber}` }],
                        },
                    });
                    return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                }
            })
        },

        modifyPhoneSMS(req,res){
            User.findOne({userid:req.body.userid, phone:req.body.phoneNum},function (err,user) {
                if (err) throw err
                if (!user) {

                    res.status(500).send('등록되어있지 않는 아이디(이메일) 또는 핸드폰 번호입니다. 다시 한번 확인해 주세요.')
                }else{

                    const user_phone = req.body.phoneNum
                    const phoneNumber = user_phone.split("-").join("");
                    const phoneSubject = req.body.phoneSubject
                    const beforePhone = req.body.phoneNum
                    const AfterPhone = req.body.phone


                    const authNumToken = jwt.sign({
                        phone: beforePhone,
                        changePhoneNum:AfterPhone,
                        authNum: authNum,
                        userId: req.body.userId,

                    }, authNum_jwt_secret, {expiresIn: '3m'})


                    res.cookie("authNumToken", authNumToken, {
                        secure: false,
                        httpOnly: true
                    })


                    axios({
                        method:method,
                        json:true,
                        url:url,
                        headers: {
                            "Contenc-type": "application/json; charset=utf-8",
                            "x-ncp-iam-access-key": accessKey,
                            "x-ncp-apigw-timestamp": date
                            ,
                            "x-ncp-apigw-signature-v2": signature,
                        },
                        data:{
                            type:"SMS",
                            countryCode: "82",
                            from: smsPhone,
                            content: `[FastStroke]\n [${phoneSubject} 서비스]\n 인증번호는 [${authNum}] 입니다.`,
                            messages: [{ to: `${phoneNumber}` }],
                        },
                    });
                    return res.status(200).send('인증번호가 전송되었습니다. 인증번호 유효시간은 3분입니다.')
                }
            })
        },



    }

}