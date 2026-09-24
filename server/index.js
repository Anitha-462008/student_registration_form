require('dotenv').config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
const port = process.env.PORT || 5000

const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, trim: true },
  dob: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  address: { type: String, required: true, trim: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  arrears: { type: String, required: true },
  companies: { type: [String], required: true, validate: (value) => value.length === 4 },
}, { timestamps: true })

const Registration = mongoose.model('Registration', registrationSchema)

app.use(cors())
app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'connecting' })
})

app.get('/api/registrations', async (request, response) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean()
    response.json(registrations.map(({ _id, ...registration }) => ({ ...registration, id: _id.toString() })))
  } catch (error) {
    console.error('Failed to load registrations:', error)
    response.status(500).json({ message: 'Failed to load registrations.' })
  }
})

app.post('/api/registrations', async (request, response) => {
  try {
    const { companies } = request.body || {}
    if (!Array.isArray(companies) || companies.length !== 4 || companies.some((company) => typeof company !== 'string' || !company.trim())) {
      return response.status(400).json({ message: 'Please choose four companies.' })
    }

    const registration = await Registration.create(request.body)
    const { _id, ...savedRegistration } = registration.toObject()
    response.status(201).json({ ...savedRegistration, id: _id.toString() })
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return response.status(400).json({ message: 'Please provide all registration fields and four companies.' })
    }
    console.error('Failed to save registration:', error)
    response.status(500).json({ message: 'Failed to save registration.' })
  }
})

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from server/.env')
  }

  await mongoose.connect(process.env.MONGO_URI)
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log('Connected to MongoDB')
  })
}

startServer().catch((error) => {
  console.error('Unable to connect to MongoDB:', error.message)
  process.exit(1)
})
