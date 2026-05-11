import SignUpForm from '@/app/components/signup-form';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#f8ed1a] rounded-full opacity-5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#529e14] rounded-full opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#f8ed1a] mb-6 shadow-[0_0_20px_rgba(248,237,26,0.4)]">
                <Image 
                  src="/logo.png" 
                  alt="Dueño a Dueño Logo" 
                  fill 
                  className="object-cover" 
                />
            </div>
            <span className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
              DUEÑO <span className="text-[#f8ed1a]">A DUEÑO</span>
            </span>
          </div>
          
          <h2 className="mt-8 text-2xl font-bold text-white uppercase tracking-widest">
            Registro de Usuario
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            Ingresa tus datos para crear una nueva cuenta web.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-md py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-[#f8ed1a]/30 hover:border-[#f8ed1a] transition-colors duration-300">
          <SignUpForm />
        </div>
        
      </div>
    </div>
  );
}