import { RequestSuccess } from "./RequestSuccess";
import { RequestLoading } from "./RequestLoading";
import { RequestFailed } from "./RequestFailed";

type Props = {
  accession: string;
  application: string;
  wasRequestSuccessful: boolean | null;
  onNextPress: () => void;
  setCurrentPath?:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void);
  handleRetrySubmission: () => void;
  isLan: boolean;
};

export const FinishView = ({
  accession,
  application,
  wasRequestSuccessful,
  onNextPress,
  setCurrentPath,
  handleRetrySubmission,
  isLan,
}: Props) => {
  return (
    <>
      {wasRequestSuccessful && (
        <RequestSuccess
          accession={accession}
          application={application}
          onNextPress={onNextPress}
          isLan={isLan}
        />
      )}
      {wasRequestSuccessful === null && <RequestLoading />}
      {wasRequestSuccessful === false && (
        <RequestFailed
          // setCurrentPath={setCurrentPath}
          handleRetrySubmission={handleRetrySubmission}
        />
      )}
    </>
  );
};
