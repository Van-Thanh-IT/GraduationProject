import API from "@/api/API";

export const AuthService = {
  register: async (data) => {
    const response = await API.post("/auth/register", data);
    return response.data;
  },

  login: async (data) => {
    const response = await API.post("/auth/login", data);
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await API.post("/auth/google-login", idToken);
    return response.data;
  },

  facebookLogin: async (accessToken) => {
    const response = await API.post("/auth/facebook-login", accessToken);
    return response.data;
  },

  getMe: async () => {
    const response = await API.get("profile/me");
    return response.data;
  },

  sendOtp: async (email) => {
    const response = await API.post("/auth/otp/send", null, {
      params: { email },
    });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await API.post("/auth/otp/verify", null, {
      params: { email, otp },
    });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await API.post("/auth/reset-password", data);
    return response.data;
  },
};