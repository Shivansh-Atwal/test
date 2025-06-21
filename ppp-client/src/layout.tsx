import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { Toaster } from "./shadcn/ui/toaster";
import { useEffect } from "react";
import userService from "./api/services/user.service";
import { getLocalAuth, setLocalAuth } from "./helpers/local-auth";
import { AuthState } from "./types/User";
import { useDispatch } from "react-redux";
import { setAuth } from "./redux/slices/auth";
import { useLocation } from "react-router-dom";
import ProgressBar from "./components/RouteLoder/ProgressBar";
import { useFullscreen } from './contexts/FullScreenContext';

function Layout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
   const { isInFullscreen } = useFullscreen();
  const currentPath = location.pathname;
  console.log(currentPath);
  useEffect(() => {
    if(currentPath === "/login" || currentPath === "/register" || currentPath === "/forgot-password" || currentPath.includes("/aptitude/appear/")) return;
    if(sessionStorage.getItem("authState") === null && localStorage.getItem("authState") === null) navigate('login');
    else if (sessionStorage.getItem("authState") === null && localStorage.getItem("authState") != null) {
      userService.verifySession().then((res: any) => {
        console.log(res.status);
        if (res.status == 200) {
          let authState: AuthState = {
            isAuthenticated: true,
            isAdmin: res.data.role == "admin",
            isJspr: res.data.role == "jspr",
            accessToken: res.data.access_token,
            user: {
              regno: res.data.regno,
              name: res.data.name,
              trade: res.data.trade,
              batch: res.data.batch,
            },
          };
          setLocalAuth(authState);
          dispatch(setAuth(authState));
        } else {
          navigate("/login");
        }
      }).catch((err) => {
        console.log(err);
        navigate("/login");
      });
    }
    else if(sessionStorage.getItem("authState") != null && localStorage.getItem("authState") != null) {
      let authState: AuthState = getLocalAuth();
      dispatch(setAuth(authState));
    }
   
    
  }, [currentPath]);
  return (
    <div className="dark:bg-slate-800">
      {!isInFullscreen && (
        <nav className="navbar">
          <Header/>
        </nav>
      )}
      <ProgressBar/>
      <Outlet />
      <Toaster />
      <Footer />
    </div>
  );
}

export default Layout;
