import express from 'express';
import { bookVisit, createUser, getAllBookings } from "../controllers/userCntrl.js";  // Import the functions from the controller

const router = express.Router();

// Register a new user
router.post("/register", createUser);

// Book a visit for a user (pass visit ID in the URL)
router.post("/bookVisit/:id", bookVisit);
router.post("/allBookings", getAllBookings)

export { router as userRoute };  // Export the router
