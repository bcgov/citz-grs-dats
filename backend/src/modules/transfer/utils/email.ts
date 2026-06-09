export const transferEmail = (
	accession: string,
	application: string,
) => `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 700px; margin: 10px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 5px; background-color: #f9f9f9;">
      <div style="font-size: 18px; font-weight: bold; color: #0263cb; margin-bottom: 10px;">
        Records Sent to Digital Archives
      </div>
      <div style="font-size: 16px;">
        <p style="margin: 0 0 10px;">
          Thank you for sending your records to the Digital Archives for processing.
        </p>
        <p style="margin: 0 0 10px;">
          An archivist will be in touch about your transfer of Accession # ${accession} and Application # ${application}.
          <br />As per the Submission Agreement, please continue to hold your copies until we confirm they are preserved in the archives.
        </p>
        <p style="margin: 0 0 10px;">
          If you have questions please contact 
          <a href="mailto:GIM@gov.bc.ca?subject=Records%20Transfer%20Question">
            GIM@gov.bc.ca
          </a> or your 
          <a href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts/ministries" target="_blank">
            Government Information Management (GIM) Specialists.
          </a>
        </p>
        <p style="margin: 0;">
          Thank you for using the Digital Archives Transfer Service (DATS)!
        </p>
      </div>
      <div style="font-size: 12px; color: #888888; margin-top: 20px;">
        <p style="margin: 0;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  </body>`;

export const transferFailEmail = (
	processName: string,
	userEmail: string,
	accession: string,
	application: string,
	errorMessage: string,
) => `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 700px; margin: 10px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 5px; background-color: #f9f9f9;">
      <div style="font-size: 18px; font-weight: bold; color: #cc0000; margin-bottom: 10px;">
        DATS - Transfer Failed
      </div>
      <div style="font-size: 16px;">
        <p style="margin: 0 0 10px;">
          A transfer in the Digital Archive Transfer Service (DATS) has failed.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold; width: 180px;">Process</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">${processName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold; width: 180px;">Client Email</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Accession #</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">${accession}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Application #</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">${application}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Time of Failure</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">${new Date().toLocaleString("en-CA", { timeZone: "America/Vancouver" })}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; font-weight: bold;">Reason</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">${errorMessage}</td>
          </tr>
        </table>
      </div>
      <div style="font-size: 12px; color: #888888; margin-top: 20px;">
        <p style="margin: 0;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  </body>`;
