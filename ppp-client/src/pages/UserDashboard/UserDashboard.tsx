import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { ApiResponse } from "@/types/Api";
import userService from "@/api/services/user.service";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { setDashboardData } from "@/redux/userDash";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DashboardData } from "@/types/dashboard";
import { rootState } from "@/redux/store";
import { PenSquare, Upload } from "lucide-react";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const dashboardData: DashboardData = useSelector(
    (state: rootState) => state.userDash
  );
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (dashboardData.userDetails.name) return;

      try {
        const response: ApiResponse = await userService.getUserDashBoard();
        dispatch(setDashboardData(response.data));
        toast({
          title: response.message,
          description: "Dashboard data loaded successfully",
          variant: "success",
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [dispatch, dashboardData.userDetails.name]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    setUpdating(true);
    try {
      // Update mobile number if provided
      if (mobile) {
        if(mobile.length !== 10) {
          toast({
            title: "Error",
            description: "Mobile number must be 10 digits long",
            variant: "destructive",
          });
          setUpdating(false);
          return;
        }
        await userService.editProfile(mobile);
      }

      // Update avatar if provided
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const response: ApiResponse = await userService.updateAvatar(formData);
        const avatarUrl = response.data;
        dispatch(
          setDashboardData({
            ...dashboardData,
            userDetails: { ...dashboardData.userDetails, avatar: avatarUrl },
          })
        );
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
      setDialogOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setMobile("");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Rest of the data processing code remains the same...
  const recentTestsData =
    dashboardData.recentTests?.map((test) => ({
      name: test.test_name,
      score: (test.score / test.total_score) * 100,
      timestamp: new Date(
        parseInt(test.test_timestamp) * 1000
      ).toLocaleDateString(),
    })) || [];

  const topicAnalysisData =
    dashboardData.topicAnalysis?.map((topic) => ({
      name: topic.topic,
      accuracy: parseFloat(topic.accuracy),
      correct: parseInt(topic.correct_answers),
      incorrect: parseInt(topic.incorrect_answers),
      total: parseInt(topic.total_questions),
    })) || [];

  const statsData = [
    {
      name: "Tests Taken",
      value: parseInt(dashboardData.testStats?.total_tests_taken || "0"),
    },
    {
      name: "Average Score",
      value: parseFloat(dashboardData.testStats?.average_score || "0"),
    },
    {
      name: "Last Test Score",
      value: dashboardData.lastTest
        ? parseFloat(
            (
              (dashboardData.lastTest.score /
                dashboardData.lastTest.total_score) *
              100
            ).toFixed(1)
          )
        : 0,
    },
  ];

  return (
<div className="container mx-auto p-4 space-y-6">
  {/* User Profile Section */}
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Dialog can now be triggered by either the avatar or the edit button */}
        <div className="flex items-center gap-4 flex-1">
          <DialogTrigger asChild>
            <div className="relative cursor-pointer">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={dashboardData.userDetails?.avatar}
                  className="object-cover"
                />
                <AvatarFallback>
                  {dashboardData.userDetails?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md">
                <PenSquare className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </DialogTrigger>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {dashboardData.userDetails?.name}
              </h2>

            </div>
            <p className="text-gray-600">
              Reg No: {dashboardData.userDetails?.regno}
            </p>
            {dashboardData.userDetails?.trade && (
              <p className="text-gray-600">
                Trade: {dashboardData.userDetails.trade}
              </p>
            )}
            {dashboardData.userDetails?.batch && (
              <p className="text-gray-600">
                Batch: {dashboardData.userDetails.batch}
              </p>
            )}
          </div>
        </div>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Avatar Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={avatarPreview || dashboardData.userDetails?.avatar}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {dashboardData.userDetails?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose New Picture
                </Button>
              </div>
            </div>

            {/* Profile Details Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={dashboardData.userDetails?.name}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Registration Number</label>
                <Input
                  value={dashboardData.userDetails?.regno}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trade</label>
                <Input
                  value={dashboardData.userDetails?.trade || ""}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleProfileUpdate}
              disabled={(!mobile && !avatarFile) || updating}
              className="w-full"
            >
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>

  {/* Rest of the component remains the same... */}
  {/* Stats Overview */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {statsData.map((stat, index) => (
      <Card key={index}>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-600">{stat.name}</h3>
          <p className="text-3xl font-bold mt-2">
            {stat.value}
            {stat.name.includes("Score") ? "%" : ""}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>

  {/* Topic Analysis */}
  <Card>
    <CardHeader>
      <CardTitle>Topic Analysis</CardTitle>
    </CardHeader>
    <CardContent className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topicAnalysisData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="correct" fill="#4CAF50" name="Correct Answers" />
          <Bar dataKey="incorrect" fill="#f44336" name="Incorrect Answers" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* Recent Tests Performance */}
  <Card>
    <CardHeader>
      <CardTitle>Recent Tests Performance</CardTitle>
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={recentTestsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-bold">{payload[0].payload.name}</p>
                    <p>Date: {payload[0].payload.timestamp}</p>
                    <p>
                      Score:{" "}
                      {typeof payload[0].value === "number"
                        ? payload[0].value.toFixed(1)
                        : payload[0].value}
                      %
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8884d8"
            name="Score (%)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>
  );
};

export default UserDashboard;
