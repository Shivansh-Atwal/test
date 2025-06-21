import { useState, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Switch } from "@/shadcn/ui/switch";
import { Textarea } from "@/shadcn/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { useToast } from "@/hooks/use-toast";
import { TRADES } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";

interface BlockedUser {
  regno: string;
  name: string;
  trade: string;
}
import userService from "@/api/services/user.service";
import { ApiResponse } from "@/types/Api";

function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [regnosToBlock, setRegnosToBlock] = useState("");
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState("20");
  const [selectedTrade, setSelectedTrade] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [selectedTrade]); // Re-fetch when trade filter changes

  useEffect(() => {
    const filtered = blockedUsers.slice(0, parseInt(rowsPerPage));
    setFilteredUsers(filtered);
  }, [blockedUsers, rowsPerPage]);

  const { toast } = useToast();

  const fetchBlockedUsers = async () => {
    try {
      const response: ApiResponse = await userService.getBlockedUsers(
        selectedTrade
      ); // Pass selected trade to API 
      if (response.success) {
        setBlockedUsers(response.data);
        const initialToggles = response.data.reduce(
          (acc: any, user: BlockedUser) => {
            acc[user.regno] = true;
            return acc;
          },
          {}
        );
        setToggleStates(initialToggles);

      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to fetch blocked users",
      });
    }
  };

  const handleToggleChange = (regno: string, checked: boolean) => {
    setToggleStates((prev) => ({
      ...prev,
      [regno]: checked,
    }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const regnosToUnblock = Object.entries(toggleStates)
        .filter(([_, isBlocked]) => !isBlocked)
        .map(([regno]) => regno);

      if (regnosToUnblock.length > 0) {
        await userService.unblockUsers(regnosToUnblock);
        toast({
          variant: "success",
          title: "Success",
          description: "Changes saved successfully",
        });
      }

      fetchBlockedUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to save changes",
      });
    }
    setLoading(false);
  };

  const handleBlockUsers = async () => {
    if (!regnosToBlock.trim()) {
      toast({
        variant: "warn",
        title: "Warning",
        description: "Please enter registration numbers to block",
      });
      return;
    }

    setLoading(true);
    try {
      const regnos = regnosToBlock.split(",").map((regno) => regno.trim());
      await userService.blockUsers(regnos);
      toast({
        variant: "success",
        title: "Success",
        description: "Users blocked successfully",
      });

      setRegnosToBlock("");
      fetchBlockedUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to block users",
      });
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Registration No",
      dataIndex: "regno",
      key: "regno",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Trade",
      dataIndex: "trade",
      key: "trade",
    },
    {
      title: "Block Status",
      key: "blockStatus",
      render: (record: BlockedUser) => (
        <Switch
          checked={toggleStates[record.regno]}
          onCheckedChange={(checked) =>
            handleToggleChange(record.regno, checked)
          }
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Textarea
          placeholder="Enter registration numbers separated by commas (e.g., 2331012, 2331013)"
          value={regnosToBlock}
          onChange={(e: any) => setRegnosToBlock(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleBlockUsers} disabled={loading}>
          {loading ? "Blocking Users..." : "Block Users"}
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 rows</SelectItem>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="20">20 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
            <SelectItem value="100">100 rows</SelectItem>

          </SelectContent>
        </Select>

        <Select value={selectedTrade} onValueChange={setSelectedTrade}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Trades</SelectItem>
            {TRADES.map((trade) => (
              <SelectItem key={trade} value={trade}>
                {trade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table className="mb-6">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.regno}>
              <TableCell>{user.regno}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.trade}</TableCell>
              <TableCell>
                <Switch
                  checked={toggleStates[user.regno]}
                  onCheckedChange={(checked) =>
                    handleToggleChange(user.regno, checked)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button onClick={handleSaveChanges} disabled={loading}>
        {!loading ? "Save Changes" : "Saving Changes..."}
      </Button>
    </div>
  );
}

export default BlockedUsers;
