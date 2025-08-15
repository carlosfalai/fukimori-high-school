import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import landingImage from "@assets/Gemini_Generated_Image_ci6hn5ci6hn5ci6h.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('${landingImage}')` }}
      ></div>
      
      <div className="relative z-10 max-w-2xl w-full px-4 py-8 text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            Fukimori <span className="text-primary">High</span>
          </h1>
          <p className="text-xl text-white/90 mb-2">
            AI-Powered Manga Visual Novel
          </p>
          <p className="text-lg text-white/70">
            Your choices create unique manga frames powered by Gemini AI
          </p>
        </div>
        
        <div className="bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Create Your Own Manga Story
          </h2>
          <p className="text-white/80 mb-6 leading-relaxed">
            Every dialogue choice and interaction generates a unique manga frame using Imagen 4. 
            Build your personal visual story as you navigate through Fukimori High School.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-primary/10 border border-primary/20 rounded p-4">
              <h3 className="text-white font-semibold mb-2">Dynamic Storytelling</h3>
              <p className="text-white/70 text-sm">AI-generated dialogue that adapts to your choices</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded p-4">
              <h3 className="text-white font-semibold mb-2">Manga Generation</h3>
              <p className="text-white/70 text-sm">Each interaction creates a unique visual frame</p>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded p-4">
              <h3 className="text-white font-semibold mb-2">Personal Story</h3>
              <p className="text-white/70 text-sm">Your manga story is saved to your personal folder</p>
            </div>
          </div>
          
          <Link href="/game">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            >
              Start Your Story
            </Button>
          </Link>
        </div>
        
        <div className="text-center text-white/60 text-sm">
          <p>Experience the future of interactive storytelling</p>
          <p className="mt-2">© {new Date().getFullYear()} Fukimori High - Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
}
