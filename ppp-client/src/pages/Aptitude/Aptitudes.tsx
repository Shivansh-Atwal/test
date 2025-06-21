import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import aptitudeService from "@/api/services/aptitude.service";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { ApiResponse } from "@/types/Api";

interface Aptitude {
  id: number;
  name: string;
  test_timestamp: string;
  duration: number;
  status?: "upcoming" | "ongoing" | "completed" | "missed";
}

function Aptitudes() {
  const [tests, setTests] = useState<Aptitude[]>([]);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const { toast } = useToast();

  const fetchAptitudes = async () => {
    try {
      const response: ApiResponse = await aptitudeService.getAptitudes();
      setTests(response?.data || []);
      toast({
        title: "Success",
        description: "Aptitude tests fetched successfully",
      });
    } catch (error) {
      setTests([]);
      toast({
        title: "Error",
        description: "Failed to fetch aptitude tests",
        variant: "destructive",
      });
    }
  };

  const timestampToDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getTestStatus = (test: Aptitude): Aptitude["status"] => {
    const testTime = parseInt(test.test_timestamp);
    const endTime = testTime + test.duration * 60;

    if (currentTime < testTime) return "upcoming";
    if (currentTime >= testTime && currentTime <= endTime) return "ongoing";
    return "completed";
  };

  const getStatusColor = (status: Aptitude["status"]) => {
    switch (status) {
      case "upcoming":
        return "text-blue-600 bg-blue-50";
      case "ongoing":
        return "text-green-600 bg-green-50";
      case "completed":
        return "text-gray-600 bg-gray-50";
      case "missed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  useEffect(() => {
    fetchAptitudes();
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="bg-background">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              Available Aptitude Tests
            </h1>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    Test Name
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Date & Time
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Duration (mins)
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => {
                  const status = getTestStatus(test);
                  return (
                    <TableRow key={test.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>
                        {timestampToDate(test.test_timestamp)}
                      </TableCell>
                      <TableCell>{test.duration}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                            status
                          )}`}
                        >
                          {status
                            ? status.charAt(0).toUpperCase() + status.slice(1)
                            : "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {status === "ongoing" ? (
                          <Link to={`/aptitude/appear/${test.id}`}>
                            <Button
                              disabled={
                                localStorage.getItem(
                                  `aptitude-${test.id}-submitted`
                                ) != null
                              }
                              size="sm"
                              variant="default"
                            >
                              {localStorage.getItem(
                                `aptitude-${test.id}-submitted`
                              )
                                ? "Submitted"
                                : " Start Test"}
                            </Button>
                          </Link>
                        ) : status === "completed" ? (
                          <Link to={`/aptitude/response/${test.id}`}>
                            <Button size="sm" variant="outline">
                              View Score
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            {status === "upcoming" ? "Not Started" : "Missed"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Aptitudes;
