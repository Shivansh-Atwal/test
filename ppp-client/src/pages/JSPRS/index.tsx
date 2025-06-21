import { TRADES } from "@/constants";
import userService from "@/api/services/user.service";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shadcn/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { ApiResponse } from "@/types/Api";
import { Phone } from "lucide-react";

const JSPRS = () => {
  const { toast } = useToast();
  const batches = ["2022", "2023"];
  const [batch, setBatch] = useState(batches[0]);
  const [jsprs, setJsprs] = useState<any[]>([]);

  const getJsprs = async () => {
    try {
      const res: ApiResponse = await userService.getJsprs(batch);
      setJsprs(res.data);
      console.log(res.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    }
  };

  useEffect(() => {
    getJsprs();
  }, [batch]);

  const jsprsByTrade = TRADES.map((trade) => ({
    trade,
    students: jsprs.filter((jspr) => jspr.trade === trade),
  }));

  return (
    <div className="container px-5 py-10 mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Student Placement Representatives
        </h1>
        <p className="text-gray-600">
          Meet our dedicated placement representatives who bridge the gap
          between students and opportunities.
        </p>
      </div>

      <div className="mb-4">
        <Select value={batch} onValueChange={setBatch}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((b) => (
              <SelectItem key={b} value={b}>
                Batch {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {jsprsByTrade.map(({ trade, students }) => (
        <div key={trade} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{trade}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {students.map((student) => (
              <div
                key={student.regno}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-3">
                    <AvatarImage
                      src={student.avatar}
                      alt={student.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl">
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-lg mb-0">{student.name}</p>
                  <p className="text-gray-500 text-sm">
                    {student.trade + "/" + student.regno}
                  </p>
                  <p className="text-gray-500 mt-1 text-sm font-semibold -ml-3">
                    {" "}
                    {
                      student.mobile!=null && 
                      <Phone size={14} className="inline-block mr-1 rotate-12 mb-0.5" />
                    }

                    {student.mobile!=null &&  <a href={`tel: ${student.mobile}`}>{student.mobile}</a>  }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JSPRS;
