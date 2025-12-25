import express from "express";
import cors from "cors";
import connectToDatabase from "./db/DatabaseConnet.js";
import dotenv from "dotenv";
import { configDotenv } from "dotenv";
import userrouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import DriverRoute from "./routes/driver.route.js";
import Maproute from "./routes/map.route.js";
import rideRoute  from "./routes/ride.route.js";
const app=express();
configDotenv();
const allowedOrigins = [
  'https://uber-clone-zeta-lilac.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(cookieParser());
connectToDatabase();

app.get('/', (req,res)=>{
  res.send("hello world i am on the top");  
})
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1/user",userrouter);
app.use("/api/v1/driver",DriverRoute);
app.use("/api/v1/maps",Maproute);
app.use("/api/v1/ride",rideRoute);
export default app;

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2ZlYWU1ZTc0ZTI4Nzc5Njg1ODE2OGMiLCJyb2xlIjoiVXNlciIsImlhdCI6MTc1NDkyNzYyMywiZXhwIjoxNzU1MDE0MDIzfQ.GfAPMMioyEvpV3oxWmBkSFp6coDvQGO9c8JJF_QtOJE