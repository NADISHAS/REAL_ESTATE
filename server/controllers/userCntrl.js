import asyncHandler from 'express-async-handler';
import { prisma } from '../config/prismaConfig.js'; // Correct import of prisma

export const createUser = asyncHandler(async (req, res) => {
    console.log("creating a user");

    let { email } = req.body;
        const userExists = await prisma.user.findUnique({where: {email: email}})
        if(!userExists) {
            const user = await prisma.user.create({data: req.body });
            res.send({
                message: "User registered successfully",
                user: user,
            });
        }
        else res.status(201).send({message: "User already registered"});

});

export const bookVisit = asyncHandler(async (req, res) => {
    const { email, date } = req.body;  // Get email and date from the request body
    const { id } = req.params;          // Residency ID passed as URL parameter

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { bookedVisits: true },
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has already booked the visit
        const visitExists = user.bookedVisits.some((visit) => visit.id === id);
        if (visitExists) {
            return res.status(400).json({ message: "This residency is already booked by you" });
        }

        // Convert the provided date string in MM/DD/YYYY format to a Date object
        const [month, day, year] = date.split("-").map(num => parseInt(num)); // Split the string and convert to numbers
        const formattedDate = new Date(year, month - 1, day);  // JavaScript months are 0-indexed

        // Check if the date is valid
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format, please use MM/DD/YYYY" });
        }

        // Create the booking object with both `id` and `date`
        const newBooking = { id, date: formattedDate };  // Store `id` and `date`

        // Add the new visit to the `bookedVisits` array
        await prisma.user.update({
            where: { email },
            data: {
                bookedVisits: {
                    set: [...user.bookedVisits, newBooking],  // Update the array with the new booking
                },
            },
        });

        res.send("Your visit is booked successfully");
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ message: `Server error: ${err.message}` });  // Include error details
    }
});

export const getAllBookings = asyncHandler(async(req, res) => {
    const {email} = req.body
    try{
        const bookings = await prisma.user.findUnique({
            where: {email},
            select: {bookedVisits: true}
        })
        res.status(200).send(bookings)
    }catch(err){
        throw new Error(err.message);
    }
})

export const cancelBooking = asyncHandler(async (req, res) =>{
    
    const {email}= req.body;
    const {id}= req.params
    try{

        const user = await prisma.user.findUnique({
            where: {email: email},
            select: {bookedVisits: true}
        })

        const index = user.bookedVisits.findIndex((visit)=> visit.id === id)

        if(index === -1){
            res.status(404).json({message: "Booking not found"})
        }
        else{
            user.bookedVisits.splice(index,1)
        }
    }catch(err){
        throw new Error(err.message);
    }
})