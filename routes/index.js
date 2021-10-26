const express = require('express')
const router = express.Router()
const needle = require('needle')
const apicache = require('apicache')
const rateLimit = require('express-rate-limit')

// Rate limiting route
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Mins
    max: 100,
    handler: function (req, res,) {
        return res.status(429).json({
            error: 'You sent too many requests. Please wait a while then try again'
        })
    }
})

router.use(limiter)

// Env vars
const API_BASE_URL = process.env.API_BASE_URL
const API_KEY_NAME = process.env.API_KEY_NAME
const API_KEY_VALUE = process.env.API_KEY_VALUE

// Init cache
let cache = apicache.middleware

router.get('/', cache('2 minutes'), async (req, res, next) => {
    try {

        const params = new URLSearchParams({
            [API_KEY_NAME]: API_KEY_VALUE,
            'units': 'metric',
            ...req.query,
        })

        const apiRes = await needle('get', `${API_BASE_URL}?${params}`)
        const data = apiRes.body

        // Log the request if we are on development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log(`REQUEST: ${API_BASE_URL}?${params}`)
        }

        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
})

module.exports = router