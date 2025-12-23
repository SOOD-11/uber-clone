import { Server } from "socket.io";
// import user and driver kmodel to assign the socket id and to assign them in the database
import { User } from "./models/User.models.js";
import { Driver } from "./models/Driver.model.js";

let io;
const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {


            origin: "http://localhost:5173",// your frontend URL
            methods: ["GET", "POST"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {
        console.log('client connected :', socket.id);
        // create an event  like join to send the data between the sockets 
        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'User') {
                console.log("user of id", userId, "of type", userType);
                await User.findByIdAndUpdate(userId, {
                    socketId: socket.id

                })
            } else if (userType === 'Driver') {
                // slecting the usertype and assigning the socket id and sacving them in db to get realtime socket connection
                console.log("user of id", userId, "of type", userType);
                await Driver.findByIdAndUpdate(userId, {

                    socketId: socket.id

                })
            }
        })


        /// method to find the  real time location of the captain using socket  and keep on storing in the databse 
        socket.on('update-captain-location', async (data) => {
            const { userId, location } = data;
            console.log(location);
            // validation to check data 

            if (!userId || !location || !location.lng || !location.ltd) {

                return socket.emit('error', { message: " invalid location  of captain" });


            }
            await Driver.findByIdAndUpdate(

                userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng


                }


            }


            )

        });





        socket.on('disconnect', () => {

            console.log(" Client disconnected :", socket.id)



        })


    })

}


function sendMessageToSocketId(socketId, messageobject) {
    
    if (io) {
        io.to(socketId).emit(messageobject.event, messageobject.newRequest);


    } else {

        console.log('Socket.io not initalized');
    }



}




export { initializeSocket, sendMessageToSocketId };

