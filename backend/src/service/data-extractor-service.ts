import * as fs from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';

export interface TransferData {
    accession: string;
    application: string;
    ministry: string;
    branch: string;
    folders: string[];
  }
  export interface DigitalFileListData {
    folder: string;
    schedule: string;
    primarySecondary: string;
    fileId: string;
    description: string;
    isOPR: boolean;
    startDate: string;
    endDate: string;
    soDate: string;
    finalDispositionDate: string;
    transfer?: string;
  }

  export interface DigitalTransferDataModel
  {
    transferData: TransferData;
    digitalFileListData: DigitalFileListData[];
  }

export interface IDataExtractor {
    extractTransferData(buffer: Buffer): Promise<TransferData>;

    extractDigitalFileData(buffer: Buffer): Promise<DigitalFileListData[]>;

    extractDigitalFileAndTransferData(buffer: Buffer): Promise<DigitalTransferDataModel>;
  }

export class CSVDataExtractor implements IDataExtractor
{
    extractDigitalFileAndTransferData(buffer: Buffer): Promise<DigitalTransferDataModel> {
        return new Promise((resolve, reject) => {
            const dataMap = new Map<string, TransferData>();
            const digitalFileListData: DigitalFileListData[] = [];
            
            Readable.from(buffer)
              .pipe(csv({ separator: '\t' }))
              .on('data', (row) => {
                const accession = row['Accession Number'] || '';
                const application = row['Consignment (Application)'] || '';
                const ministry = row['Provenance'] || '';
                const branch = `${row['Owner: Name'] || ''} ${row['Owner: ID Number'] || ''}`;
                const folder = row['Container (Folder/Box)'] || '';
      
                if (!dataMap.has(accession)) {
                  dataMap.set(accession, {
                    accession,
                    application,
                    ministry,
                    branch,
                    folders: [folder],
                  });
                } else {
                  const existingData = dataMap.get(accession);
                  if (existingData) {
                    existingData.folders.push(folder);
                    if(ministry) {
                      existingData.ministry = ministry;
                    }
                  }
                }
                if(folder === '')
                {
                  return;
                }
                var input = row['Classification'];
                // Define a regular expression to match the pattern
                // Explanation:
                // ^(\w{3,4}) - Matches the acronym which can be 3 or 4 letters
                // - - Matches the hyphen
                // (\d{5}-\d{2}) - Matches the second part (e.g., 00201-40)
                // : - Matches the colon
                // \s* - Matches any whitespace between the colon and the third part
                // (\d+) - Matches the third part which is a sequence of digits
                const regex = /^(\w{3,4})-(\d{5}-\d{2})\s*:\s*(\d+)$/;

                // Apply the regex to the input string
                const match = input.match(regex);
                var scheduleAcronym  = '';
                var primarySecondary = '';
                var scheduleId = '';
                if (match) {
                  // Extract the groups from the match result and trim any whitespace
                  scheduleAcronym = match[1].trim();
                  primarySecondary = match[2].trim();
                  scheduleId = match[3].trim();
                } 
                const data: DigitalFileListData = {
                    folder: folder,
                    schedule: scheduleId,
                    primarySecondary: primarySecondary,
                    fileId: row['Retrieval Code'] || '',
                    description: row['Title (Structured Part)'] || '',
                    isOPR: row['Series record'] ==='Y' || false,
                    startDate: row['Start Date'] || '',
                    endDate: row['End Date'] || '',
                    soDate: row['SO Date'] || '',
                    finalDispositionDate: row['Date of Disposal'] || ''
                  };
                  digitalFileListData.push(data);
              })
              .on('end', () => {
                if (dataMap.size > 0) {
                    const transferData = Array.from(dataMap.values())[0];
                  resolve({transferData,  digitalFileListData});
                } else {
                  reject(new Error('No data found'));
                }
              })
              .on('error', (error) => {
                reject(error);
              });
          });
    }
    extractTransferData(buffer: Buffer): Promise<TransferData> {
        return new Promise((resolve, reject) => {
            const dataMap = new Map<string, TransferData>();

            Readable.from(buffer)
              .pipe(csv({ separator: '\t' }))
              .on('data', (row) => {
                const accession = row['Accession Number'] || '';
                const application = row['Consignment(Application)'] || '';
                const ministry = row['Provenance'] || '';
                const branch = `${row['Owner: Name'] || ''} ${row['Owner: ID Number'] || ''}`;
                const folder = row['Container (Folder/Box)'] || '';
      
                if (!dataMap.has(accession)) {
                  dataMap.set(accession, {
                    accession,
                    application,
                    ministry,
                    branch,
                    folders: [folder],
                  });
                } else {
                  const existingData = dataMap.get(accession);
                  if (existingData) {
                    existingData.folders.push(folder);
                  }
                }
              })
              .on('end', () => {
                if (dataMap.size > 0) {
                  resolve(Array.from(dataMap.values())[0]);
                } else {
                  reject(new Error('No data found'));
                }
              })
              .on('error', (error) => {
                reject(error);
              });
          });
    
        }

        extractDigitalFileData(buffer: Buffer): Promise<DigitalFileListData[]> {
            return new Promise((resolve, reject) => {
              const results: DigitalFileListData[] = [];
        
              Readable.from(buffer)
                .pipe(csv({ separator: '\t' }))
                .on('data', (row) => {
                  const data: DigitalFileListData = {
                    folder: row['Container (Folder/Box)'] || '',
                    schedule: row['Schedule'] || '',
                    primarySecondary: row['Primary / Secondary'] || '',
                    fileId: row['Retrieval Code'] || '',
                    description: row['Title (Structured Part)'] || '',
                    isOPR: row['Series record'] === 'Y' || false,
                    startDate: row['Start Date'] || '',
                    endDate: row['End Date'] || '',
                    soDate: row['SO Date'] || '',
                    finalDispositionDate: row['Date of Disposal'] || ''
                  };
                  results.push(data);
                })
                .on('end', () => {
                  resolve(results);
                })
                .on('error', (error) => {
                  reject(error);
                });
            });
          }
}

