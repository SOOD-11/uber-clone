
import React from 'react'
import { Route, Router, Routes } from 'react-router-dom';
import Start from './pages/Start';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import CaptainLogin from './pages/CaptainLogin';
import CaptainSignup from './pages/CaptainSignup';
import Home from './pages/Home';
import ProtectedRoutesWrapper from './pages/ProtectedRoutesWrapper';
import Logout from './pages/logout';
import Captain_home from './pages/Captain_home';
import Riding from './pages/Riding';
import  GoingForPickup  from './components/CaptainComponents/GoingForPickup';
import ConfirmRidePanel from './pages/ConfirmRidePanel';
import GoingToDropLocation from './pages/GoingToDropLocation';
import EndRide  from './pages/EndRide';
const App = () => {
  return (


  <Routes>
    <Route path='/' element={<Start></Start>}></Route>
    <Route path='/Signup' element={<UserSignup/>}></Route>
    <Route path='/login' element={<UserLogin/>}></Route>
    <Route path='/Driver-Signup' element={<CaptainSignup/>}></Route>
    <Route path='/Driver-login' element={<CaptainLogin/>}></Route>
    <Route path='/Riding' element={<Riding/>}></Route>
        <Route path='/pickup' element={<GoingForPickup/>}></Route>
          <Route path='/confirm-pickup' element={<ConfirmRidePanel/>}></Route>
          <Route path='/GoingtoDrop' element={<GoingToDropLocation/>}></Route>
           <Route path='/RideDrop' element={<EndRide/>}></Route>
    <Route path='/home' element={
    <ProtectedRoutesWrapper >
    <Home/>
    </ProtectedRoutesWrapper>}
    /><Route path='/logout' element={
      <ProtectedRoutesWrapper >
      <Logout/>
      </ProtectedRoutesWrapper>}
      />
    
      <Route path='/captain-home' element={
        <ProtectedRoutesWrapper >
          <Captain_home>

          </Captain_home>
          </ProtectedRoutesWrapper>
        }></Route>
    
    </Routes>

  )
}


 export default App;