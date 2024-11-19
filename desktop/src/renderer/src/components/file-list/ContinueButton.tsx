export const ContinueButton = (): JSX.Element => {
	const handleClick = async () => {
		console.log("TODO: THIS");
	};

	return (
		<button className="file-list-button" type="button" onClick={handleClick}>
			Continue
		</button>
	);
};
