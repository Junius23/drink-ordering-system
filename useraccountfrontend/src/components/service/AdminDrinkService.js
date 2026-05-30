import axios from "axios";
import BASE_URL from "../../cors/config";

const BASE_URL = "http://localhost:2020";
//const BASE_URL = "http://192.168.0.110:2020"

const AdminDrinkService = {
  // 取得所有飲料
  async getAll(token) {
    const res = await axios.get(`${BASE_URL}/auth/drinks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // 新增飲料
  async create(drink, token) {
    const res = await axios.post(`${BASE_URL}/admin/drinks`, drink, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // 更新飲料
  async update(id, drink, token) {
    const res = await axios.put(`${BASE_URL}/admin/drinks/${id}`, drink, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // 刪除飲料
  async remove(id, token) {
    const res = await axios.delete(`${BASE_URL}/admin/drinks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ⭐ 上傳圖片（你缺少的部分）
  async uploadImage(file, token) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      `${BASE_URL}/admin/upload/drink-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },
};

export default AdminDrinkService;
