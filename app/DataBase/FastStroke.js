
export default function FastStroke(mongoose){
    const strokeSchema = new mongoose.Schema({
        userId: {type:String, required: true, min:10},
        date:{type:String, required: true},
        age:{type:Number, required:true},
        stuttering:{type:Number, required: true},
        numerical:{type:Number, required: true},
        pronunciation:{type:Number, required: true},
    },{ versionKey : false })

    return mongoose.model('FastStroke', strokeSchema)
}