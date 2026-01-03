import { http } from 'cosey';

const Api = {
  Login: '/rbac/auth/login',
  UserInfo: '/rbac/auth/info',
  ChangePassword: '/rbac/auth/change-password',
};

export default {
  login: async (data: any) => {
    const res = await http.post(Api.Login, data);
    return res.token as string;
  },

  getUserInfo: () => {
    return http.get<{
      id: number;
      username: string;
      nickname: string;
      avatar: string;
      superAdmin: boolean;
      permissions: any[];
    }>(Api.UserInfo);
  },

  changePassword: (data: any) => {
    return http.post(Api.ChangePassword, data);
  },
};
