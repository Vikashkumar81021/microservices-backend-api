import { Queue } from "bullmq";

export const connection = {
  host: "localhost",
  port: 6379,
  password: "irctpass",
};
const EmailQueue = new Queue(
  "email-queue",

  {
    connection,
  },
);

export { EmailQueue };
