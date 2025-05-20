import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getXlsxFileListNotificationData } from "./getXlsxFileListNotificationData";

export interface NotifyProps {
	success: boolean;
	title: string;
	message: string;
}

export const useNotification = () => {
	const notify = {
		error: (props: NotifyProps) => {
			toast.error(props.message);
		},
    excelError: (msg: string) => {
      const notificationProps = getXlsxFileListNotificationData(msg);
      toast.error(notificationProps.message, {
        data: notificationProps,
      });
    },
    log: (message: string) => {
      console.log(message);
    },
		success: (props: NotifyProps) => {
			toast.success(props.message);
		},
	};



	const NotificationContainer = () => (
		<ToastContainer position="bottom-left" autoClose={4000} hideProgressBar pauseOnHover stacked />
	);

	return { notify, NotificationContainer };
};
