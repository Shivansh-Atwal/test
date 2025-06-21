import { useState, useEffect } from "react";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/shadcn/ui/dialog";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import aptitudeService from "@/api/services/aptitude.service";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
interface Aptitude {
  id?: number;
  name: string;
  test_timestamp: string;
  duration: number;
}

function Dashboard() {
  const [tests, setTests] = useState<Aptitude[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Aptitude | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    test_timestamp: "",
    duration: 0,
    total_questions: 0,
  });

  const { toast } = useToast();

  const fetchAptitudes = async () => {
    try {
      const response: any = await aptitudeService.getAptitudes();
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

  useEffect(() => {
    fetchAptitudes();
  }, []);

  const handleCreateTest = async () => {
    if (
      !formData.name ||
      !formData.test_timestamp ||
      !formData.duration ||
      !formData.total_questions
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    try {
      const timestamp = Math.floor(
        new Date(formData.test_timestamp).getTime() / 1000
      );
      await aptitudeService.createAptitude({
        ...formData,
        test_timestamp: timestamp.toString(),
      });
      await fetchAptitudes();
      toast({
        title: "Success",
        description: "Aptitude test created successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create aptitude test",
        variant: "destructive",
      });
    } finally {
      setShowCreateDialog(false);
      setFormData({
        name: "",
        test_timestamp: "",
        duration: 0,
        total_questions: 0,
      });
    }
  };

  const handleEditTest = async () => {
    if (
      !selectedTest ||
      !formData.name ||
      !formData.test_timestamp ||
      !formData.duration
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    try {
      const timestamp = Math.floor(
        new Date(formData.test_timestamp).getTime() / 1000
      );
      await aptitudeService.updateAptitude({
        ...formData,
        id: selectedTest.id,
        test_timestamp: timestamp.toString(),
      });
      await fetchAptitudes();
      toast({
        title: "Success",
        description: "Aptitude test updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update aptitude test",
        variant: "destructive",
      });
    } finally {
      setShowEditDialog(false);
      setSelectedTest(null);
      setFormData({
        name: "",
        test_timestamp: "",
        duration: 0,
        total_questions: 0,
      });
    }
  };

  const handleDeleteTest = async () => {
    try {
      await aptitudeService.deleteAptitude(selectedTest?.id || 0);
      await fetchAptitudes();
      toast({
        title: "Success",
        description: "Aptitude test deleted successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete aptitude test",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedTest(null);
    }
  };

  const openEditDialog = (test: Aptitude) => {
    // Convert Unix timestamp to date string without timezone offset
    const localDate = new Date(parseInt(test.test_timestamp) * 1000);
    const utcDate = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    );
    const formattedDate = utcDate.toISOString().slice(0, 16);

    setFormData({
      name: test.name,
      test_timestamp: formattedDate,
      duration: test.duration,
      total_questions: 0,
    });
    setSelectedTest(test);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (test: Aptitude) => {
    setSelectedTest(test);
    setShowDeleteDialog(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="bg-background">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              Aptitude Tests Dashboard
            </h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Test
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Aptitude Test</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="datetime" className="text-right">
                      Date & Time
                    </Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={formData.test_timestamp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          test_timestamp: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration (mins)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="total_questions" className="text-right">
                      Total Questions
                    </Label>
                    <Input
                      id="total_questions"
                      type="number"
                      value={formData.total_questions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_questions: parseInt(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTest}>Create Test</Button>
                </div>
              </DialogContent>
            </Dialog>
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
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests &&
                  tests.map((test, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link to={`/admin/aptitude/${test.id}`}>
                          {test.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {timestampToDate(test.test_timestamp)}
                      </TableCell>
                      <TableCell>{test.duration}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(test)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteDialog(test)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Aptitude Test</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-datetime" className="text-right">
                Date & Time
              </Label>
              <Input
                id="edit-datetime"
                type="datetime-local"
                value={formData.test_timestamp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    test_timestamp: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Duration (mins)
              </Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTest}>Update Test</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTest?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTest}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
