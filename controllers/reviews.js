const Listing=require("../models/listing");
const Review=require("../models/review");


module.exports.createReview=async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    

    newReview.author=req.user._id;
    
    listing.reviews.push(newReview);  // Add the new review's ObjectId to the reviews array
    await newReview.save();
    await listing.save(); // Save the updated listing
    req.flash("success","New Review Created!");
    

    // Step 3: Redirect to the listing's page (the specific listing using the ID)
    res.redirect(`/listings/${req.params.id}`);

}

module.exports.destroyReview=async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);

    req.flash("success","Review Deleted!");

    res.redirect(`/listings/${id}`);
}