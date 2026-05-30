import React, { useRef } from "react";

const categories = ["茶類", "咖啡", "奶類", "果汁", "氣泡飲", "其他"];

const AdminDrinkForm = ({
  form,
  setForm,
  editId,
  onSubmit,
  onCancel,
  onUploadImage,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await onUploadImage(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form className="admin-drinks-form" onSubmit={onSubmit}>
      <h2>{editId === null ? "新增飲料" : `編輯飲料 #${editId}`}</h2>

      <label>
        名稱：
        <input
          type="text"
          name="name"
          value={form.name}
          placeholder="例如：綠茶"
          onChange={(e) =>
            setForm((p) => ({ ...p, name: e.target.value }))
          }
        />
      </label>

      <label>
        價格：
        <input
          type="number"
          name="price"
          value={form.price}
          placeholder="例如：30"
          min="0"
          onChange={(e) =>
            setForm((p) => ({ ...p, price: e.target.value }))
          }
        />
      </label>

      <label>
        分類：
        <select
          name="category"
          value={form.category}
          onChange={(e) =>
            setForm((p) => ({ ...p, category: e.target.value }))
          }
        >
          <option value="">請選擇分類</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        描述：
        <textarea
          name="description"
          value={form.description}
          rows={3}
          placeholder="簡單介紹飲料特色"
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </label>

      <label>
        上傳圖片：
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>

      {form.imageUrl && (
        <div className="drink-preview-box">
          <p>目前圖片預覽：</p>
          <img
            src={form.imageUrl}
            alt="preview"
            className="drink-preview-img"
            onError={(e) => {
              e.currentTarget.src = "/no-image.png";
            }}
          />
        </div>
      )}

      <div className="admin-drinks-form-buttons">
        <button type="submit">
          {editId === null ? "新增" : "儲存修改"}
        </button>

        {editId !== null && (
          <button type="button" onClick={onCancel}>
            取消編輯
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminDrinkForm;