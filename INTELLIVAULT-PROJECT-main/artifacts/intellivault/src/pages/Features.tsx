import { motion } from "framer-motion";
import { Brain, Shield, HardDrive, Check, Zap, EyeOff, Search, Clock, ShieldAlert, Key } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Features() {
  const [activeTab, setActiveTab] = useState<"ai" | "security" | "storage">("ai");

  const featureCategories = {
    ai: [
      { icon: Brain, title: "AI Document Brain", desc: "Automatically reads, classifies, and extracts key data (names, dates, amounts) without human intervention.", unique: true },
      { icon: Search, title: "Context-Aware NLP Search", desc: "Don't remember the file name? Search 'invoice from last month for software' and find it instantly." },
      { icon: Clock, title: "Expiry Prediction & Alerts", desc: "Never let a passport, license, or contract expire. AI reads dates and proactively warns you.", unique: true },
      { icon: ShieldAlert, title: "AI Fraud Detection", desc: "Advanced analysis detects tampered metadata, photoshopped images, and manipulated signatures.", unique: true }
    ],
    security: [
      { icon: EyeOff, title: "Zero-Knowledge Encryption", desc: "Your data is encrypted on your device. We never have the keys. Even a database breach yields nothing." },
      { icon: Key, title: "Multi-Layer Auth", desc: "Password + Authenticator App (MFA) + Optional Biometric lock via Passkeys." },
      { icon: Zap, title: "Self-Destruct Documents", desc: "Share a link that permanently deletes the file after 24 hours or 1 view.", unique: true },
      { icon: Shield, title: "Intrusion Detection", desc: "Behavioral biometrics monitor for anomalous access patterns and geo-fencing violations." }
    ],
    storage: [
      { icon: HardDrive, title: "Smart Organization", desc: "No more manual folders. Documents are auto-tagged and organized by category." },
      { icon: HardDrive, title: "Secure Temporary Sharing", desc: "Generate view-only links with restricted download permissions and watermarking." },
      { icon: HardDrive, title: "Version Control", desc: "Keep a secure history of document changes, perfect for contract negotiations." }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Capabilities Beyond Storage</h1>
            <p className="text-lg text-muted-foreground">
              IntelliVault isn't just a hard drive in the cloud. It's an active security team and an intelligent assistant for your most important data.
            </p>
          </div>

          {/* Custom Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { id: "ai", label: "Artificial Intelligence", icon: Brain },
              { id: "security", label: "Military Security", icon: Shield },
              { id: "storage", label: "Smart Storage", icon: HardDrive }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105"
                    : "bg-card border border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feature Grid based on active tab */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {featureCategories[activeTab].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                {feature.unique && (
                  <div className="absolute top-4 right-4 bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Unique Feature
                  </div>
                )}
                <div className="w-14 h-14 rounded-xl bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors shadow-inner">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{feature.desc}</p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400" /> Automated Process
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400" /> Fully Encrypted
                  </li>
                </ul>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
