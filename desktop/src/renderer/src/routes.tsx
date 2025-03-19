import { Route, Routes as ReactRoutes } from 'react-router';
import {
	EdrmsInstructionsPage,
	EdrmsTransferPage,
	FileListInstructionsPage,
	FileListPage,
	HomePage,
	LanInstructionsPage,
	LanTransferPage,
	SendRecordsPage,
	ViewTransfersPage,
} from './pages';

export const Routes = () => {
	return (
		<ReactRoutes>
			<Route
				path='/'
				element={<HomePage />}
			/>
			<Route
				path='/file-list/instructions'
				element={<FileListInstructionsPage />}
			/>
			<Route
				path='/file-list'
				element={<FileListPage />}
			/>
			<Route
				path='/send-records'
				element={<SendRecordsPage />}
			/>
			<Route
				path='/send-records/lan'
				element={<LanTransferPage />}
			/>
			<Route
				path='/send-records/edrms'
				element={<EdrmsTransferPage />}
			/>
			<Route
				path='/send-records/lan/instructions'
				element={<LanInstructionsPage />}
			/>
			<Route
				path='/send-records/edrms/instructions'
				element={<EdrmsInstructionsPage />}
			/>
			<Route
				path='/view-transfers'
				element={<ViewTransfersPage />}
			/>
		</ReactRoutes>
	);
};
