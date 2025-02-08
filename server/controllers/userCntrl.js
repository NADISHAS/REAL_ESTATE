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

        // Convert the provided date string in DD-MM-YYYY format to a Date object
        const [day, month, year] = date.split("-").map(num => parseInt(num)); // Split the string and convert to numbers
        const formattedDate = new Date(year, month - 1, day);  // JavaScript months are 0-indexed

        // Check if the date is valid
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format, please use DD-MM-YYYY" });
        }

        // Format the date in "DD-MM-YYYY" before saving
        const formattedDateString = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;

        // Create the booking object with both `id` and `formattedDateString`
        const newBooking = { id, date: formattedDateString };  // Store `id` and formatted date

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
            await prisma.user.update({
                where: {email},
                data: {
                    bookedVisits: user.bookedVisits
                }
            })
            res.send("Booking cancelled successfully")
        }
    }catch(err){
        throw new Error(err.message);
    }
})

export const toFav = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const { rid } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.favResidenciesID.includes(rid)) {
            // Remove from favorites
            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    favResidenciesID: {
                        set: user.favResidenciesID.filter((id) => id !== rid),  // Remove the residency
                    },
                },
            });
            res.send({ message: "Removed from favorites", user: updatedUser });
        } else {
            // Add to favorites
            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    favResidenciesID: {
                        push: rid,  // Add the residency to the array
                    },
                },
            });
            res.send({ message: "Updated favorites", user: updatedUser });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});


export const getallFavourite = asyncHandler(async(req, res)=> {
    const {email} = req.body;
    try{
        const favResd = await prisma.user.findUnique({
            where: {email},
            select: {favResidenciesID: true}
        })
        res.status(200).send(favResd)
    }
    catch(err){
        throw new Error(err.message);
    }
})