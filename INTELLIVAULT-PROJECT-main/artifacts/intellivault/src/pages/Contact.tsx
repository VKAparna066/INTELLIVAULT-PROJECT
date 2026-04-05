import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!firstName || !email || !message) {
      toast({ title: "Missing fields", description: "First name, email and message are required." });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, message }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message ?? "Unable to send message at this time.");
      }

      toast({ title: "Message sent", description: "Thanks! We received your message and will respond soon." });
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast({ title: "Message not sent", description: err instanceof Error ? err.message : "Unexpected error" });
      console.error("contact submit error", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have questions about enterprise deployment, security audits, or API access? Our team is ready to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">First Name</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/20" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Last Name</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/20" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Work Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/20" placeholder="john@company.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Message</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="bg-background/50 border-white/10 text-white focus:border-primary focus:ring-primary/20 min-h-[120px]" placeholder="How can we help?" />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Email Us</h4>
                    <p className="text-sm text-muted-foreground">security@intellivault.ai</p>
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-xl flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-white mb-1">Global HQ</h4>
                    <p className="text-sm text-muted-foreground">San Francisco, CA<br />Data Centers: Global</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-6 h-6 text-secondary" />
                  <h3 className="text-2xl font-bold text-white">Frequently Asked</h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-white/10">
                    <AccordionTrigger className="text-white hover:text-primary">What happens if I lose my master password?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Because we use zero-knowledge architecture, we cannot recover your master password. We provide a 24-word recovery phrase during setup that you must store safely offline.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-white/10">
                    <AccordionTrigger className="text-white hover:text-primary">Is the AI reading my documents?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      The AI analysis runs entirely within a secure, isolated enclave. The resulting metadata is encrypted with your keys before being stored. No human, and no external AI model, ever sees the raw data.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-white/10">
                    <AccordionTrigger className="text-white hover:text-primary">Can I host this on-premise?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Yes, Enterprise customers can deploy IntelliVault entirely on-premise or in a private cloud environment (AWS, GCP, Azure). Contact our sales team for details.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

