const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { fileURLToPath } = require("url");

const { register } = require("./controllers/auth.js");
const { createPost } = require("./controllers/posts.js");

const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/users.js");
const postRoutes = require("./routes/posts.js");

// const User = require("./models/User.js");
// const Post = require("./models/Post.js");

// const { users, posts } = require("./data/index.js");

import { verifyToken } from "./middleware/auth.js";

//==========CONFIGURATIONS======
const __filename = fileURLToPath(import.meta.url); // to grab the file url , this only when we use type modules
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));//used to set the directory for assets , here it for images to store locally(am not using here S3 bucket)


//==========FILE STORAGE========
//Returns a StorageEngine implementation configured to store files on the local file system.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage }); //using upload variable I am going to upload images

//=======ROUTES WITH FILES=========
//this is the API while user hit register from front end and this is the midleware responsible for"upload.single("picture")" uploading picture in locally
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

//========ROUTES=======
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

//=========MONGOOSE SETUP===
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    
    //===ADD DATA FOR ONE TIME===
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((err) => console.log(`${err} did not connect`));

