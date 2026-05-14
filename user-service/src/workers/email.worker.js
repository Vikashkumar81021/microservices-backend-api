import { Worker } from "bullmq";
import { connection } from "../queue/email.queue.js";
import { sendOtpEmail } from "../config/email.js";

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    if (job.name === "send-otp-email") {
      const { email, otp } = job.data;
      await sendOtpEmail({ email, otp });
    }
  },
  {
    connection: connection,
    concurrency: 5,
  },
);
emailWorker.on("completed", (job) => {
  console.log("✅ Email sent:", job.id);
});

emailWorker.on("failed", (job, err) => {
  console.log("❌ Email failed:", job?.id, err.message);
});
