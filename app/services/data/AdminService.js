import db from '../../DataBase/index.js'
import applyDotenv from "../../Lambdas/applyDotenv.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config()




export default function AdminService(){

    const { access_jwt_secret } = applyDotenv(dotenv)

    const User = db.User



    return{
        getData(req,res){
            try {
                User.find({},function (err,user){
                    if(err) throw err
                    if(!user){
                        res.status(400).send('회원유저 정보가 없습니다.')
                    }else{
                        res.status(200).send(user)
                    }
                })

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        create(req,res){
          try {
              const data = req.body
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
                                          .send('신규가입에 성공하였습니다.')
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


          }catch (e){
              if(e.name === 'TokenExpiredError'){
                  res.status(500).send('인증시간이 만료되었습니다.')
              }
          }
        },

        updateOne(req,res){
            try {
                const data =req.body

                User.findOne({userId:data.userId},function (err,user){

                    if(!user){
                        res.status(400).send('유저정보가 없습니다.')
                    }else{

                        if (data.password === 'PlanePassword') {

                            let updateData = {
                                userId: data.userId,
                                name: data.name,
                                birth: data.birth,
                                admin: (data.admin === 'O') ? true : false,
                                phone: data.phone
                            }

                            User.findOneAndUpdate({userId: data.userId}, {$set: updateData}
                                , function (err, users) {
                                    if (err) {
                                        res.status(400).send(err)
                                    } else {
                                        res.status(200).send('Update Success')
                                    }
                                })

                        } else {
                            const pwData = data.password
                            const bcryptPwData = bcrypt.hashSync(pwData, 10)

                            let updateData = {
                                userId: data.userId,
                                name: data.name,
                                birth: data.birth,
                                password: bcryptPwData,
                                admin: (data.admin === 'O') ? true : false,
                                phone: data.phone
                            }

                            User.findOneAndUpdate({userId: data.userId}, {$set: updateData}
                                , function (err, users) {
                                    if (err) {
                                        console.log(err)
                                        res.status(400).send(err)
                                    } else {
                                        res.status(200).send('Update Success')
                                    }
                                })
                        }

                    }
                })


            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },


        find(req,res){
            try {
                const data =req.body
                let search = data.search
                let changeData = search.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`)
                let select = data.selectBox

                if (select !== '') {

                    User.find({}, function (err, all) {
                        let sendData = all.map(findAll => {
                            if (findAll.name === select) {
                                let setDB = {
                                    id: findAll.userId,
                                    name: findAll.name,
                                    phone: findAll.phone,
                                    admin: (findAll.admin === true) ? '0' : 'X'
                                }
                                return setDB
                            }else if(findAll.userId === select){
                                let setDB = {
                                    id: findAll.userId,
                                    name: findAll.name,
                                    phone: findAll.phone,
                                    admin: (findAll.admin === true) ? '0' : 'X'
                                }
                                return setDB
                            }else if(findAll.phone === select){
                                let setDB = {
                                    id: findAll.userId,
                                    name: findAll.name,
                                    phone: findAll.phone,
                                    admin: (findAll.admin === true) ? '0' : 'X'
                                }
                                return setDB
                            }
                        })
                        let delUndefind = sendData.filter((el) => el !== undefined)
                        if (delUndefind.length === 0) {
                            res.status(400).send('일치하는 데이터가 없습니다!')
                        } else {
                            res.status(200).send(sendData.filter((el) => el !== undefined))
                        }
                    })


                }else{
                    User.find({}, function (err, all) {
                        if (search === '') {
                            let setData = all.map(set => {
                                let setDB = {
                                    id: set.userId,
                                    name: set.name,
                                    phone: set.phone,
                                    admin: (set.admin === true) ? '0' : 'X'
                                }
                                return setDB
                            })
                            res.status(200).send(setData)
                        } else {
                            let sendData = all.map(findOne => {
                                if (findOne.name === data.search || findOne.userId === data.search ||
                                    findOne.phone === data.search || findOne.phone === changeData) {

                                    let setData = {
                                        id: findOne.userId,
                                        name: findOne.name,
                                        phone: findOne.phone,
                                        admin: (findOne.admin === true) ? 'O' : 'X'
                                    }

                                    return setData
                                }
                            })
                            let delUndefind = sendData.filter((el) => el !== undefined)

                            if (delUndefind.length === 0) {
                                res.status(400).send('일치하는 데이터가 없습니다!')
                            } else {
                                res.status(200).send(sendData.filter((el) => el !== undefined))
                            }
                        }


                    })
                }

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        delAdminUser(req,res){
            try {
                const data = req.body
                let idMap = data.map(e => e.id)
                let nameMap = data.map(e=>e.name)
                let phoneMap = data.map(e=>e.phone)

                User.deleteMany({userId: idMap, name: nameMap, phone: phoneMap}, function (err) {
                    if (err) {
                        res.status(400).send(err)
                    } else {
                        res.status(200).send('회원탈퇴 성공')
                    }
                })

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        changeStartUp(req,res){
            try {
                const sendData = req.body
                const startUpChange = sendData.StartUpChange
                const data =sendData.selectedData
                const userIds = data.map(e=>e.id)
                let inputData=[]


                User.find({userId:userIds}, function (err,user){

                    user.filter((startUp)=>{
                        let dbs={
                            userId:startUp.userId,
                            start_up:startUpChange
                        }
                        inputData.push(dbs)

                    })

                    User.bulkWrite(inputData.map((item)=>({
                                updateOne: {
                                    filter: {userId: item.userId},
                                    update: {$set:item},
                                    upsert: true
                                }
                            })
                        )
                        ,function (err,updateUser){
                            if(err){
                                res.status(400).send(err)
                            }else {
                                let userName = user.map(e=>e.name)
                                if(startUpChange === true){
                                    res.status(200).send(`${userName} 님이 개통처리 되었습니다.`)
                                }else{
                                    res.status(200).send(`${userName} 님이 개통취소처리 되었습니다.`)
                                }
                            }
                        })
                })


            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },


        changeAdmin(req,res){
            try {
                const sendData = req.body
                const adminChange = sendData.adminChangeData
                const data =sendData.selectedData
                const userIds = data.map(e=>e.id)
                let inputData=[]
                User.find({userId:userIds}, function (err,user){
                    user.filter((admins)=>{
                        let dbs={
                            userId:admins.userId,
                            admin:adminChange
                        }
                        inputData.push(dbs)
                    })
                    User.bulkWrite(inputData.map((item)=>({
                        updateOne: {
                            filter: {userId: item.userId},
                            update: {$set:item},
                            upsert: true
                        }
                    })
                    )
                    ,function (err,updateUser){
                        if(err){
                            res.status(400).send(err)
                        }else {
                            let userName = user.map(e=>e.name)
                            if(adminChange === true){
                                res.status(200).send(`${userName} 님이 관리자로 변경되었습니다.`)
                            }else{
                                res.status(200).send(`${userName} 님이 일반유저로 변경되었습니다.`)
                            }

                        }
                        })
                })

            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }
        },

        excelDownload(req,res){
            try {
                const data =req.body
                let bodyData = [];

                data.filter((names)=>{
                    let sendData = {
                        '아이디':names.id,
                        '성함':names.name,
                        '핸드폰번호':names.phone,
                        '관리자':names.admin,
                        '개통여부':names.start_up
                    }
                    bodyData.push(sendData)
                })
                res.status(200).send(bodyData)
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }

        },

        excelUpload(req,res){
            try {
                const data = req.body;
                let bodyData = [];

                data.filter((names)=>{
                    let sendData = {
                        name:names['성함'],
                        userId:names['아이디'],
                        password: bcrypt.hashSync(names['비밀번호'], 10),
                        phone:names['핸드폰번호'],
                        admin:(names['관리자'] === 'O') ? true:false,
                        start_up:(names['개통여부'] === 'O') ? true:false
                    }
                    bodyData.push(sendData)
                })

                User.bulkWrite(
                    bodyData.map((item)=>
                        ({
                            updateOne:{
                                filter:{userId:item.userId},
                                update:{$set:item},
                                upsert: true
                            }
                        })
                    ),function (err,user){
                        if(err){
                            res.status(400).send(err)
                        }else{
                            res.status(200).send('신규등록 및 업데이트 완료!')
                        }
                    })
            }catch (e){
                if(e.name === 'TokenExpiredError'){
                    res.status(500).send('인증시간이 만료되었습니다.')
                }
            }

        },





    }
}