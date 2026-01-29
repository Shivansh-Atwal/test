import React, { useState, FormEvent } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/shadcn/ui/toast";
import { User, Loader2, Trophy, Target, Clock, Edit, RefreshCw } from "lucide-react";
import dsaService from "@/api/services/dsa.service";
import { DsaSheet } from "@/types/Dsa";

interface LeetCodeProfile {
  username: string;
  profile: {
    realName: string;
    reputation: number;
    ranking: number;
  };
}

interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking: number;
  reputation: number;
}

interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
  runtime?: string;
  memory?: string;
}

interface CompleteLeetCodeData {
  profile: LeetCodeProfile;
  statistics: LeetCodeStats;
  recentSubmissions: LeetCodeSubmission[];
}

const DsaSheetPage = () => {
  const { toast } = useToast();
  
  const showSuccessToast = () => {
    toast({
      title: "Profile Loaded Successfully",
      description: "Your LeetCode profile data has been fetched successfully!",
      variant: "default",
      duration: 3000,
    });
  };

  const showErrorToast = (error: string) => {
    toast({
      variant: "destructive",
      title: "Failed to Load Profile",
      description: error || "An error occurred while fetching your profile.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const [leetcodeUsername, setLeetcodeUsername] = useState<string>("");
  const [profileData, setProfileData] = useState<CompleteLeetCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUsernameSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      
      // Client-side validation using the service
      const validation = dsaService.validateUsername(leetcodeUsername);
      if (!validation.valid) {
        showErrorToast(validation.message || "Invalid username format");
        return;
      }

      setIsLoading(true);
      
      // Use the service to fetch profile data
      const res = await dsaService.getLeetCodeProfile(leetcodeUsername.trim());
      
      if (res.success) {
        setProfileData(res.data);
        setSubmitted(true);
        showSuccessToast();
      } else {
        showErrorToast(res.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showErrorToast((error as Error).message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUsername = () => {
    setSubmitted(false);
    setProfileData(null);
    setLeetcodeUsername("");
  };

  const handleRefreshProfile = async () => {
    if (!profileData?.profile.username) return;
    
    try {
      setIsLoading(true);
      const res = await dsaService.getLeetCodeProfile(profileData.profile.username);
      
      if (res.success) {
        setProfileData(res.data);
        toast({
          title: "Profile Refreshed",
          description: "Your profile data has been updated successfully!",
          variant: "default",
        });
      } else {
        showErrorToast(res.message);
      }
    } catch (error) {
      showErrorToast("Failed to refresh profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    total, 
    icon: Icon, 
    color = "text-blue-600",
    bgColor = "bg-blue-50 dark:bg-blue-900/20" 
  }: {
    title: string;
    value: number;
    total?: number;
    icon: any;
    color?: string;
    bgColor?: string;
  }) => (
    <div className={`p-4 ${bgColor} rounded-lg border`}>
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {total ? `${value}/${total}` : value}
        </p>
        {total && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`}
              style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );

  // Render form if username is not submitted
  if (!submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              DSA Practice Sheet
            </h1>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Enter your LeetCode username to get started
            </p>
          </CardHeader>
          <form onSubmit={handleUsernameSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">LeetCode Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your LeetCode username"
                    className="pl-10"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Make sure your LeetCode profile is public
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Profile...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Once the username is submitted and profile is fetched, render the DSA sheet page
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  DSA Practice Sheet
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Welcome, <span className="font-semibold">{profileData?.profile.username}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleEditUsername}>
                  <Edit className="h-4 w-4 mr-2" />
                  Change User
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {profileData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Details */}
              <Card className="shadow-lg">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Profile Details
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {profileData.profile.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Real Name</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {profileData.profile.profile.realName || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Global Ranking</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {profileData.profile.profile.ranking ? `#${profileData.profile.profile.ranking.toLocaleString()}` : "Unranked"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reputation</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {profileData.profile.profile.reputation || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problem Statistics */}
              <Card className="shadow-lg">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Problem Statistics
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatCard
                    title="Total Solved"
                    value={profileData.statistics.totalSolved}
                    total={profileData.statistics.totalQuestions}
                    icon={Trophy}
                    color="text-purple-600"
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                  />
                  <StatCard
                    title="Easy Problems"
                    value={profileData.statistics.easySolved}
                    total={profileData.statistics.totalEasy}
                    icon={Target}
                    color="text-green-600"
                    bgColor="bg-green-50 dark:bg-green-900/20"
                  />
                  <StatCard
                    title="Medium Problems"
                    value={profileData.statistics.mediumSolved}
                    total={profileData.statistics.totalMedium}
                    icon={Target}
                    color="text-yellow-600"
                    bgColor="bg-yellow-50 dark:bg-yellow-900/20"
                  />
                  <StatCard
                    title="Hard Problems"
                    value={profileData.statistics.hardSolved}
                    total={profileData.statistics.totalHard}
                    icon={Target}
                    color="text-red-600"
                    bgColor="bg-red-50 dark:bg-red-900/20"
                  />
                  
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Acceptance Rate: {profileData.statistics.acceptanceRate.toFixed(2)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - DSA Sheet & Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Submissions */}
              {profileData.recentSubmissions && profileData.recentSubmissions.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Submissions
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {profileData.recentSubmissions.slice(0, 10).map((submission, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {submission.title}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Language: {submission.lang}</span>
                              {submission.runtime && <span>Runtime: {submission.runtime}</span>}
                              {submission.memory && <span>Memory: {submission.memory}</span>}
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            submission.statusDisplay === 'Accepted' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {submission.statusDisplay}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* DSA Sheet Content */}
              <Card className="shadow-lg">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    DSA Practice Questions
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your progress through essential DSA problems
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      DSA Sheet Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      We're preparing a comprehensive collection of DSA problems tailored to your skill level. 
                      Stay tuned for updates!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaSheetPage;