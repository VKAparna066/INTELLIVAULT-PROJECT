import { motion } from "framer-motion";
import { Shield, Lock, Server, Code } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Rebuilding Trust in the <span className="text-primary text-glow">Digital Era</span>
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Traditional cloud storage was built for convenience, not security. As cyber threats evolve, keeping your identity, financial records, and medical data in standard consumer clouds is no longer viable.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                IntelliVault AI was founded on a simple principle: True security requires zero-knowledge architecture, and true convenience requires artificial intelligence. We built the intersection of both.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Files Secured", val: "10M+" },
                { label: "Threats Blocked", val: "450K" },
                { label: "Uptime", val: "99.99%" },
                { label: "Encryption", val: "AES-256" }
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-white mb-2 font-display">{stat.val}</div>
                  <div className="text-sm text-primary uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center text-white mb-12">The IntelliVault Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "Zero-Trust Protocol", desc: "Every action is authenticated and authorized continuously." },
                { icon: Lock, title: "Client-Side Encryption", desc: "Data is encrypted in your browser before transmission." },
                { icon: Server, title: "Distributed Storage", desc: "Sharded and encrypted blocks across multiple secure zones." },
                { icon: Code, title: "Open Security", desc: "Our cryptographic implementation is subject to independent audits." }
              ].map((item, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl text-center">
                  <div className="w-12 h-12 mx-auto bg-card border border-white/10 rounded-full flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
