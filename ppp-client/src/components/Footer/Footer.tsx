import { Github } from "lucide-react"
function Footer() {
  return (
    <footer className="border-t dark:bg-[#000]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} T&P SLIET. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="mx-3 inline">GITHUB <Github className="inline mx-1" /></span>  <a href="https://github.com/aphsavii/ppp-client/">Client</a> <a href="https://github.com/aphsavii/ppp-server/">Server</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
