import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Clock, CheckCircle, AlertCircle, Reply } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
}

export default function Admin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact-messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        toast({ title: "Failed to load messages", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error loading messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'unread' | 'read' | 'replied') => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        ));
        toast({ title: "Message status updated" });
      } else {
        toast({ title: "Failed to update status", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'read': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'replied': return <Reply className="w-4 h-4 text-green-500" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      unread: "destructive",
      read: "default",
      replied: "secondary"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Manage customer contact messages and support requests.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Messages List */}
            <div className="lg:col-span-2">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Contact Messages ({messages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedMessage?.id === message.id
                            ? 'border-primary bg-primary/5'
                            : 'border-white/10 bg-background/50 hover:bg-background/80'
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(message.status)}
                            <span className="font-medium text-white">
                              {message.firstName} {message.lastName}
                            </span>
                          </div>
                          {getStatusBadge(message.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{message.email}</p>
                        <p className="text-sm text-white line-clamp-2">{message.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Details */}
            <div>
              {selectedMessage ? (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle>Message Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">From</label>
                      <p className="text-white font-medium">
                        {selectedMessage.firstName} {selectedMessage.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Message</label>
                      <p className="text-white mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Received</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedMessage.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedMessage.status)}
                        {getStatusBadge(selectedMessage.status)}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      {selectedMessage.status === 'unread' && (
                        <Button
                          size="sm"
                          onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                          className="flex-1"
                        >
                          Mark as Read
                        </Button>
                      )}
                      {selectedMessage.status === 'read' && (
                        <Button
                          size="sm"
                          onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                          className="flex-1"
                        >
                          Mark as Replied
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:${selectedMessage.email}`, '_blank')}
                        className="flex-1"
                      >
                        Reply via Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-panel">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a message to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}