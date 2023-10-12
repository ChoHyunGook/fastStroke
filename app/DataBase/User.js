import bcrypt from 'bcrypt'

//회원가입 로그인(암호화적용되어있음)
export default function User(mongoose){
    const userSchema = new mongoose.Schema({
        name: {type:String, required: true, min:2},
        userId: {type:String, unique: true, required: true, min:10},
        birth:{type:String,required:true,trim:true},
        password: {type:String, required: true, trim: true},
        phone: {type:String, unique: true, required:true, min:13},
        admin: {type:Boolean, required:true},
        start_up: {type:Boolean, required:true}
    },{ versionKey : false });

    userSchema.pre('save', function (next){
        const user = this;
        const saltRounds = 10
        if(user.isModified('password')){
            bcrypt.genSalt(saltRounds,function (err,salt){
                if(err) return next(err)
                bcrypt.hash(user.password, salt, function (err, hash){
                    if(err) return next(err)
                    user.password = hash
                    next();
                });
            });
        }else {
            next()
        }
    });


    userSchema.methods.comparePassword = function (plainPassword, cb) {
        bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
            if (err) {
                return cb(err)
            } else {
                return cb(null, isMatch);
            }
        })
    };


    return mongoose.model('User', userSchema)
}