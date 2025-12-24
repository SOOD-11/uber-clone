import axios from 'axios';
import Cookies from 'js-cookie';  // Make sure you install 'js-cookie' library

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
  withCredentials: true  // Keep this for sending cookies with every request
});
console.log(import.meta.env.VITE_BASE_URL);
console.log(axiosInstance.baseURL);
// Request Interceptor - Add Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('AccessToken');  // Get access token from cookies
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Refresh Token on Expired Access Token //
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = Cookies.get('RefreshToken');  // Get refresh token from cookies
    const accessToken = Cookies.get('AccessToken');   // Get access token from cookies

    // If no token exists, just reject — don't refresh
    if (!accessToken || !refreshToken) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post('/refreshtoken', {
          Refreshtoken: refreshToken,
        }, { withCredentials: true });

        // Update the new AccessToken in the cookies
        Cookies.set('AccessToken', res.data.accessToken);

        // Retry the original request with the new access token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token expired or failed');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;