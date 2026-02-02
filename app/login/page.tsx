import LoginForm from '@/app/components/login-form';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#f8ed1a] rounded-full opacity-5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#529e14] rounded-full opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#f8ed1a] mb-6 shadow-[0_0_20px_rgba(248,237,26,0.4)] transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src="/logo.png" 
                  alt="Dueño a Dueño Logo" 
                  fill 
                  className="object-cover" 
                />
            </div>
            <span className="text-4xl font-black text-white uppercase tracking-tighter group-hover:text-[#f8ed1a] transition-colors drop-shadow-lg">
              DUEÑO <span className="text-[#f8ed1a] group-hover:text-white transition-colors">A DUEÑO</span>
            </span>
          </Link>
          
          <h2 className="mt-8 text-2xl font-bold text-white uppercase tracking-widest">
            Administrative Access
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            Enter your credentials to manage properties.
          </p>
        </div>

        {/* Form Card - Dark Themed */}
        <div className="bg-white/5 backdrop-blur-md py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-[#f8ed1a]/30 hover:border-[#f8ed1a] transition-colors duration-300">
          
          <LoginForm />
          
        </div>
        
        {/* Back Link */}
        <div className="text-center text-sm">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-[#529e14] transition-colors font-bold uppercase tracking-wide flex items-center justify-center gap-2"
            >
                <span>&larr;</span> Back to home
            </Link>
        </div>
      </div>
    </div>
  );
}