import type { User } from "../../../types";
import { TableCell, TableCellText } from "../CustomerManagement/TableCell";
import { StatusBadge } from "../CustomerManagement/StatusBadge";
import { ActionButton } from "../CustomerManagement/ActionButton";

interface StaffTableRowProps {
  staff: User;
  onView: (staff: User) => void;
  onEdit: (staff: User) => void;
  onChangeRole: (staff: User) => void;
  onToggleStatus: (staff: User) => void;
}

export function StaffTableRow({
  staff,
  onView,
  onEdit,
  onChangeRole,
  onToggleStatus,
}: StaffTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-beige-50">
      <TableCell>
        <TableCellText className="font-medium">{staff.username}</TableCellText>
      </TableCell>
      <TableCell>
        <TableCellText>{staff.name}</TableCellText>
      </TableCell>
      <TableCell>
        <TableCellText variant="secondary">{staff.email}</TableCellText>
      </TableCell>
      <TableCell>
        <TableCellText variant="secondary">{staff.phone || "—"}</TableCellText>
      </TableCell>
      <TableCell align="center">
        <StatusBadge active={staff.active} />
      </TableCell>
      <TableCell align="center">
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            onClick={() => onView(staff)}
            icon="view"
            title="View Details"
          />
          <ActionButton
            onClick={() => onEdit(staff)}
            icon="edit"
            title="Edit"
          />
          <ActionButton
            onClick={() => onChangeRole(staff)}
            icon="role"
            title="Change Role"
          />
          <ActionButton
            onClick={() => onToggleStatus(staff)}
            icon={staff.active ? "deactivate" : "activate"}
            title={staff.active ? "Deactivate" : "Activate"}
          />
        </div>
      </TableCell>
    </tr>
  );
}
