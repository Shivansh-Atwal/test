import React, { useState } from "react";
import { useSelector } from "react-redux";
import userService from "@/api/services/user.service";
import { AuthState } from "@/types/User";
import { rootState } from "@/redux/store";
import { Card, CardHeader, CardContent } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Alert, AlertDescription } from "@/shadcn/ui/alert";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChangePasswordProps {
  regno: string;
  oldPassword: string;
  newPassword: string;
}

const ChangePassword = () => {
  const [changePassword, setChangePassword] = useState<ChangePasswordProps>({
    regno: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { toast } = useToast();

  const auth: AuthState = useSelector((state: rootState) => state.auth);
  const isAdmin = auth.isAdmin;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangePassword({
      ...changePassword,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const togglePasswordVisibility = (field: "old" | "new") => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const validateForm = () => {
    if(!isAdmin ) changePassword.regno = auth?.user?.regno || "";
    if (!changePassword.regno.trim()) {
      setError("Registration number is required");
      return false;
    }
    if (!isAdmin && !changePassword.oldPassword.trim()) {
      setError("Old password is required");
      return false;
    }
    if (!changePassword.newPassword.trim()) {
      setError("New password is required");
      return false;
    }
    if (changePassword.newPassword.length < 5) {
      setError("New password must be at least 5 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    if (!isAdmin) {
      setChangePassword({
        ...changePassword,
        regno: auth?.user?.regno || "",
      });
    }

    try {
      await userService.changePassword(
        changePassword.regno,
        changePassword.oldPassword,
        changePassword.newPassword
      );
      setSuccess("Password changed successfully!");
      setChangePassword({
        regno: "",
        oldPassword: "",
        newPassword: "",
      });
      toast({
        variant: "success",
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      setError(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Change Password</h1>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin && (
              <div className="space-y-2">
                <label htmlFor="regno" className="text-sm font-medium">
                  Registration Number
                </label>
                <Input
                  id="regno"
                  name="regno"
                  value={changePassword.regno}
                  onChange={handleChange}
                  placeholder="Enter registration number"
                  className="w-full"
                />
              </div>
            )}

            {!isAdmin && (
              <div className="space-y-2">
                <label htmlFor="oldPassword" className="text-sm font-medium">
                  Old Password
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type={showPassword.old ? "text" : "password"}
                    value={changePassword.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter old password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("old")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.old ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={changePassword.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword.new ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
