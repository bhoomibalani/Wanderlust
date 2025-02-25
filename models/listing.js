const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema =new Schema({
    title:{
        type:String,
        required:true,
        },
    description:String,
    image:{
        type:String,
        default:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fcaptainfi.com%2Funsplash-images-review%2F&psig=AOvVaw3sdrApua10srHZOYIh0Q9t&ust=1740078231170000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPD429-20IsDFQAAAAAdAAAAABAE",
        set:(v)=> v===""?"https://www.google.com/url?sa=i&url=https%3A%2F%2Fcaptainfi.com%2Funsplash-images-review%2F&psig=AOvVaw3sdrApua10srHZOYIh0Q9t&ust=1740078231170000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCPD429-20IsDFQAAAAAdAAAAABAE":v,
        },
    price:Number,
    location:String,
    country:String,
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;