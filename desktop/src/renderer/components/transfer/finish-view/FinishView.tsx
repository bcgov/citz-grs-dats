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
  loadingMessage?: string | null;
};

export const FinishView = ({
  accession,
  application,
  wasRequestSuccessful,
  onNextPress,
  handleRetrySubmission,
  isLan,
  loadingMessage = null
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
      {wasRequestSuccessful === null && <RequestLoading loadingMessage={loadingMessage} />}
      {wasRequestSuccessful === false && (
        <RequestFailed
          handleRetrySubmission={handleRetrySubmission}
        />
      )}
    </>
  );
};
