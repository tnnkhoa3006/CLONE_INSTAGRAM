import api from './axios';

export const followOrUnfollowUser = async (userId) => {
  return api.post(`/user/followorunfollow/${userId}`, {}, { withCredentials: true });
};
