import {
  InputBase,
  type InputBaseProps
} from "@mui/material";
import { styled } from "@mui/material/styles";

const GridEditDateInput = styled(InputBase)({
	fontSize: "inherit",
	padding: "0 9px",
});

export const WrappedGridEditDateInput = (props) => {
	const { InputProps, focused, ...other } = props;
	return (
		<GridEditDateInput
			fullWidth
			{...InputProps}
			{...(other as InputBaseProps)}
		/>
	);
};
