import { useState} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Badge } from "@/shadcn/ui/badge";
import { 
  FolderOpen, 
  Calendar, 
  Building2, 
  Search,
  ChevronRight
} from "lucide-react";
import { Year, Company} from "@/types/Experience";

//hard coded dta
const mockData: Year[] = [
  {
    id: "2025",
    year: 2025,
    companies: [
      {
        id: "infosys-2025",
        name: "Infosys",
        experiences: [
              {
                id: "exp1",
                studentName: "John Doe",
                studentRegNo: "2231081",
                studentTrade: "GCS",
                studentBatch: "2022",
                companyName: "Infosys",
                companyYear: 2024,
                interviewQuestions: {
                  technical: ["What is OOP?", "Explain data structures", "Write a sorting algorithm"],
                  hr: ["Tell me about yourself", "Why Infosys?", "Where do you see yourself in 5 years?"]
                },
                projectDetails: {
                  title: "E-commerce Platform",
                  description: "Full-stack e-commerce application with payment integration",
                  technologies: ["React", "Node.js", "MongoDB", "Stripe"]
                },
                additionalTips: "Focus on problem-solving skills and be confident in your answers",
                createdAt: "2025-01-15",
                updatedAt: "2025-01-15",
                isAnonymous: false
              },
              {
                id: "exp2",
                studentName: "Shivansh Atwal",
                studentRegNo: "2241045",
                studentTrade: "GCS",
                studentBatch: "2022",
                companyName: "Infosys",
                companyYear: 2025,
                interviewQuestions: {
                  technical: ["Explain database normalization", "What is REST API?", "Difference between SQL and NoSQL"],
                  hr: ["Describe a challenging project", "How do you handle pressure?", "Why should we hire you?"]
                },
                projectDetails: {
                  title: "AI Chatbot System",
                  description: "Intelligent chatbot using machine learning for customer support",
                  technologies: ["Python", "TensorFlow", "Flask", "PostgreSQL"]
                },
                additionalTips: "Practice coding problems on LeetCode and be ready to explain your thought process",
                createdAt: "2025-02-10",
                updatedAt: "2025-02-10",
                isAnonymous: false
              },
              {
                id: "exp3",
                studentName: "Rahul Atwal",
                studentRegNo: "2241046",
                studentTrade: "GCS",
                studentBatch: "2022",
                companyName: "Infosys",
                companyYear: 2025,
                interviewQuestions: {
                  technical: ["System design basics", "Explain microservices", "What is Docker?"],
                  hr: ["Tell me about a time you failed", "How do you work in a team?", "What are your strengths?"]
                },
                projectDetails: {
                  title: "Cloud Migration Project",
                  description: "Migrated legacy application to AWS cloud infrastructure",
                  technologies: ["AWS", "Docker", "Kubernetes", "Terraform"]
                },
                additionalTips: "Be honest about your weaknesses and show willingness to learn",
                createdAt: "2025-03-05",
                updatedAt: "2025-03-05",
                isAnonymous: true
              }
            ]
          },
          {
            id: "tcs-2025",
            name: "TCS",
            experiences: [
              {
                id: "exp4",
                studentName: "Abhishek Yadav",
                studentRegNo: "2241032",
                studentTrade: "GCS",
                studentBatch: "2022",
                companyName: "TCS",
                companyYear: 2025,
                interviewQuestions: {
                  technical: ["What is Java?", "Explain inheritance", "Difference between ArrayList and LinkedList"],
                  hr: ["Why TCS?", "Tell me about your achievements", "How do you handle deadlines?"]
                },
                projectDetails: {
                  title: "Banking Management System",
                  description: "Secure banking application with transaction management",
                  technologies: ["Java", "Spring Boot", "MySQL", "JWT"]
                },
                additionalTips: "Focus on Java fundamentals and be prepared for behavioral questions",
                createdAt: "2025-01-20",
                updatedAt: "2025-01-20",
                isAnonymous: false
              }
            ]
          },
          {
            id: "wipro-2025",
            name: "Wipro",
            experiences: [
              {
                id: "exp5",
                studentName: "Priya Sharma",
                studentRegNo: "2241033",
                studentTrade: "GEC",
                studentBatch: "2022",
                companyName: "Wipro",
                companyYear: 2025,
                interviewQuestions: {
                  technical: ["What is Java?", "Explain inheritance", "Difference between ArrayList and LinkedList"],
                  hr: ["Why Wipro?", "Tell me about your achievements", "How do you handle deadlines?"]
                },
                projectDetails: {
                  title: "IoT Monitoring System",
                  description: "Real-time monitoring system for IoT devices",
                  technologies: ["Python", "Django", "PostgreSQL", "MQTT"]
                },
                additionalTips: "Focus on Java fundamentals and be prepared for behavioral questions",
                createdAt: "2025-01-25",
                updatedAt: "2025-01-25",
                isAnonymous: false
              }
            ]
          }
        ]
      },
  {
    id: "2024",
    year: 2024,
    companies: [
      {
        id: "amazon-2024",
        name: "Amazon",
        experiences: [
          {
            id: "exp6",
            studentName: "Raj Patel",
            studentRegNo: "2131001",
            studentTrade: "CSE",
            studentBatch: "2021",
            companyName: "Amazon",
            companyYear: 2024,
            interviewQuestions: {
              technical: ["System design for e-commerce", "Explain load balancing", "What is microservices?"],
              hr: ["Why Amazon?", "Tell me about a challenging project", "How do you handle ambiguity?"]
            },
            projectDetails: {
              title: "Cloud Infrastructure Automation",
              description: "Automated deployment pipeline for cloud services",
              technologies: ["AWS", "Terraform", "Docker", "Jenkins"]
            },
            additionalTips: "Focus on system design and be prepared for behavioral questions",
            createdAt: "2024-12-15",
            updatedAt: "2024-12-15",
            isAnonymous: false
          }
        ]
      }
    ]
  }
];

function Experience() {
  const [currentView, setCurrentView] = useState<'years' | 'companies' | 'experiences'>('years');
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState("");


  const handleYearSelect = (year: Year) => {
    setSelectedYear(year);
    setSelectedCompany(null);
    setCurrentView('companies');
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentView('experiences');
  };

  const handleBack = () => {
    if (currentView === 'companies') {
      setCurrentView('years');
      setSelectedYear(null);
    } else if (currentView === 'experiences') {
      setCurrentView('companies');
      setSelectedCompany(null);
    }
  };

//   const handleShareExperience = () => {
//     navigate('/admin/experience/share');
//   };

  const filteredData = (): (Year | Company)[] => {
    if (currentView === 'years') {
      return mockData.filter(year => 
        year.year.toString().includes(searchQuery) ||
        year.companies.some(company => 
          company.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else if (currentView === 'companies' && selectedYear) {
      return selectedYear.companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  };

  const renderYears = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(filteredData() as Year[]).map((year) => (
        <Card 
          key={year.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleYearSelect(year)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {year.year}
            </CardTitle>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {year.companies.length} companies
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );


  const renderCompanies = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(filteredData() as Company[]).map((company) => (
        <Card 
          key={company.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCompanySelect(company)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {company.name}
            </CardTitle>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {company.experiences.length} experiences
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderExperiences = () => (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{selectedCompany?.name} Experiences</h2>
          <p className="text-muted-foreground">
            {selectedCompany?.experiences.length} experience{selectedCompany?.experiences.length !== 1 ? 's' : ''} shared
          </p>
        </div>
      </div>

      {selectedCompany?.experiences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experiences yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Be the first to share your interview experience with {selectedCompany?.name}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {selectedCompany?.experiences.map((experience) => (
          <Card key={experience.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {experience.isAnonymous ? "A" : experience.studentName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {experience.isAnonymous ? "Anonymous" : experience.studentName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {experience.studentRegNo} • {experience.studentTrade} • {experience.studentBatch}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shared on {new Date(experience.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  Technical Questions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  {experience.interviewQuestions.technical.map((q, idx) => (
                    <li key={idx} className="text-muted-foreground">{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  HR Questions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  {experience.interviewQuestions.hr.map((q, idx) => (
                    <li key={idx} className="text-muted-foreground">{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  Project Details
                </h4>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-1">{experience.projectDetails.title}</h5>
                  <p className="text-sm mb-2">{experience.projectDetails.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {experience.projectDetails.technologies.map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  Additional Tips
                </h4>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm">{experience.additionalTips}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/*top*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Placement Experience
          </h1>
        </div>
        {/* {auth.isAdmin && (
          <Button onClick={handleShareExperience}>
            <Plus className="h-4 w-4 mr-2" />
            Share Experience
          </Button>
        )} */}
      </div>

      {/*search filter*/}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by year, company, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/*peeche jane ka btn*/}
      {currentView !== 'years' && (
        <Button variant="outline" onClick={handleBack} className="mb-6">
          ← Back
        </Button>
      )}

      {/*content*/}
      <Card>
        <CardContent className="p-6">
          {currentView === 'years' && renderYears()}
          {currentView === 'companies' && renderCompanies()}
          {currentView === 'experiences' && renderExperiences()}
        </CardContent>
      </Card>
    </div>
  );
}


export default Experience;
