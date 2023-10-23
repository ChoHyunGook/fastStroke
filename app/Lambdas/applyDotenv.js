

const applyDotenv = dotenv => {
    dotenv.config()
    return{
        port:process.env.PORT,
        origin:process.env.ORIGIN,
        mongoUri:process.env.MONGO_URI,
        DB_NAME:process.env.DB_NAME,
        SMS_service_id:process.env.SMS_SERVICE_API_ID,
        SMS_secret_key:process.env.SMS_API_SECRET_KEY,
        SMS_access_key:process.env.SMS_API_ACCESS_KEY,
        SMS_PHONE:process.env.SMS_PHONE_NUM,
        access_jwt_secret:process.env.access_jwt_secret,
        NODEMAILER_SERVICE:process.env.NODEMAILER_SERVICE,
        NODEMAILER_HOST:process.env.NODEMAILER_HOST,
        NODEMAILER_USER:process.env.NODEMAILER_USER,
        NODEMAILER_PASS:process.env.NODEMAILER_PASS,
        authNum_jwt_secret:process.env.authNum_jwt_secret,
        AUTH_INFO_SECRET:process.env.AUTH_INFO_SECRET,
        AUTH_LOGIN_SECRET:process.env.AUTH_LOGIN_SECRET,
        AUTHID:process.env.AUTHID,
        AUTHPW:process.env.AUTHPW,
        AWS_SECRET:process.env.AWS_SECRET,
        AWS_ACCESS:process.env.AWS_ACCESS,
        AWS_REGION:process.env.AWS_REGION,
        AWS_BUCKET_NAME:process.env.AWS_BUCKET_NAME,
    }
}

export default applyDotenv