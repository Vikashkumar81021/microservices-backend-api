import nodemailer from "nodemailer";

const emailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family:Arial; background:#f4f6f9; padding:20px;">

  <div style="max-width:500px; margin:auto; background:#fff; padding:20px; border-radius:10px; text-align:center;">
    
    <h2 style="color:#4f46e5;">OTP Verification</h2>

    <p>Your OTP code is:</p>

    <div style="font-size:28px; letter-spacing:5px; font-weight:bold; color:#111;">
      ${otp}
    </div>

    <p style="margin-top:20px; font-size:12px; color:#777;">
      This OTP is valid for 5 minutes.
    </p>

  </div>

</body>
</html>
`;

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  //   port,
  //   secure,
  auth: {
    user: "vikas@sestinfotech.com",
    pass: "lnzt vkhd lcpk yqkz",
  },
});

export const sendOtpEmail = async ({ email, otp }) => {
  await transport.sendMail({
    from: "vikas@sestinfotech.com",
    to: email,
    subject: `OTP FROM IRCTC`,

    html: emailTemplate(otp),
  });
};
