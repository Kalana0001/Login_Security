import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignUp from './components/SignUp/SignUp';
import SignIn from './components/SignIn/SignIn';
import Home from './components/Home/Home';
import LandingPage from './components/LandingPage/LandingPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {
  return (
    <div className="App">
        <BrowserRouter>
        <ToastContainer position="top-center" style={{marginTop: "70px"}}/>
            <main>
              <Routes>
              <Route path='/' element={<LandingPage/>}/>
                <Route path='/signup' element={<SignUp/>}/>
                <Route path="/signin" element={<SignIn/>}/>
                <Route path="/home" element={<Home/>}/>
              </Routes>
            </main>
        </BrowserRouter>
    </div>
  );
}

export default App;
