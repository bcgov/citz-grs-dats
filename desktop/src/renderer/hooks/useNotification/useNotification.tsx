import { toast, ToastContainer, type ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getXlsxFileListNotificationData } from "./getXlsxFileListNotificationData";
import { Toast } from "@renderer/components";
export interface NotifyProps {
	success: boolean;
	title: string;
	message: string;
	error?: string;
}

const toastConfig: ToastContainerProps = {
	position: "bottom-left",
	autoClose: 5000, // 5 seconds
	hideProgressBar: true,
	pauseOnHover: true,
	stacked: true,
};

export const useNotification = () => {
	const notify = {
		error: (props: NotifyProps | string) => {
			if (typeof props === "string") {
				console.error(new Error(props));
			} else {
				toast.error(Toast, {
					data: props,
					autoClose: 10000, // 10 seconds
				});
				console.error(new Error(props.error));
			}
		},
		excelError: (msg: string) => {
			const notificationProps = getXlsxFileListNotificationData(msg);
			toast.error(Toast, {
				data: notificationProps,
			});
		},
		log: (message: string, args?: Record<string, unknown>) => {
			if (args) {
				console.info(message, args);
			} else {
				console.info(message);
			}
		},
		success: (props: NotifyProps) => {
			toast.success(Toast, { data: props });
		},
	};

	const NotificationContainer = () => <ToastContainer {...toastConfig} />;

	return { notify, NotificationContainer };
};
