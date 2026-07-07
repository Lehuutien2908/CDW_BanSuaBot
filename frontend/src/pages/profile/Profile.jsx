import React, {useState, useEffect, useRef} from 'react';
import {FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiCamera} from 'react-icons/fi';
import {getProvinces, getDistricts, getWards} from '../../services/addressService';
import './profile.css';

// API dự kiến (BE sẽ triển khai sau):
// GET /api/users/profile        (header: Authorization: Bearer <token>)
//   -> { id, fullName, email, phone, address, avatar }
// PUT /api/users/profile        (header: Authorization: Bearer <token>)
//   body: { fullName, phone, address }
//   -> trả về thông tin đã cập nhật (giống response GET ở trên)
//
// Server sẽ đọc email của người dùng từ chính JWT token (không cần FE gửi email),
// nên không thể tự sửa thông tin của người khác dù có biết email của họ.

const Profile = () => {
    const token = sessionStorage.getItem('token');
    const userEmail = sessionStorage.getItem('userEmail');
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({fullName: '', phone: '', address: ''});

    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Address states
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [streetAddress, setStreetAddress] = useState('');

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            setErrorMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        setIsLoading(true);
        
        // Load provinces
        getProvinces()
            .then(data => setProvinces(data))
            .catch(err => console.error('Lỗi tải tỉnh/thành:', err));

        fetch('http://localhost:8080/api/users/profile', {
            headers: {'Authorization': `Bearer ${token}`}
        })
            .then(res => {
                if (!res.ok) throw new Error('Chưa có BE / không tải được hồ sơ');
                return res.json();
            })
            .then(data => {
                setProfile(data);
                setForm({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
                setIsLoading(false);
            })
            .catch(err => {
                console.warn(err.message);
                setErrorMessage('Không tải được thông tin hồ sơ. Vui lòng thử lại sau.');
                setIsLoading(false);
            });
    }, [token]);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    // Handle province change
    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        const province = provinces.find(p => p.code === parseInt(provinceCode));
        
        setSelectedProvince(province);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);

        if (provinceCode) {
            try {
                const districtData = await getDistricts(provinceCode);
                setDistricts(districtData);
            } catch (error) {
                console.error('Lỗi tải quận/huyện:', error);
            }
        }
    };

    // Handle district change
    const handleDistrictChange = async (e) => {
        const districtCode = e.target.value;
        const district = districts.find(d => d.code === parseInt(districtCode));
        
        setSelectedDistrict(district);
        setSelectedWard(null);
        setWards([]);

        if (districtCode) {
            try {
                const wardData = await getWards(districtCode);
                setWards(wardData);
            } catch (error) {
                console.error('Lỗi tải phường/xã:', error);
            }
        }
    };

    // Handle ward change
    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const ward = wards.find(w => w.code === parseInt(wardCode));
        setSelectedWard(ward);
    };

    const handleCancelEdit = () => {
        if (profile) {
            setForm({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                address: profile.address || ''
            });
        }
        setIsEditing(false);
        setErrorMessage('');
        
        // Reset address fields
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setStreetAddress('');
        setDistricts([]);
        setWards([]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!form.fullName.trim()) {
            setErrorMessage('Vui lòng nhập họ tên!');
            return;
        }

        // Build full address from components
        let fullAddress = '';
        
        // Nếu user đã chọn địa chỉ mới từ dropdown
        if (streetAddress || selectedWard || selectedDistrict || selectedProvince) {
            const addressParts = [];
            if (streetAddress.trim()) addressParts.push(streetAddress.trim());
            if (selectedWard) addressParts.push(selectedWard.name);
            if (selectedDistrict) addressParts.push(selectedDistrict.name);
            if (selectedProvince) addressParts.push(selectedProvince.name);
            
            fullAddress = addressParts.join(', ');
        } else {
            // Giữ nguyên địa chỉ cũ nếu không có thay đổi
            fullAddress = form.address || '';
        }

        console.log('Sending address:', fullAddress); // Debug log

        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim(),
                    address: fullAddress
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Cập nhật thất bại');
            }

            const updated = await response.json();
            console.log('Updated profile:', updated); // Debug log
            setProfile(updated);
            setForm({
                fullName: updated.fullName || '',
                phone: updated.phone || '',
                address: updated.address || ''
            });
            sessionStorage.setItem('userFullName', updated.fullName);
            setIsEditing(false);
            setSuccessMessage('Cập nhật thông tin thành công!');
            
            // Reset address form
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setStreetAddress('');
            setDistricts([]);
            setWards([]);
        } catch (err) {
            setErrorMessage(err.message || 'Lỗi kết nối server, vui lòng thử lại sau.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        if (!isUploadingAvatar) {
            fileInputRef.current?.click();
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Vui lòng chọn file ảnh!');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('Kích thước file không được vượt quá 5MB!');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');
        setIsUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8080/api/users/profile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Tải ảnh lên thất bại');
            }

            const updated = await response.json();
            setProfile(updated);
            setSuccessMessage('Cập nhật avatar thành công!');
            
            // Dispatch event để Header cập nhật avatar
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (err) {
            setErrorMessage(err.message || 'Lỗi khi tải ảnh lên server');
        } finally {
            setIsUploadingAvatar(false);
            // Reset input để có thể upload lại cùng file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isLoading) {
        return <div className="profile-loading">Đang tải thông tin hồ sơ...</div>;
    }

    return (
        <div className="profile-page">
            <h1 className="profile-page-title">Hồ Sơ Cá Nhân</h1>

            {errorMessage && <div className="profile-message error">{errorMessage}</div>}
            {successMessage && <div className="profile-message success">{successMessage}</div>}

            <div className="profile-card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar" onClick={handleAvatarClick}>
                            {profile?.avatar
                                ? <img src={`http://localhost:8080${profile.avatar}`} alt={profile.fullName}/>
                                : <FiUser size={48}/>
                            }
                            <div className={`profile-avatar-overlay ${isUploadingAvatar ? 'uploading' : ''}`}>
                                {isUploadingAvatar ? (
                                    <div className="spinner-small"></div>
                                ) : (
                                    <FiCamera size={24}/>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{display: 'none'}}
                        />
                    </div>
                    <h2 className="profile-name">{profile?.fullName || 'Người dùng'}</h2>
                    <p className="profile-email-tag">{profile?.email || userEmail}</p>
                </div>

                <form className="profile-form" onSubmit={handleSave}>
                    <div className="profile-form-header">
                        <h3>Thông tin liên hệ</h3>
                        {!isEditing ? (
                            <button
                                type="button"
                                className="profile-edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                <FiEdit2/> Chỉnh sửa
                            </button>
                        ) : (
                            <div className="profile-edit-actions">
                                <button type="submit" className="profile-save-btn" disabled={isSaving}>
                                    <FiSave/> {isSaving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                                <button type="button" className="profile-cancel-btn" onClick={handleCancelEdit}>
                                    <FiX/> Hủy
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-field">
                        <label><FiMail/> Email</label>
                        <input type="email" value={profile?.email || userEmail || ''} disabled/>
                    </div>

                    <div className="profile-field">
                        <label><FiUser/> Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Nhập họ và tên"
                        />
                    </div>

                    <div className="profile-field">
                        <label><FiPhone/> Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div className="profile-field">
                        <label><FiMapPin/> Địa chỉ</label>
                        {isEditing ? (
                            <div className="address-form">
                                <input
                                    type="text"
                                    placeholder="Số nhà, tên đường..."
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="address-input"
                                />
                                
                                <select 
                                    value={selectedProvince?.code || ''} 
                                    onChange={handleProvinceChange}
                                    className="address-select"
                                >
                                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                    {provinces.map(province => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>

                                <select 
                                    value={selectedDistrict?.code || ''} 
                                    onChange={handleDistrictChange}
                                    disabled={!selectedProvince}
                                    className="address-select"
                                >
                                    <option value="">-- Chọn Quận/Huyện --</option>
                                    {districts.map(district => (
                                        <option key={district.code} value={district.code}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>

                                <select 
                                    value={selectedWard?.code || ''} 
                                    onChange={handleWardChange}
                                    disabled={!selectedDistrict}
                                    className="address-select"
                                >
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map(ward => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={form.address}
                                disabled
                                placeholder="Chưa có địa chỉ"
                            />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
