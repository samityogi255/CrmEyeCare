const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const { authenticateToken } = require('../Middleware/authMiddleware');

// Middleware to parse JSON request bodies
router.use(express.json());

// GET all appointments with patient and doctor information
router.get('/', authenticateToken, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
      },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// GET appointment by ID with patient and doctor information
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: true,
      },
    });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching appointment' });
  }
});

// POST create a new appointment
router.post('/', authenticateToken, async (req, res) => {
  const { date, doctorId, patientId } = req.body;
  try {
    const newDate = new Date(date);
    const today = new Date();
    if (newDate < today) {
      return res.status(400).json({ error: 'You cannot choose a date in the past' });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        date: newDate,
        doctorId: parseInt(doctorId),
        patientId: parseInt(patientId),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ error: 'Error creating appointment' });
  }
});

// PUT update appointment by ID
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date, doctorId, patientId } = req.body;
  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        date: new Date(date),
        doctorId: parseInt(doctorId),
        patientId: parseInt(patientId),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ error: 'Error updating appointment' });
  }
});

// PATCH reschedule appointment by ID
router.patch('/:id/reschedule', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  try {
    const newDate = new Date(date);
    const today = new Date();
    if (newDate < today) {
      return res.status(400).json({ error: 'You cannot choose a date in the past' });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        date: newDate,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ error: 'Error rescheduling appointment' });
  }
});

// DELETE appointment by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting appointment' });
  }
});

module.exports = router;
