import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Mock user database - in real app this would be a proper database
const mockUsers: Record<string, any> = {};

router.post("/auth/google", (req, res) => {
  const { provider } = req.body;

  if (provider !== "google") {
    return res.status(400).json({ message: "Invalid provider" });
  }

  // In a real app, this would handle OAuth callback and create session
  // For now, simulate successful auth
  req.log?.info({ provider }, "Google authentication successful");

  const user = {
    id: "google-user-123",
    name: "Google User",
    email: "user@gmail.com",
    provider: "google"
  };
  const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 })).toString("base64");

  return res.status(200).json({
    success: true,
    token,
    user
  });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // In a real app, validate credentials against database
  // For now, accept any email/password combination
  req.log?.info({ email }, "User signed in");

  const user = {
    id: "user-123",
    name: email.split("@")[0],
    email: email,
    provider: "email"
  };

  const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 })).toString("base64");

  return res.status(200).json({
    success: true,
    token,
    user
  });
});

router.post("/signup", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ message: "First name, email and password are required" });
  }

  // Check if user already exists
  if (mockUsers[email]) {
    return res.status(409).json({ message: "User already exists" });
  }

  // In a real app, create user account in database
  // For now, simulate account creation
  const user = {
    id: `user-${Date.now()}`,
    name: `${firstName} ${lastName || ""}`.trim(),
    email: email,
    provider: "email",
    createdAt: new Date().toISOString()
  };

  mockUsers[email] = user;

  req.log?.info({ firstName, lastName, email }, "User account created");

  const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 })).toString("base64");
  return res.status(201).json({
    success: true,
    token,
    user: user
  });
});

export default router;