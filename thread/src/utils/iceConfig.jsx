// src/utils/iceConfig.js
import axios from 'axios';

export const getXirsysIceServers = async () => {
  const res = await axios.put(
    "https://global.xirsys.net/_turn/CloneInstagram", // 🔁 Đổi tên channel của bạn
    {},
    {
      headers: {
        Authorization: "Basic " + btoa("khoaturn:f90d0a14-6876-11f0-b9b0-0242ac130006") // 🔁 Dùng username & secret key từ Xirsys
      }
    }
  );

  return res.data?.v?.iceServers || [];
};
