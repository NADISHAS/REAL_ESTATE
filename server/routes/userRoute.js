import express from 'express';
import { bookVisit, cancelBooking, createUser, getAllBookings, getallFavourite, toFav } from "../controllers/userCntrl.js";  // Import the functions from the controller

const router = express.Router();

// Register a new user
router.post("/register", createUser);

// Book a visit for a user (pass visit ID in the URL)
router.post("/bookVisit/:id", bookVisit);
router.post("/allBookings", getAllBookings)
router.post("/removeBooking/:id",cancelBooking)
router.post("/toFav/:rid",toFav)
router.post("/allFav/",getallFavourite)
export { router as userRoute };  // Export the router
