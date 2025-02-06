import asyncHandler from 'express-async-handler';
import { prisma } from '../config/prismaConfig.js';

// Create residency
export const createResidency = asyncHandler(async (req, res) => {
  const { title, description, price, address, country, city, facilities, image, userEmail } = req.body.data;

  console.log(req.body.data);

  try {
    // Check if the user exists
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If user doesn't exist, create the user
    if (!user) {
      user = await prisma.user.create({
        data: { email: userEmail },
      });
    }

    // Create the residency and connect it to the user
    const residency = await prisma.residency.create({
      data: {
        title,
        description,
        price,
        address,
        country,
        city,
        facilities,
        image,
        owner: { connect: { email: userEmail } },
      },
    });

    res.send({ message: 'Residency created successfully', residency });
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(400).send({ message: 'A residency with this address already exists' });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
});

// Get all residencies
export const getAllResidencies = asyncHandler(async (req, res) => {
  try {
    const residencies = await prisma.residency.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).send(residencies);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get specific residency by ID
export const getResidency = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    try {
      // Ensure the ID is treated as a string
      const residency = await prisma.residency.findUnique({
        where: { id: String(id) },  // Convert id to string
      });
  
      if (!residency) {
        return res.status(404).send({ message: 'Residency not found' });
      }
  
      res.status(200).send(residency);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  });
  