import React, {useState, useEffect} from 'react';
import {FiUsers, FiSearch, FiMail, FiPhone, FiCheckCircle, FiXCircle} from 'react-icons/fi';
import './management.css';

const CustomerManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            
            if (!response.ok) throw new Error('Không thể tải danh sách khách hàng');
            
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`}
            });
            
            if (!response.ok) throw new Error('Không thể cập nhật trạng thái');
            
            const updatedUser = await response.json();
            setUsers(users.map(u => u.id === userId ? updatedUser : u));
            alert(`Đã ${updatedUser.enabled ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`);
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <h1><FiUsers/> Quản lý Khách hàng</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="search-bar-admin">
                <FiSearch/>
                <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Vai trò</th>
                            <th>Đơn hàng</th>
                            <th>Tổng chi tiêu</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="empty-row">Không có khách hàng nào</td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td className="user-name">{user.fullName}</td>
                                    <td>
                                        <div className="contact-cell">
                                            <FiMail size={14}/>
                                            {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <FiPhone size={14}/>
                                            {user.phone || '-'}
                                        </div>
                                    </td>
                                    <td className="address-cell">{user.address || '-'}</td>
                                    <td>
                                        <div className="roles-cell">
                                            {user.roles.map((role, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className={`role-badge ${role.includes('ADMIN') ? 'role-admin' : 'role-user'}`}
                                                >
                                                    {role.replace('ROLE_', '')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="center-cell">{user.totalOrders}</td>
                                    <td className="price-cell">{user.totalSpent.toLocaleString('vi-VN')}₫</td>
                                    <td className="center-cell">
                                        {user.enabled ? (
                                            <span className="status-badge status-active">
                                                <FiCheckCircle size={14}/> Hoạt động
                                            </span>
                                        ) : (
                                            <span className="status-badge status-inactive">
                                                <FiXCircle size={14}/> Vô hiệu
                                            </span>
                                        )}
                                    </td>
                                    <td className="center-cell">
                                        {!user.roles.includes('ROLE_ADMIN') && (
                                            <button
                                                className={`btn-toggle ${user.enabled ? 'btn-disable' : 'btn-enable'}`}
                                                onClick={() => handleToggleStatus(user.id)}
                                                title={user.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            >
                                                {user.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                <span>Tổng: {filteredUsers.length} khách hàng</span>
            </div>
        </div>
    );
};

export default CustomerManagement;
