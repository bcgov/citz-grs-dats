import * as fs from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';
import logger from '../config/logs/winston-config';
import * as readline from 'readline';
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

export interface DigitalTransferDataModel {
  transferData: TransferData;
  digitalFileListData: DigitalFileListData[];
}

export interface IDataExtractor {
  extractTransferData(buffer: Buffer): Promise<TransferData>;

  extractDigitalFileData(buffer: Buffer): Promise<DigitalFileListData[]>;

  extractDigitalFileAndTransferData(buffer: Buffer): Promise<DigitalTransferDataModel>;
}

export class CSVDataExtractor implements IDataExtractor {

  extractDigitalFileAndTransferData(buffer: Buffer): Promise<DigitalTransferDataModel> {
    return new Promise((resolve, reject) => {
      try {
        const lines = buffer.toString('utf-8').split('\n');
        const headers = lines[0].split('\t');
  
        let transferData: TransferData = {
          accession: '',
          application: '',
          ministry: '',
          branch: '',
          folders: []
        };
  
        let digitalFileListData: DigitalFileListData[] = [];
        let foldersSet: Set<string> = new Set();
  
        // Column indices
        const accessionIdx = headers.indexOf('Accession Number');
        const applicationIdx = headers.indexOf('Consignment (Application)');
        const ministryIdx = headers.indexOf('Provenance');
        const branchIdx = headers.indexOf('Owner: Name Owner: ID Number');
        const containerIdx = headers.indexOf('Container (Folder/Box)');
        const dosFileIdx = headers.indexOf('DOS file');
        const retrievalCodeIdx = headers.indexOf('Retrieval Code');
        const titleIdx = headers.indexOf('Title (Structured Part)');
        const seriesRecordIdx = headers.indexOf('Series record');
        const startDateIdx = headers.indexOf('Start Date');
        const endDateIdx = headers.indexOf('End Date');
        const soDateIdx = headers.indexOf('SO Date');
        const disposalDateIdx = headers.indexOf('Date of Disposal');
  
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split('\t');
  
          // Extract TransferData fields if not already set
          if (!transferData.accession && row[accessionIdx]) {
            transferData.accession = row[accessionIdx];
          }
          if (!transferData.application && row[applicationIdx]) {
            transferData.application = row[applicationIdx];
          }
          if (!transferData.ministry && row[ministryIdx]) {
            transferData.ministry = row[ministryIdx];
          }
          if (!transferData.branch && row[branchIdx]) {
            transferData.branch = row[branchIdx];
          }
  
          // Process folders and add to foldersSet
          if (row[containerIdx]) {
            const folderParts = row[containerIdx].split('/');
            if (folderParts.length > 1) {
              const folder = folderParts[1].trim();
              if (!foldersSet.has(folder)) {
                foldersSet.add(folder);
  
                // If unique folder, create DigitalFileListData entry
                if (row[dosFileIdx]) {
                  const containerValue = row[containerIdx];
                  // Correctly extract primarySecondary by taking everything after the first hyphen up to the slash
                  const primarySecondaryMatch = containerValue.match(/-(.*?)(\/|$)/);
                  const primarySecondary = primarySecondaryMatch ? primarySecondaryMatch[1].trim() : '';
  
                  const isOPR = row[seriesRecordIdx]?.toLowerCase() === 'true';
  
                  digitalFileListData.push({
                    folder: folder,
                    schedule: '',
                    primarySecondary,
                    fileId: row[retrievalCodeIdx],
                    description: row[titleIdx],
                    isOPR,
                    startDate: row[startDateIdx],
                    endDate: row[endDateIdx],
                    soDate: row[soDateIdx],
                    finalDispositionDate: row[disposalDateIdx],
                  });
                }
              }
            }
          }
        }
  
        // Convert folders Set to Array and assign to transferData.folders
        transferData.folders = Array.from(foldersSet);
  
        const digitalTransferDataModel: DigitalTransferDataModel = {
          transferData,
          digitalFileListData
        };
  
        // Resolve the promise with the constructed data model
        resolve(digitalTransferDataModel);
      } catch (error) {
        // Reject the promise with an error if something goes wrong
        reject(error);
      }
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

