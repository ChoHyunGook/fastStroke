import db from '../../DataBase/index.js'
import applyDotenv from "../../Lambdas/applyDotenv.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config()


export default function ModifyService(){

    const { authNum_jwt_secret, access_jwt_secret }=applyDotenv(dotenv)

    const User = db.User

    return{
        modifyName(req,res){
            try {
                const data = req.body
                const tokenData = req.cookies.authNumToken
                const verify = jwt.verify(tokenData, authNum_jwt_secret)

                if(verify.authNum===data.authNum){
                    if(verify.changeName === data.name){
                        if(verify.name === data.name){
                            res.status(400).send('기존 이름과 변경하려는 이름이 동일합니다. 다시한번 확인해주세요.')
                        }else{
                            User.findOneAndUpdate({userId: data.userId}, {$set: data},
                                function (err, newData) {
                                    if (err) {
                                        res.status(400).send(err)
                                    } else {

                                        const accessToken = jwt.sign({
                                            userId:data.userId,
                                            name:data.name,
                                            phone:data.phone
                                        },access_jwt_secret,{expiresIn:'1h'})

                                        res.cookie('accessToken',accessToken,{
                                            secure: false,
                                            httpOnly: true
                                        })

                                        res.status(200).clearCookie('authNumToken', '').json({data: newData, message: '수정 성공'})
                                    }
                                })
                        }
                    }else{
                        res.status(400).send('인증 시 변경요청하신 성함과 현재 요청하신 성함이 동일하지 않습니다. 입력창을 확인해 주세요.')
                    }
                }else {
                    res.status(400).send('인증번호가 일치하지 않습니다.')
                }

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        modifyBirth(req,res){
            try{
                const data = req.body
                const token = req.cookies.authNumToken
                const tokenData = jwt.verify(token, authNum_jwt_secret)

                if(data.authNum !== tokenData.authNum){
                    res.status(400).send('인증번호 불일치')
                }else{
                    User.findOneAndUpdate({userId:data.userId,name:data.name,phone:data.phone},{$set: data})
                        .then(user=>{
                            const accessToken = jwt.sign({
                                userId:user.userId,
                                birth:user.birth,
                                name:user.name,
                                phone:user.phone,
                                admin:user.admin,
                                startUp:user.start_up
                            },access_jwt_secret,{expiresIn:'1h'})
                            res.cookie('accessToken',accessToken,{
                                secure: false,
                                httpOnly: true
                            })
                            res.status(200).send(user)
                        })
                }
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        modifyUserId(req,res){
            try {
                const data = req.body
                const token = req.cookies.authNumToken
                const tokenData = jwt.verify(token, authNum_jwt_secret)
                const beforeId = data.userId
                const afterId = data.changeUserid
                const ChangeId = {userId: afterId}

                User.findOne({userId:req.body.changeUserid},function (err,user) {
                    if (err) throw err
                    if (!user) {
                        if (tokenData.authNum === data.signNum) {
                            if(tokenData.userId === data.changeUserid){
                                User.findOneAndUpdate(beforeId, {$set: ChangeId}, {upsert: true}, function (err) {
                                    if (err) {
                                        return res.status(400).send(err)
                                    } else {
                                        const accessToken = jwt.sign({
                                            userId:data.changeUserid,
                                            name:data.name,
                                            phone:data.phone
                                        },access_jwt_secret,{expiresIn:'1h'})

                                        res.cookie('accessToken',accessToken,{
                                            secure: false,
                                            httpOnly: true
                                        })

                                        res.status(200).clearCookie('authNumToken', '').send('아이디가 변경되었습니다.')
                                    }
                                })
                            }else{
                                res.status(400).send('인증받은 이메일과 다른 이메일이 변경요청되었습니다. 입력칸을 다시 한번 확인해주세요.')
                            }

                        } else {
                            res.send(400).send('인증번호가 틀립니다. 다시한번 확인해주세요.')
                        }
                    } else {
                        res.status(400).send('이미 사용중인 이메일(ID)입니다.')
                    }
                })
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        modifyPassword(req,res){
            try {
                const data = req.body
                const userIdData = data.userId
                const pwData = data.password
                const bcryptPwData = bcrypt.hashSync(pwData, 10)
                const insertPwData = {password: bcryptPwData}
                const token = req.cookies.authNumToken
                const verify = jwt.verify(token, authNum_jwt_secret)

                if(verify.authNum === data.authNum){
                    if(verify.password === bcryptPwData){
                        res.status(400).send('기존에 등록되어있는 비밀번호와 변경하려는 비밀번호가 똑같습니다.')
                    }else{
                        User.findOne({userId:req.body.userId},function (err,user){
                            if (err) throw err
                            if(!user){
                                res.status(400).send('해당 ID가 존재하지 않습니다.')
                            }else {
                                user.comparePassword(data.confirmPassword,function (_err,isMatch){
                                    if(!isMatch){
                                        res
                                            .status(401)
                                            .send('기존 비밀번호를 다시 한번 확인해주세요.');
                                    }else {
                                        User.findOneAndUpdate(userIdData, {$set: insertPwData}, {upsert: true}, function (err) {
                                            if (err) {
                                                return res.status(400).send(err)
                                            } else {
                                                res.status(200).clearCookie('authNumToken', '').send('비밀번호가 변경되었습니다.')
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }else{
                    res.status(400).send('인증번호가 일치하지 않습니다.')
                }
            } catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        modifyPhone(req,res){
            try {
                const data = req.body
                const tokenData = req.cookies.authNumToken
                const verify = jwt.verify(tokenData, authNum_jwt_secret)
                if(verify.authNum === data.authNum){
                    if(verify.changePhoneNum === data.changePhoneNum){
                        if(verify.phone === data.changePhoneNum){
                            res.status(400).send('기존 등록된 전화번호와 변경하려는 전화번호가 동일합니다. 다시 한번 확인해주세요.')
                        }else{
                            User.findOneAndUpdate({userId: data.userId}, {$set: data},
                                function (err, newData) {
                                    if (err) {
                                        res.status(400).send(err)
                                    } else {
                                        const accessToken = jwt.sign({
                                            userId:data.userId,
                                            name:data.name,
                                            phone:data.changePhoneNum
                                        },access_jwt_secret,{expiresIn:'1h'})

                                        res.cookie('accessToken',accessToken,{
                                            secure: false,
                                            httpOnly: true
                                        })
                                        res.status(200).clearCookie('authNumToken', '').json({data: newData, message: '수정 성공'})
                                    }
                                })
                        }
                    }else{
                        res.status(400).send('인증 시 변경요청하신 전화번호와 현재 요청하신 전화번호가 동일하지 않습니다. 입력창을 다시한번 확인해 주세요.')
                    }
                }else{
                    res.status(400).send('인증번호가 일치하지 않습니다.')
                }

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        deleteUser(req,res){
            try {
                const data = req.body
                const userIdData = data.userId
                const phoneData = data.phone
                const nameData = data.name
                const passwordData = data.password

                        User.findOne({userId:userIdData},function (err,user){
                            if (err) throw err
                            if(!user){
                                res.status(400).send('해당 ID가 존재하지 않습니다.')
                            }else {
                                user.comparePassword(passwordData, function (_err,isMatch){
                                    if(!isMatch){
                                        res
                                            .status(401)
                                            .send('비밀번호가 틀렸습니다.');
                                    }else {
                                        User.deleteMany({userId:userIdData,phone:phoneData,name:nameData}
                                            ,function (err){
                                                if(err){
                                                    res.status(400).send('일치하는 회원이 없습니다.')
                                                }else{
                                                    res.status(200).send('[SleepCore] 회원탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.')
                                                }
                                            })
                                    }
                                })
                            }
                        })


            }catch (e) {
                if (e.name === 'TokenExpiredError') {
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },
    }
}