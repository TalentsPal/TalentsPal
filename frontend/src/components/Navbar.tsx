import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-400">TalentsPal</Link>
        <div className="space-x-6">
          <Link href="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>
          <Link href="/exams" className="hover:text-blue-300 transition">Exams</Link>
          <Link href="/companies" className="hover:text-blue-300 transition">Companies</Link>
          <Link href="/cv-analyzer" className="hover:text-blue-300 transition">CV Analyzer</Link>
          <Link href="/login" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
