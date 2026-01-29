// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
// import { Button } from "@/shadcn/ui/button";
// import { Input } from "@/shadcn/ui/input";
// import { Textarea } from "@/shadcn/ui/textarea";
// import { Label } from "@/shadcn/ui/label";
// import { Checkbox } from "@/shadcn/ui/checkbox";
// import { Badge } from "@/shadcn/ui/badge";
// import { 
//   Upload, 
//   X, 
//   Plus, 
//   FileText, 
//   Building2,
//   Calendar,
//   GraduationCap
// } from "lucide-react";
// import { ExperienceUploadData } from "@/types/Experience";
// import { useToast } from "@/hooks/use-toast";
// import experienceService from "@/api/services/experience.service";
// import { useNavigate } from "react-router-dom";

// const TRADES = [
//   "GCS",
//   "GEC", 
//   "GME",
//   "GCT",
//   "GFT",
//   "GEE",
//   "GIN"
// ];

// const YEARS = [2025,2024, 2023, 2022, 2021, 2020];

// function ShareExperience() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<ExperienceUploadData>({
//     companyName: "",
//     companyYear: new Date().getFullYear(),
//     studentTrade: "",
//     interviewQuestions: {
//       technical: [""],
//       hr: [""]
//     },
//     projectDetails: {
//       title: "",
//       description: "",
//       technologies: [""]
//     },
//     additionalTips: "",
//     isAnonymous: false
//   });

//   const [resumeFile, setResumeFile] = useState<File | null>(null);
//   const { toast } = useToast();

//   const handleInputChange = (field: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       [parentField]: {
//         ...(prev[parentField as keyof ExperienceUploadData] as any),
//         [childField]: value
//       }
//     }));
//   };

//   const handleArrayInputChange = (parentField: string, childField: string, index: number, value: string) => {
//     setFormData(prev => {
//       const parent = prev[parentField as keyof ExperienceUploadData] as any;
//       const newArray = [...parent[childField]];
//       newArray[index] = value;
//       return {
//         ...prev,
//         [parentField]: {
//           ...parent,
//           [childField]: newArray
//         }
//       };
//     });
//   };

//   const addArrayItem = (parentField: string, childField: string) => {
//     setFormData(prev => {
//       const parent = prev[parentField as keyof ExperienceUploadData] as any;
//       return {
//         ...prev,
//         [parentField]: {
//           ...parent,
//           [childField]: [...parent[childField], ""]
//         }
//       };
//     });
//   };

//   const removeArrayItem = (parentField: string, childField: string, index: number) => {
//     setFormData(prev => {
//       const parent = prev[parentField as keyof ExperienceUploadData] as any;
//       const newArray = parent[childField].filter((_: any, i: number) => i !== index);
//       return {
//         ...prev,
//         [parentField]: {
//           ...parent,
//           [childField]: newArray
//         }
//       };
//     });
//   };

//   const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         toast({
//           title: "File too large",
//           description: "Please upload a file smaller than 5MB",
//           variant: "destructive"
//         });
//         return;
//       }
//       setResumeFile(file);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.companyName || !formData.studentTrade) {
//       toast({
//         title: "Missing required fields",
//         description: "Please fill in all required fields",
//         variant: "destructive"
//       });
//       return;
//     }

//     // Filter out empty strings from arrays
//     const filteredData = {
//       ...formData,
//       interviewQuestions: {
//         technical: formData.interviewQuestions.technical.filter(q => q.trim() !== ""),
//         hr: formData.interviewQuestions.hr.filter(q => q.trim() !== "")
//       },
//       projectDetails: {
//         ...formData.projectDetails,
//         technologies: formData.projectDetails.technologies.filter(t => t.trim() !== "")
//       }
//     };

//     try {
//       // Prepare data for API call
//       const submitData = {
//         ...filteredData,
//         resumeFile: resumeFile || undefined
//       };

//       // Call the API
//       await experienceService.createExperience(submitData);
      
//       toast({
//         title: "Success",
//         description: "Your experience has been shared successfully!",
//       });
      
//       // Reset form
//       setFormData({
//         companyName: "",
//         companyYear: new Date().getFullYear(),
//         studentTrade: "",
//         interviewQuestions: { technical: [""], hr: [""] },
//         projectDetails: { title: "", description: "", technologies: [""] },
//         additionalTips: "",
//         isAnonymous: false
//       });
//       setResumeFile(null);
      
//       // Navigate back to experience page after a short delay
//       setTimeout(() => {
//         navigate('/experience');
//       }, 2000);
//     } catch (error) {
//       console.error("Error submitting experience:", error);
//       toast({
//         title: "Error",
//         description: "Failed to share experience. Please try again.",
//         variant: "destructive"
//       });
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold flex items-center gap-2">
//             <FileText className="h-6 w-6" />
//             Share Your Experience
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* basic information */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Basic Information</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="companyName">Company Name *</Label>
//                   <div className="relative">
//                     <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="companyName"
//                       placeholder="e.g., Infosys, TCS, Amazon"
//                       value={formData.companyName}
//                       onChange={(e) => handleInputChange("companyName", e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="companyYear">Placement Year *</Label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <select
//                       id="companyYear"
//                       value={formData.companyYear}
//                       onChange={(e) => handleInputChange("companyYear", parseInt(e.target.value))}
//                       className="w-full h-10 px-10 border border-input bg-background rounded-md text-sm"
//                       required
//                     >
//                       {YEARS.map(year => (
//                         <option key={year} value={year}>{year}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="studentTrade">Your Trade/Branch *</Label>
//                 <div className="relative">
//                   <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <select
//                     id="studentTrade"
//                     value={formData.studentTrade}
//                     onChange={(e) => handleInputChange("studentTrade", e.target.value)}
//                     className="w-full h-10 px-10 border border-input bg-background rounded-md text-sm"
//                     required
//                   >
//                     <option value="">Select your trade</option>
//                     {TRADES.map(trade => (
//                       <option key={trade} value={trade}>{trade}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="isAnonymous"
//                   checked={formData.isAnonymous}
//                   onCheckedChange={(checked) => handleInputChange("isAnonymous", checked)}
//                 />
//                 <Label htmlFor="isAnonymous">Share anonymously</Label>
//               </div>
//             </div>

//             {/* Interview Questions */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Interview Questions</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <Label>Technical Questions</Label>
//                   {formData.interviewQuestions.technical.map((question, index) => (
//                     <div key={index} className="flex gap-2 mt-2">
//                       <Input
//                         placeholder="Enter technical question"
//                         value={question}
//                         onChange={(e) => handleArrayInputChange("interviewQuestions", "technical", index, e.target.value)}
//                       />
//                       {formData.interviewQuestions.technical.length > 1 && (
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="icon"
//                           onClick={() => removeArrayItem("interviewQuestions", "technical", index)}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addArrayItem("interviewQuestions", "technical")}
//                     className="mt-2"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Question
//                   </Button>
//                 </div>

//                 <div>
//                   <Label>HR Questions</Label>
//                   {formData.interviewQuestions.hr.map((question, index) => (
//                     <div key={index} className="flex gap-2 mt-2">
//                       <Input
//                         placeholder="Enter HR question"
//                         value={question}
//                         onChange={(e) => handleArrayInputChange("interviewQuestions", "hr", index, e.target.value)}
//                       />
//                       {formData.interviewQuestions.hr.length > 1 && (
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="icon"
//                           onClick={() => removeArrayItem("interviewQuestions", "hr", index)}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addArrayItem("interviewQuestions", "hr")}
//                     className="mt-2"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Question
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Project Details */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Final Year Project Details</h3>
              
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="projectTitle">Project Title</Label>
//                   <Input
//                     id="projectTitle"
//                     placeholder="e.g., E-commerce Platform"
//                     value={formData.projectDetails.title}
//                     onChange={(e) => handleNestedInputChange("projectDetails", "title", e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="projectDescription">Project Description</Label>
//                   <Textarea
//                     id="projectDescription"
//                     placeholder="Brief description of your project..."
//                     value={formData.projectDetails.description}
//                     onChange={(e) => handleNestedInputChange("projectDetails", "description", e.target.value)}
//                     rows={3}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Technologies Used</Label>
//                   {formData.projectDetails.technologies.map((tech, index) => (
//                     <div key={index} className="flex gap-2 mt-2">
//                       <Input
//                         placeholder="e.g., React, Node.js, MongoDB"
//                         value={tech}
//                         onChange={(e) => handleArrayInputChange("projectDetails", "technologies", index, e.target.value)}
//                       />
//                       {formData.projectDetails.technologies.length > 1 && (
//                         <Button
//                           type="button"
//                           variant="outline"
//                           size="icon"
//                           onClick={() => removeArrayItem("projectDetails", "technologies", index)}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addArrayItem("projectDetails", "technologies")}
//                     className="mt-2"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Technology
//                   </Button>
//                 </div>

//               </div>
//             </div>


//             {/* Additional Tips */}
//             <div className="space-y-2">
//               <Label htmlFor="additionalTips">Additional Tips & Advice</Label>
//               <Textarea
//                 id="additionalTips"
//                 placeholder="Share any additional tips, advice, or insights that might help other students..."
//                 value={formData.additionalTips}
//                 onChange={(e) => handleInputChange("additionalTips", e.target.value)}
//                 rows={4}
//               />
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-end gap-4 pt-4">
//               <Button type="button" variant="outline" onClick={() => navigate('/experience')}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 <Upload className="h-4 w-4 mr-2" />
//                 Share Experience
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default ShareExperience;
