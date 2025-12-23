import express from "express";
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import cors from "cors";
import { initializeSocket } from "./socket.js";
const port= process.env.PORT || 3000
const server= http.createServer(app);
const io = initializeSocket(server);
server.listen(port, ()=>{

console.log("successfully connected to port ",port);


});