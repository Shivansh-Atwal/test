import { Button } from "@/shadcn/ui/button";
import { Card, CardContent } from "@/shadcn/ui/card";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Welcome to SLIET's Placement Preparation Portal
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Preparing students for successful careers through comprehensive
            placement training and opportunities.
          </p>
        </div>

        {/* University Image */}
        <div className="mt-10">
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
            <img
              src="assets/SLIET.jpg" // Add your university image here
              alt="University Campus"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center px-4">
                Building Future Leaders
              </h2>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Aptitude Tests
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Practice aptitude tests to improve your problem-solving skills
              </p>
              <Link className="float-right" to={"/aptitudes"}>
                <Button  size="sm" className="px-4 my-3 lg:my-5 py-3 text-lg">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                DSA Sheets
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Data structures and algorithms practice sheets for better
                understanding
              </p>
              <span className="my-3 lg:my-5 px-3 py-1 bg-[#65b0b9] text-white font-medium rounded-2xl float-right">
                Coming soon
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Coding Contests
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Participate in coding contests and improve your coding skills
              </p>

              <span className="my-3 lg:my-5 px-3 py-1 bg-[#65b0b9] text-white font-medium rounded-2xl float-right">
                Coming soon
              </span>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-10 text-center">
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Join our pre-placement program and kickstart your career
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
