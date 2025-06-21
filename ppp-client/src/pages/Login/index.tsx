import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Label } from "@/shadcn/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import userService from "@/api/services/user.service";
import { ToastAction } from "@/shadcn/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { setLocalAuth } from "@/helpers/local-auth";
import { useNavigate } from "react-router-dom";
import { AuthState } from "@/types/User";
import { useDispatch } from "react-redux";
import { setAuth } from "@/redux/slices/auth";


function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const showSuccessToast = () => {
    toast({
      title: "Login Successful",
      description: "Welcome back! You have successfully logged in.",
      variant: "default",
      duration: 3000,
    });
  };

  const showErrorToast = (error: string) => {
    toast({
      variant: "destructive",
      title: "Login Failed",
      description: error || "An error occurred during login. Please try again.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [regno, setRegno] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      const res: {
        success: boolean;
        message: string;
        status: number;
        data: any;
      } = await userService.login(regno, password);
      if (res.success) {
        showSuccessToast();
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
        navigate("/");
      } else showErrorToast(res.message);
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Welcome Back
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Please sign in to continue
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regno">Registration no</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="regno"
                  type="text"
                  placeholder="Enter your registration number"
                  className="pl-10"
                  value={regno}
                  onChange={(e) => setRegno(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-right">
              {/* <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link> */}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Login;
