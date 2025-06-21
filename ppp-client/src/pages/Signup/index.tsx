import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Label } from "@/shadcn/ui/label";
import {  Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { TRADES } from "@/constants";
import userService from "@/api/services/user.service";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");
  const [registration, setRegistration] = useState("");
  const [batch, setBatch] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({length: 4}, (_, i) => currentYear - i);

  const validateForm = () => {
    let isValid = true;
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      isValid = false;
    } else if (password.length < 5) {
      setPasswordError("Password must be at least 5 characters long");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    // Add your signup logic here
    try {
      await  userService.register(name, registration, trade, batch, password);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      navigate('/login');
      
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Create Account
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Sign up using your Registration no
          </p>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Avinash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="trade">Trade</Label>
              <Select value={trade} onValueChange={setTrade} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration">Registration Number</Label>
              <Input
                id="registration"
                type="text"
                placeholder="2331080"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={batch} onValueChange={setBatch} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your batch" />
                </SelectTrigger>
                <SelectContent>
                  {batchYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="axC123@34Ax&"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="axC123@34Ax&"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary hover:underline"
              >
                Sign in
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Signup;
