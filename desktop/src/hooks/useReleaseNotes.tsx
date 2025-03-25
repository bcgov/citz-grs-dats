import { ReleaseNotesModal } from '@renderer/components';
import { useEffect, useState } from 'react';

export const useReleaseNotes = () => {
	const [api] = useState(window.api); // Preload scripts

	const [showModal, setShowModal] = useState(false);
	const [releaseNotes, setReleaseNotes] = useState<Record<
		string,
		string
	> | null>(null);
	const [appVersion, setAppVersion] = useState<string | null>(null);

	const handleClose = async () => {
		await api.updateViewedReleaseVersion();
		setShowModal(false);
	};

	const fetchReleaseNotes = async () => {
		const notes = await api.getReleaseNotes();
		const version = await api.getCurrentAppVersion();
		setReleaseNotes(notes);
		setAppVersion(version);
	};

	useEffect(() => {
		fetchReleaseNotes();
	}, []);

	useEffect(() => {
		if (appVersion && releaseNotes) setShowModal(true);
	}, [appVersion, releaseNotes]);

	return {
		ReleaseNotesModal: () => (
			<ReleaseNotesModal
				open={showModal}
				onClose={handleClose}
				releaseNotes={releaseNotes}
				appVersion={appVersion}
			/>
		),
		showModal,
		openModal: () => setShowModal(true),
		closeModal: () => setShowModal(false),
		releaseNotes,
		appVersion,
	};
};
