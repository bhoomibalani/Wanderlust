const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    verified:{
        type:Boolean,
        default:false
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);