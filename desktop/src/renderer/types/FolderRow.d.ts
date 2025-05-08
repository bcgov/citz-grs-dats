export type FolderRow = {
  id: number;
  folder: string;
  schedule: string;
  classification: string;
  file: string;
  opr: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  soDate: Dayjs | null;
  fdDate: Dayjs | null;
  progress: number;
};
