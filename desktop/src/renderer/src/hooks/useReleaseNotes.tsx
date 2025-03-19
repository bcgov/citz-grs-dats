import { app } from 'electron';
import { useEffect, useState } from 'react';

export const useReleaseNotes = () => {
	const [api] = useState(window.api); // Preload scripts

	const [showModal, setShowModal] = useState(false);
	const [releaseNotes, setReleaseNotes] = useState<Record<
		string,
		string
	> | null>(null);
	const [appVersion, setAppVersion] = useState<string | null>(null);

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
		showModal,
		openModal: () => setShowModal(true),
		closeModal: () => setShowModal(false),
		releaseNotes,
		appVersion,
	};
};
