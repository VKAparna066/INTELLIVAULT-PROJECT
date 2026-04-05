import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/contact", (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ message: "firstName, email and message are required" });
  }

  // In a real system this should save to DB, send email, or create a support ticket.
  // For this app we'll log the data and return success.
  req.log?.info({ firstName, lastName, email }, "Received contact message");

  return res.status(201).json({ status: "ok", data: { firstName, lastName, email, message } });
});

export default router;
