import { BrowserRouter as Router} from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import './App.css';
import Video from './components/Video';
import Home from './components/Home';
import Credentials from './components/Credentials';
import Agora from './components/Agora';
import Login from './components/Login';
import Signup from './components/Signup';
import SignupInfo from './components/SignupInfo';
import Payment from './components/Payment';
import Success from './components/Success';
import Cancel from './components/Cancel';


const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/video/', element: <Credentials /> },
    { path:'/video/:room', element: <Video /> },
    { path:'/agora', element: <Agora /> },
    { path:'/login',element:<Login/>},
    { path:'/signup',element:<Signup/>},
    { path: '/signup/information', element: <SignupInfo/> },
    { path: '/user/payment', element: <Payment/> },
    { path: '/user/payment/success', element: <Success/> },
    {path:'/user/payment/cancel',element:<Cancel/>}
  ]);
  return routes;
};

function App() {
  return (
    <>
      <Router>
          <AppRoutes />
      </Router>
    </> 
  );
}

export default App;
