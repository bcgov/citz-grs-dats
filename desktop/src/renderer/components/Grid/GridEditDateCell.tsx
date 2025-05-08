import { useGridApiContext, type GridRenderEditCellParams } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { FolderRow } from "@/renderer/types";
import type { Dayjs } from "dayjs";
import { WrappedGridEditDateInput } from "./WrappedGridEditDateInput";

export const GridEditDateCell = ({
	id,
	field,
	value,
}: GridRenderEditCellParams<FolderRow, Dayjs | null, string>) => {
	const apiRef = useGridApiContext();

	const handleChange = (newValue: Dayjs | null) => {
		apiRef.current.setEditCellValue({ id, field, value: newValue });
	};

	return (
		<DatePicker
			value={value}
			onChange={handleChange}
			format="YYYY/MM/DD"
			slots={{ textField: WrappedGridEditDateInput }}
		/>
	);
};
