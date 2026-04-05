import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Lock, Brain, FileSearch, Fingerprint, Activity, ChevronRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    { icon: Brain, title: "AI Document Brain", desc: "Automatically reads, classifies, and extracts key data from any document you upload." },
    { icon: Lock, title: "Zero-Knowledge Encryption", desc: "AES-256 bit encryption applied locally. Even our servers can't read your files." },
    { icon: Activity, title: "Expiry & Smart Alerts", desc: "AI predicts expiration dates (passports, contracts) and sends proactive alerts." },
    { icon: Fingerprint, title: "Fraud Detection", desc: "Advanced algorithms detect tampered metadata and manipulated digital signatures." },
    { icon: FileSearch, title: "Context-Aware Search", desc: "Search by meaning, not just keywords. 'Show me tax documents from 2023'." },
    { icon: Shield, title: "Self-Destruct Files", desc: "Set documents to permanently delete after a specific date or number of views." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
            alt="Abstract Neural Network" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/30 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-primary">IntelliVault v2.0 is now live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Your Intelligent Digital Vault <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary text-glow">
                AI-Powered. Military-Grade.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Securely store your most critical documents. Our AI analyzes, organizes, and protects your files with zero-knowledge encryption and proactive threat detection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Access Vault <ChevronRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/features" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg glass-panel hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <section className="border-y border-white/10 bg-card/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            {[
              { value: "256-bit", label: "AES Encryption" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "Zero", label: "Knowledge Architecture" },
              { value: "100%", label: "AI Analyzed" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-4"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Intelligence meets Security</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We've re-engineered document storage from the ground up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0, transition: { delay: index * 0.1 } }
                }}
                className="glass-panel glass-panel-hover p-8 rounded-2xl relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-glow" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card/30 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How IntelliVault Works</h2>
              <p className="text-muted-foreground mb-8 text-lg">A seamless pipeline that transforms raw files into secure, structured, and searchable intelligence.</p>
              
              <div className="space-y-8">
                {[
                  { step: "01", title: "Upload & Encrypt", desc: "Files are encrypted locally on your device before they even reach our servers." },
                  { step: "02", title: "AI Analysis", desc: "Our neural engine scans (blindly via secure enclaves) to categorize, extract metadata, and assess fraud risk." },
                  { step: "03", title: "Smart Storage", desc: "Documents are stored with proactive monitoring. You get alerted before an ID expires." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30 text-secondary font-bold font-display">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden glass-panel border-primary/20 p-2"
            >
              <img 
                src={`${import.meta.env.BASE_URL}images/security-shield.png`} 
                alt="Security Shield Hologram" 
                className="w-full h-auto rounded-xl"
              />
              {/* Overlay elements to make it look like an active dashboard */}
              <div className="absolute top-10 right-10 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-bold text-white">Encryption Verified</div>
                  <div className="text-xs text-muted-foreground">AES-256 Active</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Stop storing. Start protecting.</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of professionals securing their critical assets with IntelliVault AI.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              Create Free Vault
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
