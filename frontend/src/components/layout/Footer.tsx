export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">TalentsPal</h3>
            <p className="text-gray-400">
              Empowering your career journey with AI-driven tools and resources.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/exams" className="hover:text-white transition">Exams</a></li>
              <li><a href="/companies" className="hover:text-white transition">Companies</a></li>
              <li><a href="/cv-analyzer" className="hover:text-white transition">CV Analysis</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              {/* Social icons would go here */}
              <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-blue-600 transition cursor-pointer"></div>
              <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-blue-600 transition cursor-pointer"></div>
              <div className="w-8 h-8 bg-gray-800 rounded-full hover:bg-blue-600 transition cursor-pointer"></div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          © {new Date().getFullYear()} TalentsPal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
