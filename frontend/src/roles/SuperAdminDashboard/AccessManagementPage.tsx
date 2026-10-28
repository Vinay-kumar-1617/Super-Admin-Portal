import ApprovalLimitsPage from './ApprovalLimitsPage'
import RolesPermissionsPage from './RolesPermissionsPage'
import SessionsDevicesPage from './SessionsDevicesPage'
import UsersPage from './UsersPage'
import type { StaffAccount } from './staffData'
import { accessSections, type AccessSection } from './accessManagementSections'
import { useState } from 'react'

type AccessManagementPageProps = {
  section: AccessSection
  staff: StaffAccount[]
  setStaff: React.Dispatch<React.SetStateAction<StaffAccount[]>>
  onNavigate: (section: AccessSection) => void
  onBack: () => void
}

export default function AccessManagementPage({
  section,
  staff,
  setStaff,
  onNavigate,
  onBack,
}: AccessManagementPageProps) {
  const [addUserRequest, setAddUserRequest] = useState(0)

  return (
    <div className="access-management-page">
      <style>{`
        .access-management-page { display: grid; gap: 18px; min-width: 0; }
        .access-management-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 8px;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--brand-orange);
          font: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
        }
        .access-management-back:hover { color: #c94310; text-decoration: underline; }
        .access-management-back:focus-visible { outline: 3px solid rgba(255, 107, 44, 0.4); outline-offset: 4px; }
        .access-management-tabs { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .access-management-add-user { margin-left: auto; }
        .access-management-tab {
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: #fff;
          border-radius: 999px;
          padding: 8px 14px;
          color: #475569;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .access-management-tab:hover { border-color: rgba(255, 107, 44, 0.4); color: #c94310; }
        .access-management-tab.active {
          border-color: transparent;
          background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep));
          color: #fff;
          box-shadow: 0 10px 22px -10px rgba(239, 74, 18, 0.7);
        }
      `}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="access-management-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          <h1 className="header-title">{section}</h1>
        </div>
        <span className="chip active">Organization &amp; Access</span>
      </header>

      <nav className="access-management-tabs" aria-label="Users and access sections">
        {accessSections.map((item) => (
          <button
            key={item}
            type="button"
            className={`access-management-tab ${section === item ? 'active' : ''}`}
            aria-current={section === item ? 'page' : undefined}
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
        {section === 'Users' && (
          <button type="button" className="um-primary access-management-add-user" onClick={() => setAddUserRequest((count) => count + 1)}>
            + Add User
          </button>
        )}
      </nav>

      <div hidden={section !== 'Users'}><UsersPage embedded addUserRequest={addUserRequest} /></div>
      <div hidden={section !== 'Roles & Permissions'}><RolesPermissionsPage embedded staff={staff} /></div>
      <div hidden={section !== 'Approval Limits'}><ApprovalLimitsPage staff={staff} setStaff={setStaff} embedded /></div>
      <div hidden={section !== 'Sessions & Devices'}><SessionsDevicesPage staff={staff} setStaff={setStaff} embedded /></div>
    </div>
  )
}
