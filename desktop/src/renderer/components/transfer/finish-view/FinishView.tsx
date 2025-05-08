import { RequestFailed } from "./RequestFailed";
import { RequestLoading } from "./RequestLoading";
import { RequestSuccess } from "./RequestSuccess";

type Props = {
  accession: string;
  application: string;
  wasRequestSuccessful: boolean | null;
  onNextPress: () => void;
  handleRetrySubmission: () => void;
  isLan: boolean;
};

export const FinishView = ({
  accession,
  application,
  wasRequestSuccessful,
  onNextPress,
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
          handleRetrySubmission={handleRetrySubmission}
        />
      )}
    </>
  );
};
