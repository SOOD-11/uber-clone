import { Ride } from "../models/Ride.model.js";
import ApiError from "../utilities/ApiError.js";
import { validationResult } from "express-validator";
import asynchandler from "../utilities/asynchandler.js";
import { getAddressCordinate, getDistanceandTime } from "./map.controller.js";
import { User } from "../models/User.models.js";
import { body } from "express-validator";
import crypto from "crypto";
import { Driver } from "../models/Driver.model.js";
import { sendMessageToSocketId } from "../socket.js";
// calculate fare  with base price+ priceperkm+ pricepermin and
// creating the ride in databse means saving pickup , destination, fare charge in db  on basis of vehicle type
// need to make riode request and driver have to accept it and changes the  status of ride from pending to accepted  and worl long all the status o
// when driver comes to pickup location change that state to  accepted, confirmed
// generate an otp
const getOtp = async (num) => {
  const digits = "0123456789";
  let otp = "";
  const bytes = crypto.randomBytes(num);

  for (let i = 0; i < num; i++) {
    otp = otp + digits[bytes[i] % 10];
  }
  return otp;
};
const getfare = async (pickup, destination) => {
  if (!pickup) {
    throw new ApiError(421, " Pickup address not found");
  }
  if (!destination) {
    throw new ApiError(421, "dropoff address not found");
  }
  const distancetime = await getDistanceandTime(pickup, destination);

  const baseFare = {
    Auto: 20,
    Bike: 30,
    Car: 50,
  };
  const perKmRate = {
    Auto: 10,
    Bike: 20,
    Car: 40,
  };
  const perMinRate = {
    Auto: 2,
    Bike: 5,
    Car: 10,
  };
  const fare = {
    Auto: Math.round(
      baseFare.Auto +
        distancetime.distanceInkm * perKmRate.Auto +
        distancetime.durationInMin * perMinRate.Auto
    ),
    Bike: Math.round(
      baseFare.Bike +
        distancetime.distanceInkm * perKmRate.Bike +
        distancetime.durationInMin * perMinRate.Bike
    ),
    Car: Math.round(
      baseFare.Car +
        distancetime.distanceInkm * perKmRate.Car +
        distancetime.durationInMin * perMinRate.Car
    ),
  };
  return fare;
};
//
const createride = async ({ User, pickup, destination, vehicleType }) => {
  if (!pickup || !destination || !vehicleType) {
    throw new ApiError(421, "All fields are required");
  }
  console.log("Starting get fare t0 create a ride");
  const Fare = await getfare(pickup, destination);
  console.log(" fare reached", Fare);

  console.log("Starting  to save  ride in dbs");
  const ride = await Ride.create({
    User,
    pickup,
    destination,

    fare: Fare[vehicleType],
  });
  console.log("✅ Ride created:", ride);
  return ride;
};

const getCaptainsIntheRadius = async (ltd, lng, radius) => {
  // fetch those captains which are around the radius  to give them ride request notification
  const captains = await Driver.find({
    location: {
      $geoWithin: {
        $centerSphere: [[ltd, lng], radius / 3963.2],
      },
    },
  });
  if (!captains) {
    throw new ApiError(421, " no nearby driver found");
  }

  console.log(captains);
  return captains;
};

const StartRideonOtpVerification = async ({ rideId, otp }) => {
  const ride = await Ride.findById(rideId).populate("User").populate("driver");

  if (!ride) {
    throw new ApiError(" invalid rideId");
  }

  if (ride.status !== "accepted") {
    throw new ApiError(" ride status not accepted by the driver");
  }

  if (ride.Otp.trim() === otp.trim()) {
    await Ride.findByIdAndUpdate(rideId, {
      status: "ongoing",
    });
  } else {
    throw new ApiError(431, "Incorrect Otp  ");
  }

  return ride;
};
const acceptRide = async (rideId, driverId) => {
  if (!rideId) {
    throw new ApiError(421, "invalid ride Id");
  }

  const otp = await getOtp(4);

  await Ride.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "accepted",
      driver: driverId,
      Otp: otp,
    }
  );
  const ride = await Ride.findOne({
    _id: rideId,
  })
    .populate("User", "-refreshToken -password")
    .populate("driver", "-refreshToken -password");

  return ride;
};
const Rides = asynchandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  User._id;
  try {
    const User = req.user;
    const { pickup, destination, vehicleType } = req.body;
    const createRide = await createride({
      User,
      pickup,
      destination,
      vehicleType,
    });

    res.status(200).json({ createRide });

    const pickupaddress = await getAddressCordinate(pickup);
    console.log("coordinates of pickup address", pickupaddress);
    let getCaptainsnear = [];
    try {
      getCaptainsnear = await getCaptainsIntheRadius(
        pickupaddress[1],
        pickupaddress[0],
        200
      );
      console.log("get all nearby captains", getCaptainsnear);
    } catch (error) {
      console.log(error);
    }

    // it will check the Ride model  via id  of created ride  and  will fill the detaisl of the user
    const ridewithuser = await Ride.findById(createRide?._id).populate({
      path: "User",
      select: "-RefreshToken -password -email",
    });

    // sending notification to nearby drivers

    getCaptainsnear.map((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",

        newRequest: ridewithuser,
      });

      console.log(getCaptainsnear);
    });
  } catch (error) {}
});

// well for rideselctionpanel we need to only give fare data sop need to make a controller for that toooo
const getFares = asynchandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;
  const getFaress = await getfare(pickup, destination);

  return res.status(201).json(getFaress);
});
const acceptride = asynchandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, driverId } = req.body;
  const AcceptedRide = await acceptRide(rideId, driverId);
  // now send the accepted ride to socketid to user

  sendMessageToSocketId(AcceptedRide?.User?.socketId, {
    event: "Ride-Accepted",
    newRequest: AcceptedRide,
  });

  return res.status(201).json(AcceptedRide);
});

const startRide = asynchandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.body;

  const StartRide = await StartRideonOtpVerification({ rideId, otp });

  sendMessageToSocketId(StartRide.User.socketId, {
    event: "RIDE-START-OTP-VERIFIED",
    data: StartRide,
  });

  return res.status(201).json({ StartRide });
});
export { getfare, createride, Rides, getFares, acceptride, startRide };
