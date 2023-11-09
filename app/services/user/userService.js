import db from '../../DataBase/index.js'
import applyDotenv from "../../Lambdas/applyDotenv.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import moment from "moment-timezone";
dotenv.config()

export default function UserService(){

    const { access_jwt_secret,authNum_jwt_secret }=applyDotenv(dotenv)

    const User = db.User


    return{
        register(req,res){
            try{
                const data = req.body
                const tokenData = req.cookies.authNumToken
                const verify = jwt.verify(tokenData, authNum_jwt_secret)

                if (verify.authNum !== data.authNum) {
                    res.status(400).send('인증번호가 일치하지 않습니다.')
                } else {
                    if (verify.phone !== data.phone) {
                        res.status(400).send('인증받으신 핸드폰번호와 입력하신 핸드폰번호가 일치하지 않습니다.')
                    } else {
                        User.findOne({userId: req.body.userId}, function (err, user) {
                            if (err) throw err
                            if (!user) {
                                User.findOne({phone: req.body.phone}, function (err, user) {
                                    if (err) throw err
                                    if (!user) {
                                        new User(data).save((err) => {
                                            if (err) {
                                                res.status(500).send(err)
                                            } else {
                                                res.status(200)
                                                    .clearCookie('termsToken', '')
                                                    .json({message: '회원가입 성공.', data: User})
                                            }
                                        })
                                    } else {
                                        return res.status(500).send('이미 사용중인 전화번호입니다. 다시 한번 확인해주세요!')
                                    }
                                })
                            } else {
                                return res.status(500).send('이미 사용중인 이메일 주소입니다 다시 한번 확인해 주세요!')
                            }
                        })
                    }
                }
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }

        },

        registerAgree(req,res){

              const data =req.body
              const terms = data.termsConditions

              const termsToken = jwt.sign({
                  terms:terms
              },access_jwt_secret)

              res.cookie('termsToken',termsToken,{
                  secure:false,
                  httpOnly:true
              })

              res.status(200).send('약관에 동의하셨습니다.')


        },

        login(req,res){
          User.findOne({
              userId:req.body.userId
          },function (err,user) {
              if(err) throw err
              if(!user){
                  res.status(400).send('해당 ID로 가입된 정보가 존재하지 않습니다.')
              }else {
                  user.comparePassword(req.body.password,function (_err, isMatch){
                      if(!isMatch){
                          res.status(400).send('비밀번호를 다시 한번 확인해주세요.')
                      }else{
                          try{
                              let time = moment().tz('Asia/Seoul')
                              let day = time.format('YYYY-MM-DD hh:mm:ss')
                              let ex = moment(day).add(1,'hours').format('YYYY-MM-DD kk:mm:ss')

                              const accessToken = jwt.sign({
                                  userId:user.userId,
                                  birth:user.birth,
                                  name:user.name,
                                  phone:user.phone,
                                  admin:user.admin,
                                  startUp:user.start_up,
                                  expiresDate:ex
                              },access_jwt_secret,{expiresIn:'1h'})

                              res.cookie('accessToken',accessToken,{
                                  secure: false,
                                  httpOnly: true
                              })
                              let sendData = {
                                  userId:user.userId,
                                  birth:user.birth,
                                  name:user.name,
                                  phone:user.phone,
                                  admin:user.admin,
                                  startUp:user.start_up,
                                  expiresDate:ex
                              }

                              res.status(200).clearCookie('termsToken')
                                  .send(sendData)


                          }catch (err){
                              res.status(400).send(err)
                          }
                      }
                  })
              }
          })

        },

        logout(req,res){
            try {
                res.clearCookie('accessToken')
                res.clearCookie('authLoginToken')
                res.status(200).json({message: "logout success"})
            } catch (err) {
                res.status(400).json(err)
            }
        },

        findId(req,res){
            try{
                const data = req.body
                const tokenData = req.cookies.authNumToken
                const verify = jwt.verify(tokenData, authNum_jwt_secret)
                if(data.authNum !== verify.authNum){
                    res.status(400).send('인증번호가 불일치 합니다.')
                }else{
                    User.findOne({name:data.name,phone:data.phone})
                        .then(findData=>{
                            res.status(200).send(findData.userId)
                        })
                }
            }catch (e) {
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }


        },

        findPw(req,res){
            try{
                const data = req.body
                const tokenData = req.cookies.authNumToken
                const verify = jwt.verify(tokenData, authNum_jwt_secret)
                if(data.authNum !== verify.authNum){
                    res.status(400).send('인증번호가 불일치 합니다.')
                }else{
                    res.status(200).send('인증번호 일치')
                }
            }catch (e) {
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }

        },

        changeFindPw(req,res){
            const data = req.body
            const userIdData = {userId:data.userId}
            const bcryptPwData = bcrypt.hashSync(data.password, 10)
            const insertPwData = {password: bcryptPwData}
            User.findOneAndUpdate(userIdData,{$set:insertPwData},{upsert:true})
                .then(user=>{
                    res.status(200).clearCookie('authNumToken', '').send('비밀번호 변경완료')
                })
        }



    }
}