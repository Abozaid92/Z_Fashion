import { Resend } from "resend";
import { DOMAIN } from "@/lib/constants";
const resend = new Resend(process.env.AUTH_EMAIL_VERIFIY);

export const sendForget_passwordToken = async (
  email: string,
  token: string,
  lang?: string | null,
) => {
  const link = `${DOMAIN}/${lang || "en"}/reset-password?token=${token}`;
  await resend.emails.send({
    from: "shadatucme@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 16px;">

          <!-- Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width: 480px;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            padding: 32px;
          ">
            <tr>
              <td align="center">

                <!-- Icon -->
                <div style="
                  width: 64px;
                  height: 64px;
                  border-radius: 50%;
                  background-color: #d1fae5;
                  line-height: 64px;
                  font-size: 28px;
                  color: #047857;
                  margin-bottom: 16px;
                ">
                  🔐
                </div>

                <!-- Title -->
                <h1 style="
                  margin: 0 0 12px;
                  font-size: 22px;
                  color: #064e3b;
                ">
                  Reset your password
                </h1>

                <!-- Message -->
                <p style="
                  margin: 0 0 24px;
                  font-size: 15px;
                  color: #374151;
                  line-height: 1.7;
                ">
                  We received a request to reset your account password.  
                  It happens — no worries at all 🌱  
                  <br /><br />
                  Click the button below to set a new password securely.
                </p>

                <!-- Button -->
                <a href="${link}" style="
                  display: inline-block;
                  background-color: #059669;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 28px;
                  border-radius: 999px;
                  font-size: 15px;
                  font-weight: bold;
                ">
                  Reset Password
                </a>

                <!-- Security note -->
                <p style="
                  margin: 24px 0 0;
                  font-size: 13px;
                  color: #6b7280;
                  line-height: 1.6;
                ">
                  This link is valid for a limited time for security reasons.  
                  <br />
                  If you didn’t request this, you can safely ignore this email —  
                  your account is still protected 🌿
                </p>

                <!-- Footer -->
                <p style="
                  margin-top: 32px;
                  font-size: 13px;
                  color: #9ca3af;
                ">
                  Wishing you a calm day,  
                  <br />
                  Support Team 💚 shadatucme@gmail.com
                </p>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
      
      
      
      `,
  });
};
