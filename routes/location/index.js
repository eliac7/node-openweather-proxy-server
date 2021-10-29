const express = require("express");
const router = express.Router();
const needle = require("needle");
const apicache = require("apicache");

// Env vars
const API_BASE_URL = process.env.API_BASE_URL_LOCATION;
const API_KEY_NAME = process.env.API_KEY_NAME_LOCATION;
const API_KEY_VALUE = process.env.API_KEY_VALUE_LOCATION;

// Init caching for location
let cache = apicache.middleware;

router.get("/", cache("2 minutes"), async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      pretty: 1,
      no_annotations: 1,
      ...req.query,
    });

    const apiRes = await needle("get", `${API_BASE_URL}?${params}`);
    const data = apiRes.body;

    // Log the request if we are on development mode
    if (process.env.NODE_ENV !== "production") {
      console.log(`REQUEST: ${API_BASE_URL}?${params}`);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
