import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminDrinkPage.css";

import AdminDrinkForm from "./AdminDrinkForm";
import AdminDrinkList from "./AdminDrinkList";
import BASE_URL from "../../cors/config";

const emptyForm = {
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  category: "",
  active: true,
  soldOut: false,
};

const DRINK_TIME_STORAGE_KEY = "drinkStatusTimes";
const DRINK_DISPLAY_SETTING_KEY = "drinkAdminDisplaySettings";

const defaultDisplaySettings = {
  fontSize: "normal",
  fontWeight: "normal",
  rowDensity: "normal",
  highContrast: false,
};

const AdminDrinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 圖片放大預覽
  const [previewImage, setPreviewImage] = useState(null);

  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem(DRINK_DISPLAY_SETTING_KEY);

    if (saved) {
      return {
        ...defaultDisplaySettings,
        ...JSON.parse(saved),
      };
    }

    return defaultDisplaySettings;
  });

  const [drinkTimes, setDrinkTimes] = useState(() => {
    const saved = localStorage.getItem(DRINK_TIME_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
  };

  const updateDisplaySetting = (key, value) => {
    const nextSettings = {
      ...displaySettings,
      [key]: value,
    };

    setDisplaySettings(nextSettings);
    localStorage.setItem(
      DRINK_DISPLAY_SETTING_KEY,
      JSON.stringify(nextSettings)
    );
  };

  const resetDisplaySettings = () => {
    setDisplaySettings(defaultDisplaySettings);
    localStorage.setItem(
      DRINK_DISPLAY_SETTING_KEY,
      JSON.stringify(defaultDisplaySettings)
    );
  };

  const getDisplayClassName = () => {
    return [
      "admin-drinks-page",
      `font-size-${displaySettings.fontSize}`,
      `font-weight-${displaySettings.fontWeight}`,
      `row-density-${displaySettings.rowDensity}`,
      displaySettings.highContrast ? "high-contrast" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getNowText = () => {
    return new Date().toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const saveDrinkTimes = (nextTimes) => {
    setDrinkTimes(nextTimes);
    localStorage.setItem(DRINK_TIME_STORAGE_KEY, JSON.stringify(nextTimes));
  };

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      setMsg("");

      const res = await axios.get(`${BASE_URL}/admin/drinks`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      setDrinks(res.data || []);
    } catch (err) {
      console.error("載入飲料錯誤：", err);
      setMsg("載入飲料失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
      const keyword = normalizeText(searchText);

      const matchSearch =
        keyword === "" ||
        normalizeText(drink.name).includes(keyword) ||
        normalizeText(drink.category).includes(keyword) ||
        normalizeText(drink.description).includes(keyword);

      let matchStatus = true;

      if (statusFilter === "ACTIVE") {
        matchStatus = drink.active === true;
      }

      if (statusFilter === "INACTIVE") {
        matchStatus = drink.active === false;
      }

      if (statusFilter === "SOLD_OUT") {
        matchStatus = drink.soldOut === true;
      }

      if (statusFilter === "NORMAL") {
        matchStatus = drink.soldOut === false;
      }

      return matchSearch && matchStatus;
    });
  }, [drinks, searchText, statusFilter]);

  if (role !== "ADMIN") {
    return <p style={{ padding: 20 }}>你不是管理員，不能使用此頁面。</p>;
  }

  const handleUploadImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setMsg("");

      const res = await axios.post(
        `${BASE_URL}/admin/upload/drink-image`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const fullUrl = res.data;

      setForm((prev) => ({
        ...prev,
        imageUrl: fullUrl,
      }));

      setMsg("圖片上傳成功！");
    } catch (err) {
      console.error("圖片上傳失敗：", err.response || err);
      setMsg("圖片上傳失敗");
    }
  };

  const updateDrinkTimeAfterSave = (drinkId, oldDrink, payload) => {
    if (!drinkId) return;

    const nowText = getNowText();
    const oldActive = oldDrink ? oldDrink.active === true : null;
    const newActive = payload.active === true;

    const currentTime = drinkTimes[drinkId] || {};
    const nextTimes = {
      ...drinkTimes,
    };

    if (!oldDrink && newActive) {
      nextTimes[drinkId] = {
        ...currentTime,
        listedAt: currentTime.listedAt || nowText,
        unlistedAt: currentTime.unlistedAt || "",
      };

      saveDrinkTimes(nextTimes);
      return;
    }

    if (oldActive === false && newActive === true) {
      nextTimes[drinkId] = {
        ...currentTime,
        listedAt: nowText,
      };

      saveDrinkTimes(nextTimes);
      return;
    }

    if (oldActive === true && newActive === false) {
      nextTimes[drinkId] = {
        ...currentTime,
        unlistedAt: nowText,
      };

      saveDrinkTimes(nextTimes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      setMsg("名稱與價格不可空白");
      return;
    }

    if (!form.category) {
      setMsg("請選擇分類");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const payload = {
        ...form,
        price: Number(form.price),
        active: form.active === true,
        soldOut: form.soldOut === true,
      };

      if (editId === null) {
        const res = await axios.post(`${BASE_URL}/admin/drinks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newDrinkId = res.data?.id;

        if (newDrinkId) {
          updateDrinkTimeAfterSave(newDrinkId, null, payload);
        }

        setMsg("新增飲料成功");
      } else {
        const oldDrink = drinks.find(
          (drink) => String(drink.id) === String(editId)
        );

        await axios.put(`${BASE_URL}/admin/drinks/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        updateDrinkTimeAfterSave(editId, oldDrink, payload);

        setMsg("更新飲料成功");
      }

      setForm(emptyForm);
      setEditId(null);
      await fetchDrinks();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("儲存飲料失敗：", err.response || err);
      setMsg("儲存飲料失敗：" + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (drink) => {
    const newActive = !drink.active;

    const ok = window.confirm(
      `確定要將「${drink.name}」改成「${newActive ? "上架" : "下架"}」嗎？`
    );

    if (!ok) return;

    try {
      setLoading(true);
      setMsg("");

      const payload = {
        name: drink.name || "",
        price: Number(drink.price || 0),
        description: drink.description || "",
        imageUrl: drink.imageUrl || "",
        category: drink.category || "",
        active: newActive,
        soldOut: drink.soldOut === true,
      };

      await axios.put(`${BASE_URL}/admin/drinks/${drink.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateDrinkTimeAfterSave(drink.id, drink, payload);

      setMsg(`「${drink.name}」已${newActive ? "上架" : "下架"}`);
      await fetchDrinks();
    } catch (err) {
      console.error("切換上架狀態失敗：", err.response || err);
      setMsg("切換上架狀態失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSoldOut = async (drink) => {
    const newSoldOut = !drink.soldOut;

    const ok = window.confirm(
      `確定要將「${drink.name}」改成「${newSoldOut ? "售完" : "正常"}」嗎？`
    );

    if (!ok) return;

    try {
      setLoading(true);
      setMsg("");

      const payload = {
        name: drink.name || "",
        price: Number(drink.price || 0),
        description: drink.description || "",
        imageUrl: drink.imageUrl || "",
        category: drink.category || "",
        active: drink.active === true,
        soldOut: newSoldOut,
      };

      await axios.put(`${BASE_URL}/admin/drinks/${drink.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg(`「${drink.name}」已改成${newSoldOut ? "售完" : "正常供應"}`);
      await fetchDrinks();
    } catch (err) {
      console.error("切換售完狀態失敗：", err.response || err);
      setMsg("切換售完狀態失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drink) => {
    setEditId(drink.id);

    setForm({
      name: drink.name || "",
      price: drink.price || "",
      description: drink.description || "",
      imageUrl: drink.imageUrl || "",
      category: drink.category || "",
      active: drink.active ?? true,
      soldOut: drink.soldOut ?? false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("確定要刪除這個飲料嗎？")) return;

    try {
      setLoading(true);

      await axios.delete(`${BASE_URL}/admin/drinks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nextTimes = { ...drinkTimes };
      delete nextTimes[id];
      saveDrinkTimes(nextTimes);

      setMsg("刪除飲料成功");
      await fetchDrinks();
    } catch (err) {
      console.error("刪除飲料失敗：", err.response || err);
      setMsg("刪除飲料失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("ALL");
  };

  return (
    <div className={getDisplayClassName()}>
      <div className="admin-drinks-topbar">
        <h1 className="admin-drinks-title">飲料管理（Admin）</h1>

        <div className="display-setting-panel">
          <div className="display-setting-item">
            <label>字體大小：</label>
            <select
              value={displaySettings.fontSize}
              onChange={(e) => updateDisplaySetting("fontSize", e.target.value)}
            >
              <option value="small">小字</option>
              <option value="normal">正常</option>
              <option value="large">大字</option>
              <option value="xlarge">超大</option>
            </select>
          </div>

          <div className="display-setting-item">
            <label>字體粗細：</label>
            <select
              value={displaySettings.fontWeight}
              onChange={(e) =>
                updateDisplaySetting("fontWeight", e.target.value)
              }
            >
              <option value="normal">正常</option>
              <option value="bold">加粗</option>
            </select>
          </div>

          <div className="display-setting-item">
            <label>表格間距：</label>
            <select
              value={displaySettings.rowDensity}
              onChange={(e) =>
                updateDisplaySetting("rowDensity", e.target.value)
              }
            >
              <option value="compact">緊湊</option>
              <option value="normal">正常</option>
              <option value="comfortable">寬鬆</option>
            </select>
          </div>

          <button
            type="button"
            className={`contrast-toggle-btn ${
              displaySettings.highContrast ? "active" : ""
            }`}
            onClick={() =>
              updateDisplaySetting(
                "highContrast",
                !displaySettings.highContrast
              )
            }
          >
            {displaySettings.highContrast ? "高亮文字：開" : "高亮文字：關"}
          </button>

          <button
            type="button"
            className="reset-display-btn"
            onClick={resetDisplaySettings}
          >
            重設
          </button>
        </div>
      </div>

      {msg && <p className="admin-drinks-message">{msg}</p>}
      {loading && <p className="admin-drinks-loading">處理中...</p>}

      <div className="admin-drinks">
        <AdminDrinkForm
          form={form}
          setForm={setForm}
          editId={editId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onUploadImage={handleUploadImage}
        />

        <AdminDrinkList
          drinks={filteredDrinks}
          totalCount={drinks.length}
          drinkTimes={drinkTimes}
          searchText={searchText}
          setSearchText={setSearchText}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={clearFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onToggleSoldOut={handleToggleSoldOut}
          onPreviewImage={setPreviewImage}
        />
      </div>

      {previewImage && (
        <div
          className="drink-image-modal-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="drink-image-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="drink-image-modal-close"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>

            <img
              src={previewImage.imageUrl}
              alt={previewImage.name}
              onError={(e) => {
                e.currentTarget.src = "/no-image.png";
              }}
            />

            <p>{previewImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrinks;