import type { User } from "../../../types";
import { TableCell, TableCellText } from "./TableCell";
import { StatusBadge } from "./StatusBadge";
import { ActionButton } from "./ActionButton";

interface CustomerTableRowProps {
  customer: User;
  onView: (customer: User) => void;
  onEdit: (customer: User) => void;
  onChangeRole: (customer: User) => void;
  onToggleStatus: (customer: User) => void;
}

export function CustomerTableRow({
  customer,
  onView,
  onEdit,
  onChangeRole,
  onToggleStatus,
}: CustomerTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-beige-50">
      <TableCell>
        <TableCellText className="font-medium">{customer.username}</TableCellText>
      </TableCell>
      <TableCell>
        <TableCellText>{customer.name}</TableCellText>
      </TableCell>
      <TableCell>
        <TableCellText variant="secondary">{customer.email}</TableCellText>
      </TableCell>
      <TableCell>
        <TableCellText variant="secondary">{customer.phone || "—"}</TableCellText>
      </TableCell>
      <TableCell align="center">
        <StatusBadge active={customer.active} />
      </TableCell>
      <TableCell align="center">
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            onClick={() => onView(customer)}
            icon="view"
            title="View Details"
          />
          <ActionButton
            onClick={() => onEdit(customer)}
            icon="edit"
            title="Edit"
          />
          <ActionButton
            onClick={() => onChangeRole(customer)}
            icon="role"
            title="Change Role"
          />
          <ActionButton
            onClick={() => onToggleStatus(customer)}
            icon={customer.active ? "deactivate" : "activate"}
            title={customer.active ? "Deactivate" : "Activate"}
          />
        </div>
      </TableCell>
    </tr>
  );
}
