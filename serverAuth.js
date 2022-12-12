import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from 'crypto';
import bcrypt from 'bcrypt-nodejs';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

const authenticateUser = async (req, res, next) => {
  const user = await User.findOne({accessToken: req.header('Authorization')})
  if(user){
    req.user = user;
    next();
  } else {
    res.status(401).json({loggedOut: true});
  }
}

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const User = mongoose.model('User', {
  name:{
    type: String,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  accessToken:{
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})


// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post('/tweets', authenticateUser);
app.post('/tweets', async (req, res) =>{
  //happens after next()
})

app.post('/sessions', async (req, res) => {
  const user = await User.findOne({name: req.body.name});
  if(user && bcrypt.compareSync(req.body.password, user.password)){
    res.status(200).json({userId: user._id, accessToken: user.accessToken});
  } else{
    res.status(401).json({notFound: true})
  };
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

/* console.log(crypto.randomBytes(128).toString('hex')) */
/* console.log(bcrypt.hashSync("foobar")); */