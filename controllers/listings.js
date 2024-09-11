
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index= (async (req,res)=>{
    let search  = req.query.search;
    let allListings = await Listing.find().populate("reviews");
    res.render("listings/index.ejs",{allListings,search});
  });
// module.exports.index = async (req, res) => {
//     try {
//         // Extract the country query parameter
//         const { country } = req.query;
        
//         // Fetch all listings from the database
//         const allListings = await Listing.find({});
        
//         // Log the query parameter and the number of listings fetched
//         console.log("Query Parameter - country:", country);
//         console.log(`Total listings fetched: ${allListings.length}`);
        
//         // Filter listings based on the country parameter
//         const countryListing = country
//             ? allListings.filter((listing) => 
//                 listing.country &&
//                 listing.country.toLowerCase() === country.toLowerCase()
//             )
//             : allListings;
        
//         // Log the number of listings after filtering
//         console.log(`Listings after filtering: ${countryListing.length}`);
        
//         // Check if no listings match the filter criteria
//         if (countryListing.length === 0) {
//             req.flash("error", `No listings available in ${country}`);
//             return res.redirect("/listings");
//         }
        
//         // Render the listings page with filtered data
//         // res.render("listings/index.ejs", { allListings: countryListing });
//     } catch (err) {
//         console.error("Error fetching listings:", err);
//         req.flash("error", "Something went wrong. Please try again later.");
//         res.redirect("/listings");
//     }
// };

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" },
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing you requested for does not exist.");
            return res.redirect("/listings");
        }
console.log(listing); // check in your terminal listing coordinates exists or not?

        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.error("Error fetching listing:", err);
        req.flash("error", "Something went wrong. Please try again later.");
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res) => {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        if (!response.body.features.length) {
            req.flash("error", "Invalid location. Please try again.");
            return res.redirect("/listings/new");
        }

        const url = req.file.path;
        const filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = response.body.features[0].geometry;
        await newListing.save();

        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error creating listing:", err);
        req.flash("error", "Failed to create a new listing. Please try again.");
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing you requested for does not exist.");
            return res.redirect("/listings");
        }

        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } catch (err) {
        console.error("Error rendering edit form:", err);
        req.flash("error", "Something went wrong. Please try again later.");
        res.redirect("/listings");
    }
};

module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        if (req.file) {
            const url = req.file.path;
            const filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error("Error updating listing:", err);
        req.flash("error", "Failed to update the listing. Please try again.");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.destroyListing = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteListing = await Listing.findByIdAndDelete(id);

        if (!deleteListing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error deleting listing:", err);
        req.flash("error", "Failed to delete the listing. Please try again.");
        res.redirect("/listings");
    }
};
