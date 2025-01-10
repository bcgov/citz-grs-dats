import { LanUploadFileListView } from "@renderer/components/transfer/lan-views";
import { useState } from "react";

type Props = {
  authenticated: boolean;
};

export const LanTransferPage = ({ authenticated }: Props) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [fileList, setFileList] = useState<File | undefined>(undefined);
  const [accession, setAccession] = useState<string | undefined | null>(null);
  const [application, setApplication] = useState<string | undefined | null>(
    null
  );
  const [confirmAccAppChecked, setConfirmAccAppChecked] =
    useState<boolean>(false);

  const onNextPress = () => {
    setCurrentViewIndex((prev) => prev + 1);
  };
  return (
    <>
      {currentViewIndex === 0 && (
        <LanUploadFileListView
          file={fileList}
          setFile={setFileList}
          accession={accession}
          application={application}
          confirmChecked={confirmAccAppChecked}
          setConfirmChecked={setConfirmAccAppChecked}
          onNextPress={onNextPress}
        />
      )}
    </>
  );
};
