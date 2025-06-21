import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Label } from "@/shadcn/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import userService from "@/api/services/user.service";
import { useNavigate } from "react-router-dom";

const ForgotPass = () => {
  const [regno, setRegno] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);



  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (newPassword.length < 5) {
      setPasswordError("Password must be at least 5 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      await userService.sendOTP(regno);
      setOtpSent(true); 
      toast({
        title: "Success",
        description: "OTP sent to your College Mail",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
    }
    finally{
      setIsLoading(false);
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsLoading(true);
    try {
      await userService.resetPassword(regno, otp, newPassword);
      toast({
        title: "Success",
        description: "Password reset successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Reset Password
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Enter your Registration number to reset password
          </p>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regno">Registration no</Label>
              <Input
                id="regno"
                type="text"
                placeholder="Enter regno eg. 2331080"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
                disabled={otpSent}
                required
              />
            </div>

            {otpSent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Time remaining: {Math.floor(timer / 60)}:
                    {(timer % 60).toString().padStart(2, "0")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {!otpSent ? (
              <Button
                type="button"
                className="w-full"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || timer === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            )}

            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPass;
