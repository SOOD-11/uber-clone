import React, { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";

const Driverlogout = () => {
  // as we know in backend jwt verify  middleare need to authorize this//

  const navigate = useNavigate();
  useEffect(() => {
    const handleLogout = async () => {
      const AccessToken = Cookie.get("Accesstoken");
      const response = await axiosInstance.post("api/v1/driver/logout", {
        headers: {
          Authorization: `Bearer ${AccessToken}`,
        },
      });
      if (response.status === 201) {
        navigate("/");
      }
    };
    handleLogout();
  }, [navigate]);

  return <div>logout</div>;
};

export default Driverlogout;
