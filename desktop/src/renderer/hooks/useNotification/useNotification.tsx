import { toast, ToastContainer, type ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getXlsxFileListNotificationData } from "./getXlsxFileListNotificationData";
import { Toast } from "@renderer/components";
export interface NotifyProps {
	success: boolean;
	title: string;
	message: string;
	error?: Error;
}

const toastConfig: ToastContainerProps = {
	position: "bottom-left",
	autoClose: 10000, // 10 seconds
	hideProgressBar: true,
	pauseOnHover: true,
	stacked: true,
};

export const useNotification = () => {
	const notify = {
		error: (props: NotifyProps) => {
			console.error(props.error || `${props.title}: ${props.message}`);
			toast.error(Toast, { data: props });
		},
		excelError: (msg: string) => {
			const notificationProps = getXlsxFileListNotificationData(msg);
			toast.error(Toast, {
				data: notificationProps,
			});
		},
		log: (message: string) => {
			console.log(message);
		},
		success: (props: NotifyProps) => {
			toast.success(Toast, { data: props });
		},
	};

	const NotificationContainer = () => <ToastContainer {...toastConfig} />;

	return { notify, NotificationContainer };
};
