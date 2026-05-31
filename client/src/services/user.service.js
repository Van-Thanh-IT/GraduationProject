import API from "@/api/API";

export const UserService = {
  getUsers: (role) => API.get('/api/admin/users', { params: { role } }),
  
  createStaff: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return API.post('/api/admin/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateStatus: (userId, status) => 
    API.patch(`/api/admin/users/${userId}/status`, null, { params: { status } })
};