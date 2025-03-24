export const declineAgreementEmail = (
  name: string,
  email: string,
  accession: string,
  application: string
) => `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 700px; margin: 10px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 5px; background-color: #f9f9f9;">
      <div style="font-size: 18px; font-weight: bold; color: #0263cb; margin-bottom: 10px;">
        User Declined Submission Agreement
      </div>
      <div style="font-size: 16px;">
        <p style="margin: 0 0 10px;">
          User <b>${name}</b> with email <b>${email}</b> has declined the submission agreement for Accession: <b>${accession}</b>, Application: <b>${application}</b> within the Digital Archives Transfer Service (DATS).
        </p>
      </div>
      <div style="font-size: 12px; color: #888888; margin-top: 20px;">
        <p style="margin: 0;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  </body>`;
