const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const app = express();

//Express will have knowledge that it's sitting behind a proxy and that the X-Forwarded-* header fields may be trusted, that's why we use trust proxy.
app.set("trust proxy", 1);

// Enable cors
app.use(cors());

// Set static folder
app.use(express.static("public"));

// Routes
app.use("/api/v1/weather", require("./routes/weather"));
app.use("/api/v1/location", require("./routes/location"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
