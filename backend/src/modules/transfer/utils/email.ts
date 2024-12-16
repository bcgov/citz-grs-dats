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
