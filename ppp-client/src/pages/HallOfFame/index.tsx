import { useEffect, useState } from "react";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Confetti from "react-confetti";
import { Trophy } from "lucide-react";
import aptitudeService from "@/api/services/aptitude.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";

interface Topper {
  regno: string;
  name: string;
  avatar: string;
  trade: string;
  marks: number;
  response_time: string;
  rank: string;
}

interface TopperData {
  overall: Topper[];
  trade: Topper[];
}

interface PastAptitude {
  id: number;
  name: string;
  test_timestamp: string;
  duration: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

interface TopperCardProps {
  topper: Topper;
  index: number;
}

const HallOfFame = () => {
  const [topperData, setTopperData] = useState<TopperData>({
    overall: [],
    trade: [],
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const [pastAptitudes, setPastAptitudes] = useState<PastAptitude[]>([]);
  const [selectedAptitudeId, setSelectedAptitudeId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pastAptiResponse: ApiResponse<PastAptitude[]> =
          await aptitudeService.getPastAptitudes();
        setPastAptitudes(pastAptiResponse.data);

        if (pastAptiResponse.data && pastAptiResponse.data.length > 0) {
          const mostRecentAptitudeId = pastAptiResponse.data[0].id;
          setSelectedAptitudeId(mostRecentAptitudeId);
          const toppersResponse: ApiResponse<TopperData> =
            await aptitudeService.getToppers(mostRecentAptitudeId);
          setTopperData(toppersResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      }
    };
    let timer: any = null;
    setShowConfetti(true);
    fetchData().then(() => {
      timer = setTimeout(() => setShowConfetti(false), 7000);
    });

    return () => clearTimeout(timer);
  }, [toast]);

  const handleAptitudeChange = async (aptitudeId: string) => {
    try {
      const toppersResponse: ApiResponse<TopperData> =
        await aptitudeService.getToppers(parseInt(aptitudeId));
      setTopperData(toppersResponse.data);
      setSelectedAptitudeId(parseInt(aptitudeId));
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 7000);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error fetching toppers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch toppers",
        variant: "destructive",
      });
    }
  };

  const TopperCard = ({ topper, index }: TopperCardProps) => (
    <Card className="relative">
      <div
        className={`absolute top-0 right-0 p-2 ${
          index === 0
            ? "bg-yellow-500"
            : index === 1
            ? "bg-gray-400"
            : index === 2
            ? "bg-amber-600"
            : "bg-blue-500"
        } text-white rounded-bl`}
      >
        #{topper.rank}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={topper.avatar} alt={topper.name} className="object-cover" />
            <AvatarFallback>{topper.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">{topper.name}</h3>
            <p className="text-gray-600">
              {topper.trade}/{topper.regno}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Group trade-wise toppers by trade
  const tradeGroups = topperData.trade.reduce(
    (groups: { [key: string]: Topper[] }, topper) => {
      if (!groups[topper.trade]) {
        groups[topper.trade] = [];
      }
      groups[topper.trade].push(topper);
      return groups;
    },
    {}
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      {showConfetti && <Confetti />}

      {/* Aptitude Selection */}
      <div className="w-full max-w-xs">
        <Select
          value={selectedAptitudeId?.toString()}
          onValueChange={handleAptitudeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Aptitude Test" />
          </SelectTrigger>
          <SelectContent>
            {pastAptitudes.map((aptitude) => (
              <SelectItem key={aptitude.id} value={aptitude.id.toString()}>
                {aptitude.name} (
                {new Date(
                  parseInt(aptitude.test_timestamp) * 1000
                ).toLocaleDateString()}
                )
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Toppers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Overall Toppers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topperData.overall.map((topper, index) => (
            <TopperCard key={topper.regno} topper={topper} index={index} />
          ))}
        </div>
      </div>

      {/* Trade-wise Toppers */}
      <div className="space-y-8">
        {Object.entries(tradeGroups).map(([trade, toppers]) => (
          <div key={trade}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">{trade}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {toppers.map((topper, index) => (
                <TopperCard key={topper.regno} topper={topper} index={index} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;
