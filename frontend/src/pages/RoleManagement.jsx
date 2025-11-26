import React, { useState, useEffect } from 'react';
import rolesService from '../api/roles';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import './RoleManagement.css';

export default function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesData, permissionsData] = await Promise.all([
                rolesService.getRoles(),
                rolesService.getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (error) {
            console.error('Error fetching roles/permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions.map(p => p.id)
            });
        } else {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData({ name: '', description: '', permissions: [] });
    };

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const newPerms = prev.permissions.includes(permId)
                ? prev.permissions.filter(id => id !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editingRole) {
                await rolesService.updateRole(editingRole.id, formData);
            } else {
                await rolesService.createRole(formData);
            }
            await fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving role:', error);
            alert('Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (roleId) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await rolesService.deleteRole(roleId);
            await fetchData();
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Failed to delete role');
        }
    };

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
    }, {});

    if (loading) return <LoadingSpinner message="Loading roles..." />;

    return (
        <div className="role-management">
            <div className="role-header">
                <h2>Roles & Permissions</h2>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    + Create Role
                </button>
            </div>

            <div className="roles-grid">
                {roles.map(role => (
                    <div key={role.id} className="role-card">
                        <div className="role-card-header">
                            <h3>{role.name}</h3>
                            <div className="role-actions">
                                <button onClick={() => handleOpenModal(role)} className="btn-icon">✏️</button>
                                <button onClick={() => handleDelete(role.id)} className="btn-icon delete">🗑️</button>
                            </div>
                        </div>
                        <p className="role-desc">{role.description || 'No description'}</p>
                        <div className="role-perms-summary">
                            <strong>Permissions:</strong> {role.permissions.length}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingRole ? 'Edit Role' : 'Create Role'}
                footer={
                    <>
                        <button className="btn-secondary" onClick={handleCloseModal} disabled={saving}>Cancel</button>
                        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Role'}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label>Role Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. finance_manager"
                        disabled={editingRole} // Prevent renaming for simplicity/safety
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Role description"
                    />
                </div>

                <div className="permissions-section">
                    <h4>Permissions</h4>
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource} className="perm-group">
                            <h5 className="perm-group-title">{resource.toUpperCase()}</h5>
                            <div className="perm-list">
                                {perms.map(perm => (
                                    <label key={perm.id} className="perm-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.includes(perm.id)}
                                            onChange={() => handlePermissionToggle(perm.id)}
                                        />
                                        <span title={perm.description}>{perm.action}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
