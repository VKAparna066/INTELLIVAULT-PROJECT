import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock user database - in real app this would be a proper database
const mockUsers: Record<string, any> = {};

// Mock contact messages storage
const contactMessages: Array<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
}> = [];

// Auth routes
app.post("/api/auth/google", (req, res) => {
  const { provider } = req.body;

  if (provider !== "google") {
    return res.status(400).json({ message: "Invalid provider" });
  }

  req.log?.info({ provider }, "Google authentication successful");

  return res.status(200).json({
    success: true,
    user: {
      id: "google-user-123",
      name: "Google User",
      email: "user@gmail.com",
      provider: "google"
    }
  });
});

app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  req.log?.info({ email }, "User signed in");

  return res.status(200).json({
    success: true,
    user: {
      id: "user-123",
      name: email.split("@")[0],
      email: email,
      provider: "email"
    }
  });
});

app.post("/api/signup", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ message: "First name, email and password are required" });
  }

  // Check if user already exists
  if (mockUsers[email]) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = {
    id: `user-${Date.now()}`,
    name: `${firstName} ${lastName || ""}`.trim(),
    email: email,
    provider: "email",
    createdAt: new Date().toISOString()
  };

  mockUsers[email] = user;

  req.log?.info({ firstName, lastName, email }, "User account created");

  return res.status(201).json({
    success: true,
    user: user
  });
});

app.post("/api/contact", (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ message: "firstName, email and message are required" });
  }

  const contactMessage = {
    id: `msg-${Date.now()}`,
    firstName,
    lastName: lastName || '',
    email,
    message,
    timestamp: new Date().toISOString(),
    status: 'unread' as const
  };

  contactMessages.push(contactMessage);

  req.log?.info({ firstName, lastName, email, messageId: contactMessage.id }, "Received contact message");

  return res.status(201).json({ status: "ok", data: contactMessage });
});

// Admin endpoint to view all contact messages
app.get("/api/admin/contact-messages", (req, res) => {
  // In a real app, this would require authentication
  // For now, return all messages sorted by newest first
  const sortedMessages = contactMessages
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return res.status(200).json({
    success: true,
    messages: sortedMessages,
    total: sortedMessages.length,
    unread: sortedMessages.filter(m => m.status === 'unread').length
  });
});

// Admin endpoint to update message status
app.patch("/api/admin/contact-messages/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const message = contactMessages.find(m => m.id === id);
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  if (!['unread', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  message.status = status;
  req.log?.info({ messageId: id, status }, "Updated contact message status");

  return res.status(200).json({ success: true, message });
});

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ status: "ok" });
});

export default app;