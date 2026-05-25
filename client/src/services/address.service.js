
import API from '@/api/API';

export const AddressService = {
  getMyAddresses: () => API.get('/user/addresses'),
  
  createAddress: (data) => API.post('/user/addresses', data),
  
  updateAddress: (id, data) => {
    console.log(data);
    return  API.put(`/user/addresses/${id}`, data)
  },
  
  deleteAddress: (id) => API.delete(`/user/addresses/${id}`),
  
  setDefaultAddress: (id) => API.patch(`/user/addresses/${id}/default`),
};