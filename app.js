const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../major project/models/listing.js");
const Review = require("../major project/models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const data = require("./init/data");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
//database
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("hi,im root");
});

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
   
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});

    res.render("listings/index.ejs", { allListings });
}));

//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//Create route
app.post("/listings",
    validateListing, 
    wrapAsync(async (req, res, next) => {
   
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));

//edit route 
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    if (req.body.listing) {
        throw new ExpressError("400", "Send valid data for listing!")
    }
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete route 
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("deleted listing");
    res.redirect("/listings");
}));

//reviews
app.post("/listings/:id/reviews",async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);  // Add the new review's ObjectId to the reviews array
    await newReview.save();
    await listing.save() ; // Save the updated listing
    console.log("new review saved");
   
    // Step 3: Redirect to the listing's page (the specific listing using the ID)
    res.redirect(`/listings/${req.params.id}`);

})


// app.get("/testListing",async(req,res)=>{
//     let sampleListing= new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:"calangute,goa",
//         country:"india"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesful testing");

// })

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });

})



app.listen(8080, () => {
    console.log("server is listening to port 8080");
});


