import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";

// Get submission agreement.
export const get = errorWrapper(async (req: Request, res: Response) => {
	const agreementText = `BC GOVERNMENT DIGITAL ARCHIVES 
SUBMISSION AGREEMENT 

This is an agreement between BC's Digital Archives and the Ministry, for the transfer of government records under Accession # ________ and Application # ________. 

The purpose of this agreement is to transfer Full Retention (FR) government records, after the date of their Final Disposition (FD), from the Ministry to the Digital Archives. 

The Ministry and Digital Archives agree that:

1. The Ministry currently holds legal and physical custody of the government records being transferred, and declares that the records are authentic evidence of government actions and decisions. 

2. The government records are subject to the Information Management Act (IMA), Freedom of Information and Protection of Privacy Act (FIPPA), and other relevant legislation. 

3. The government records meet all conditions outlined in the Managing Government Information Policy (MGIP) and RIM Manual Section 3.3 Transfer to Archives.

4. None of the government records being transferred will be destroyed by the Ministry until the Digital Archives verifies the creation of Archival Information Packages (AIPs) in the preservation system, which completes of the transfer process. After verification the source information will be a redundant copy and will be destroyed appropriately by the Ministry, to reduce duplication and ensure a single source of truth. 

5. Upon completion of the transfer process the Digital Archives will assume legal and physical custody and be responsible for the ongoing management of the archived government records on behalf of the Province. 

6. The Digital Archives will protect personal information and provide access to the government records in accordance with the Information Management Act (IMA), the Freedom of Information and Protection of Privacy Act, and other relevant legislation.`;

	res.status(HTTP_STATUS_CODES.OK).send(agreementText);
});
