import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
import { Home, File, Pen } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { rootState } from "@/redux/store";
import { AuthState } from "@/types/User";
import { LogOut, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeLocalAuth } from "@/helpers/local-auth";
import { logout } from "@/redux/slices/auth";
import { useNavigate } from "react-router-dom";
import { Trophy, Lock, Key } from "lucide-react";

const links = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Question",
    href: "/admin/questions",
    icon: File,
    admin: true,
  },
  {
    title: "Aptitudes",
    href: "/admin/aptitudes",
    icon: Pen,
    admin: true,
  },
  {
    title: "Aptitudes",
    href: "/aptitudes",
    icon: Pen,
    admin: false,
  },
  {
    title: "Achievers",
    href: "/hall-of-fame",
    icon: Trophy,
    admin: false,
  },
  {
    title: "Achievers",
    href: "/hall-of-fame",
    icon: Trophy,
    admin: true,
  },
  {
    title: "JSPRS",
    href: "/jsprs",
    icon: User,
    admin: false,
  },
  {
    title: "SPRS",
    href: "/sprs",
    icon: User,
    admin: true,
  },
  // {
  //   title: "Change Password",
  //   href: "/change-password",
  //   icon: Key,
  //   admin: false
  // },
  // {
  //   title: "Change Password",
  //   href: "/change-password",
  //   icon: Key,
  //   admin: true
  // }
];

export function NavLinks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    removeLocalAuth();
    dispatch(logout());
    navigate("/login");
  };

  const auth: AuthState = useSelector((state: rootState) => state.auth);
  return (
    <>
      {auth.isAuthenticated && (
        <Link to="/user/dashboard" className={cn("nav-link")}>
          <Button variant="ghost" className="w-full justify-start">
            <User size={14} className="mr-2 inline" />
            Profile
          </Button>
        </Link>
      )}
      {links.map((link) =>
        link.admin && auth?.isAdmin ? (
          <Link to={link.href} key={link.title} className={cn("nav-link")}>
            <Button variant="ghost" className="w-full justify-start">
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
            </Button>
          </Link>
        ) : (
          !link.admin &&
          auth.isAuthenticated &&
          !auth?.isAdmin && (
            <Link to={link.href} key={link.title} className={cn("nav-link")}>
              <Button variant="ghost" className="w-full justify-start">
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
              </Button>
            </Link>
          )
        )
      )}
      {
        auth.isAuthenticated && (auth.isAdmin || auth.isJspr) && (
          <Link to="/admin/blocked-users" className={cn("nav-link")}>
          <Button variant="ghost" className="w-full justify-start">
            <Lock size={14} className="mr-2 inline" />
            Blocked Users
          </Button>
        </Link>
        )
      }
      {auth.isAuthenticated && (
        <>
          <Link to="/change-password" className={cn("nav-link")}>
            <Button variant="ghost" className="w-full justify-start">
              <Key size={14} className="mr-2 inline" />
              Change Password
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              handleLogout();
            }}
          >
            <LogOut size={14} className="mr-2 inline" />
            Logout
          </Button>
        </>
      )}
    </>
  );
}
