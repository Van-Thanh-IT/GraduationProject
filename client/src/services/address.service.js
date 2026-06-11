
import API from '@/api/API';

export const AddressService = {
  getMyAddresses: () => API.get('/api/user/addresses'),
  
  createAddress: (data) => API.post('/api/user/addresses', data),
  
  updateAddress: (id, data) => {
    return  API.put(`/user/addresses/${id}`, data)
  },
  
  deleteAddress: (id) => API.delete(`/api/user/addresses/${id}`),
  
  setDefaultAddress: (id) => API.patch(`/api/user/addresses/${id}/default`),
};