import { RequestSuccess } from "./RequestSuccess";
import { RequestLoading } from "./RequestLoading";
import { RequestFailed } from "./RequestFailed";

type Props = {
  accession: string;
  application: string;
  wasRequestSuccessful: boolean | null;
  onNextPress: () => void;
};

export const LanFinishView = ({
  accession,
  application,
  wasRequestSuccessful,
  onNextPress,
}: Props) => {
  return (
    <>
      {wasRequestSuccessful && (
        <RequestSuccess
          accession={accession}
          application={application}
          onNextPress={onNextPress}
        />
      )}
      {wasRequestSuccessful === null && <RequestLoading />}
      {!wasRequestSuccessful && <RequestFailed />}
    </>
  );
};
