import React, { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import i1 from "../assets/rendezvous.e688c83c (1).png";
import i2 from "../assets/uber.webp";
import car from "../assets/F1EA8E2E-8646-4214-BA91-9521988C3658_4_5005_c-removebg-preview.png";
import LocationSuggestion from "../components/LocationSearchPanel";
import RideSelectionPanel from "../components/RideSelectionPanel";
import ConfirmedRidePanel from "../components/ConfirmedRidePanel";
import "remixicon/fonts/remixicon.css";
import WaitingForRider from "../components/WaitingForRider";
import DriverFound from "../components/DriverFound";
import axiosInstance from "../utils/axiosInstance";
import { useRideContext } from "../contexts/RIdeFormContext";
import ApiError from "../../../../backend/utilities/ApiError";
import { useSocketContext } from "../contexts/SocketContext";
import { useUserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const panel = useRef(null);
  const downarrow = useRef(null);
  const vehiclepanel = useRef(null);
  const confirmedpanel = useRef(null);
  const waitingdriver = useRef(null);
  const driverfoundref = useRef(null);
  const [activeField, setactiveField] = useState(null);
  const [panelOpen, setpanelOpen] = useState(false);
  const [rideselectionpanel, setrideselectionpanel] = useState(false);
  const [confirmedridepanel, setconfirmedridepanel] = useState(false);
  const [waitingfordriver, setwaitingfordriver] = useState(false);
  const [driverfound, setdriverfound] = useState(false);
  const [pickupsuggestions, setpickupsuggestions] = useState([]);
  const [vehicletype, setVehicletype] = useState("");
  const [destinationsuggestions, setdestinationsuggestions] = useState([]);

  const [fare, setfare] = useState({});
  const navigate = useNavigate();

  // getting  global variables from  RIde form context
  const { user } = useUserContext();
  const { socket, sendMessage, receiveMessage } = useSocketContext();
  const {
    pickup,
    setPickup,
    destination,
    setDestination,
    setRidedetails,
    ridedetails,
  } = useRideContext();

  // ok now letting suggestions getting real time on location search plan
  console.log("faressssss", fare);

  useEffect(() => {
    if (!user) {
      return;
    }
    console.log(user);
    /// as we know in context sendMessage function has sent it into a go
    sendMessage("join", { userType: "User", userId: user?.Users?._id });

    receiveMessage("Ride-Accepted", (data) => {
      console.log("Ride is accepted ", data);
      setRidedetails((prev) => ({
        ...prev,
        ...data,
      }));
    });
    receiveMessage("RIDE-START-OTP-VERIFIED", (data) => {
      console.log("Ride OTP IS VERIFIED ", data);
      setRidedetails((prev) => ({
        ...prev,
        ...data,
      }));

      navigate("/Riding");

      //if(ridedetails.status('pending')){

      //setwaitingfordriver(true);

      //}
      setwaitingfordriver(false);
      setdriverfound(true);
    });
  }, [user]);

  const handlePickupChange = async (e) => {
    setPickup(e.target.value);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/maps/get-suggestions`,
        {
          params: { address: e.target.value },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AccessToken")} `,
          },
        }
      );
      setpickupsuggestions(
        response.data.destinationsuggestions.map((item) => item.fullName)
      );
      console.log("pickupsuggestion", response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDestinationChange = async (e) => {
    setDestination(e.target.value);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/maps/get-suggestions`,
        {
          params: { address: e.target.value },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AccessToken")}`,
          },
        }
      );
      setdestinationsuggestions(
        response.data.destinationsuggestions.map((item) => item.fullName)
      );
      console.log(response.data);
    } catch (error) {
      throw new ApiError(510, error);
    }
  };

  const handleVehicleSelection = async (vehicleType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ride/ride-created`,
        {
          pickup,
          destination,
          vehicleType,
        },
        {
          withCredentials: true,
        }
      );
      setRidedetails(response.data);
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panel.current, {
        height: "70%",
        opacity: "1",
      });
      gsap.to(downarrow.current, {
        opacity: "1",
      });
    } else {
      gsap.to(panel.current, {
        height: "0%",
      });
      gsap.to(downarrow.current, {
        opacity: "0",
      });
    }
  }, [panelOpen]);

  useGSAP(() => {
    if (rideselectionpanel) {
      gsap.to(vehiclepanel.current, {
        y: 0,
      });
      gsap.to(panel.current, {
        height: "0%",
      });
    } else {
      gsap.to(vehiclepanel.current, {
        y: 1000,
      });
    }
  }, [rideselectionpanel]);

  useGSAP(() => {
    if (confirmedridepanel) {
      gsap.to(confirmedpanel.current, {
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.to(confirmedpanel.current, {
        y: "100%",
        duration: 0.5,
        ease: "power2.in",
      });
    }
  }, [confirmedridepanel]);

  useGSAP(() => {
    if (waitingfordriver) {
      gsap.to(waitingdriver.current, {
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.to(waitingdriver.current, {
        y: "100%",
        duration: 0.5,
        ease: "power2.in",
      });
    }
  }, [waitingfordriver]);

  useGSAP(() => {
    if (driverfound) {
      gsap.to(driverfoundref.current, {
        y: 0,
      });
    } else {
      gsap.to(driverfoundref.current, {
        y: "100%",
      });
    }
  }, [driverfound]); // <-- make sure to include dependencies
  const submithandler = async (e) => {
    e.preventDefault();

    try {
      // to get the fare calculated f4rom the backend
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ride/get-fare`,
        {
          params: { pickup, destination },

          headers: {
            Authorization: `Bearer ${localStorage.getItem("AccessToken")} `,
          },
        }
      );
      console.log(response.data);
      setfare(response.data);
      setrideselectionpanel(true);
      setpanelOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen overflow-hidden relative">
      <img
        src={i2}
        alt="logo"
        onClick={() => {
          setrideselectionpanel(true);
        }}
        className="w-16 left-5 top-5 absolute"
      />
      <div
        onClick={() => {
          setrideselectionpanel(false);
        }}
        className="h-screen w-screen "
      >
        <img src={i1} alt="map" className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-col justify-end h-screen absolute top-0 w-full">
        <div className="h-[30%] p-3 bg-white relative">
          <h5
            ref={downarrow}
            className="absolute right-2  opacity-0 top-2 "
            onClick={() => {
              setpanelOpen(false);
            }}
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h2 className="text-4xl flex-item font-semibold mb-2">Find a Trip</h2>

          <form onSubmit={submithandler}>
            <div className="line absolute h-25 w-0.5 top-18 left-7 bg-black"></div>
            <div>
              <input
                type="text"
                onClick={() => {
                  setpanelOpen(true);
                  setactiveField("Pickup");
                }}
                value={pickup}
                onChange={handlePickupChange}
                placeholder="Add a pick up location"
                className="bg-[#eeee] px-6 py-4 text-lg rounded-xl w-full mb-4 mt-3"
              />
            </div>
            <div>
              <input
                type="text"
                onClick={() => {
                  setpanelOpen(true);
                  setactiveField("Destination");
                }}
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Add a Drop off location"
                className="bg-[#eeee] px-6 py-4 text-lg rounded-xl w-full mt-4"
              />
            </div>
          </form>

          <button
            type="submit"
            onClick={submithandler}
            className="w-full text-white bg-black h-auto p-3 mt-2"
          >
            Find A trip
          </button>
        </div>

        {/* Animated Panel */}
        <div ref={panel} className="bg-white h-0 ">
          <LocationSuggestion
            suggestions={
              activeField === "Pickup"
                ? pickupsuggestions
                : destinationsuggestions
            }
            rideselectionpanel={rideselectionpanel}
            setrideselectionpanel={setrideselectionpanel}
            panelOpen={panelOpen}
            setpanelopen={setpanelOpen}
            activeField={activeField}
          ></LocationSuggestion>
        </div>
      </div>
      <div ref={vehiclepanel}>
        <RideSelectionPanel
          vehicletype={vehicletype}
          setVehicletype={setVehicletype}
          confirmedridepanel={confirmedridepanel}
          setconfirmedridepanel={setconfirmedridepanel}
          rideselectionpanel={rideselectionpanel}
          setrideselectionpanel={setrideselectionpanel}
          fare={fare}
          setfare={setfare}
        ></RideSelectionPanel>
      </div>
      <div
        ref={confirmedpanel}
        className=" fixed z-10 px-3 py-6 w-full bottom-0 bg-white"
      >
        <ConfirmedRidePanel
          fare={fare}
          vehicletype={vehicletype}
          waitingfordriver={waitingfordriver}
          handleVehicleSelection={handleVehicleSelection}
          setwaitingfordriver={setwaitingfordriver}
          confirmedridepanel={confirmedridepanel}
          setconfirmedridepanel={setconfirmedridepanel}
        ></ConfirmedRidePanel>
      </div>
      <div
        ref={waitingdriver}
        className=" fixed z-10 px-3 py-6 w-full bottom-0 bg-white"
      >
        <WaitingForRider
          driverfound={driverfound}
          setdriverfound={setdriverfound}
        ></WaitingForRider>
      </div>
      <div
        ref={driverfoundref}
        className=" fixed z-10 px-3 py-6 w-full bottom-0 bg-white"
      >
        <DriverFound
          driverfound={driverfound}
          setdriverfound={setdriverfound}
        ></DriverFound>
      </div>
    </div>
  );
};

export default Home;
