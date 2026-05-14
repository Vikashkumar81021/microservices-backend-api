import { EmailQueue } from "../queue/email.queue.js";

const addEmailJob = async (data) => {
  console.log("queueu is here", data);

  await EmailQueue.add("send-otp-email", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },

    removeOnComplete: true,
    removeOnFail: false,
  });
};

export { addEmailJob };
