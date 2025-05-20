import { toast } from "react-toastify";
import { Toast, } from "@renderer/components";

type NotifyProps = {
  success: boolean;
  title: string;
  message: string;
};

export const useNotification = () => {
  const notify = {
    error: (props: NotifyProps) => {
      toast.error(Toast, {
        data: props,
      });
    }
  }

  return {
    notify,
  };
}
