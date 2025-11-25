import { ManagementLayout } from "../Shared/Management/ManagementLayout";
import { Notifications } from "../CustomerProfile/Notifications";

export function AdminNotifications() {
  return (
    <ManagementLayout>
      <div className="p-8">
        <Notifications />
      </div>
    </ManagementLayout>
  );
}
