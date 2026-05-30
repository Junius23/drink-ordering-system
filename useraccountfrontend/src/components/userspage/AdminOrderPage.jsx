import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AdminOrderPage.css";

import { assets } from "../../assets/assets";
import BASE_URL from "../../cors/config";

import AdminOrderStats from "./AdminOrderStats";
import AdminOrderFilters from "./AdminOrderFilters";
import AdminOrderTable from "./AdminOrderTable";
import AdminOrderModal from "./AdminOrderModal";

// 製作中按鈕等待時間：5 分鐘
const PREPARING_WAIT_MINUTES = 5;

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [autoDelete, setAutoDelete] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [newOrderMessage, setNewOrderMessage] = useState("");

  const [preparingOrders, setPreparingOrders] = useState(() => {
    const saved = localStorage.getItem("preparingOrders");
    return saved ? JSON.parse(saved) : {};
  });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const previousOrderIdsRef = useRef([]);

  const cancelReasons = [
    "顧客取消",
    "商品售完",
    "訂單內容錯誤",
    "無法聯絡顧客",
    "重複訂單",
    "其他原因",
  ];

  const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
  };

  const normalizeStatus = (status) => {
    return String(status || "").trim().toUpperCase();
  };

  const normalizePayment = (payment) => {
    return String(payment || "").trim().toUpperCase();
  };

  const getOrderCreatedDate = (dateString) => {
    if (!dateString) return null;

    const str = String(dateString);
    const utcString =
      str.endsWith("Z") || str.includes("+") ? str : `${str}Z`;

    const date = new Date(utcString);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const formatTaiwanTime = (dateString) => {
    const date = getOrderCreatedDate(dateString);

    if (!date) {
      return String(dateString || "").replace("T", " ").slice(0, 19);
    }

    return date.toLocaleString("zh-TW", {
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

  const getTaiwanDateKey = (dateString) => {
    const date = getOrderCreatedDate(dateString);

    if (!date) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  const getDailyNumberMap = (orderList) => {
    const result = {};
    const countByDate = {};

    const sortedAsc = [...orderList].sort((a, b) => {
      const timeA = getOrderCreatedDate(a.createdAt)?.getTime() || 0;
      const timeB = getOrderCreatedDate(b.createdAt)?.getTime() || 0;

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      return Number(a.id || 0) - Number(b.id || 0);
    });

    sortedAsc.forEach((order) => {
      const dateKey = getTaiwanDateKey(order.createdAt);

      if (!dateKey) {
        result[order.id] = "-";
        return;
      }

      countByDate[dateKey] = (countByDate[dateKey] || 0) + 1;
      result[order.id] = countByDate[dateKey];
    });

    return result;
  };

  const canStartPreparing = (order) => {
    const createdDate = getOrderCreatedDate(order.createdAt);

    if (!createdDate) {
      return false;
    }

    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMinutes = diffMs / 1000 / 60;

    return diffMinutes >= PREPARING_WAIT_MINUTES;
  };

  const getPreparingButtonText = (order) => {
    const createdDate = getOrderCreatedDate(order.createdAt);

    if (!createdDate) {
      return "製作中";
    }

    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);

    if (diffMinutes >= PREPARING_WAIT_MINUTES) {
      return "製作中";
    }

    const remain = PREPARING_WAIT_MINUTES - diffMinutes;

    return `${remain}分鐘後可製作`;
  };

  const handleStartPreparing = (order) => {
    if (!canStartPreparing(order)) {
      alert(`訂單成立滿 ${PREPARING_WAIT_MINUTES} 分鐘後才能開始製作`);
      return;
    }

    const ok = window.confirm(`確定訂單 #${order.id} 開始製作嗎？`);

    if (!ok) {
      return;
    }

    const newPreparingOrders = {
      ...preparingOrders,
      [order.id]: true,
    };

    setPreparingOrders(newPreparingOrders);
    localStorage.setItem("preparingOrders", JSON.stringify(newPreparingOrders));

    alert(`訂單 #${order.id} 已標記為製作中`);
  };

  const playNewOrderSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.4
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (err) {
      console.error("Play sound error:", err);
    }
  };

  const loadDrinks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/drinks`);
      setDrinks(res.data || []);
    } catch (err) {
      console.error("Drink load error:", err);
    }
  };

  const loadOrders = async (showLoading = false) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (role !== "ADMIN") {
      setError("沒有權限查看此頁面（ADMIN only）");
      return;
    }

    try {
      if (showLoading) {
        setRefreshing(true);
      }

      const res = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || [];

      const sortedOrders = [...data].sort((a, b) => {
        const timeA = getOrderCreatedDate(a.createdAt)?.getTime() || 0;
        const timeB = getOrderCreatedDate(b.createdAt)?.getTime() || 0;

        return timeB - timeA;
      });

      const currentIds = sortedOrders.map((order) => order.id);
      const previousIds = previousOrderIdsRef.current;

      if (previousIds.length > 0) {
        const newOrders = currentIds.filter((id) => !previousIds.includes(id));

        if (newOrders.length > 0) {
          setNewOrderMessage(`有 ${newOrders.length} 筆新訂單！`);
          playNewOrderSound();

          setTimeout(() => {
            setNewOrderMessage("");
          }, 4000);
        }
      }

      previousOrderIdsRef.current = currentIds;

      setOrders(sortedOrders);
      setError("");
      setLastUpdated(
        new Date().toLocaleTimeString("zh-TW", {
          timeZone: "Asia/Taipei",
          hour12: false,
        })
      );
    } catch (err) {
      console.error("Orders load error:", err);
      setError("Failed to load orders");
    } finally {
      if (showLoading) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadDrinks();
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id, status, order = null) => {
    const token = localStorage.getItem("token");

    let statusText = "";

    if (status === "complete") {
      statusText = "完成";
    } else if (status === "cancel") {
      statusText = "取消";
    } else {
      statusText = status;
    }

    if (status === "cancel") {
      setCancelOrderId(id);
      setCancelReason("");
      setCancelModalOpen(true);
      return;
    }

    const ok = window.confirm(`確定要將訂單 #${id} 設為「${statusText}」嗎？`);

    if (!ok) return;

    try {
      await axios.put(
        `${BASE_URL}/admin/orders/${id}/${status}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`訂單 #${id} 已${statusText}`);

      if (status === "complete" && order) {
        const printOk = window.confirm(`訂單 #${id} 已完成，是否立即列印？`);

        if (printOk) {
          const completedOrder = {
            ...order,
            status: "COMPLETED",
          };

          printOrder(completedOrder);
        }
      }

      await loadOrders(true);
    } catch (err) {
      console.error("Update order status error:", err);
      alert("更新訂單失敗");
    }
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrderId) {
      alert("找不到要取消的訂單");
      return;
    }

    if (!cancelReason) {
      alert("請先選擇取消原因");
      return;
    }

    const ok = window.confirm(
      `確定要取消訂單 #${cancelOrderId} 嗎？\n\n取消原因：${cancelReason}`
    );

    if (!ok) return;

    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${BASE_URL}/admin/orders/${cancelOrderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`訂單 #${cancelOrderId} 已取消\n取消原因：${cancelReason}`);

      setCancelModalOpen(false);
      setCancelOrderId(null);
      setCancelReason("");

      await loadOrders(true);
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("取消訂單失敗");
    }
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setCancelOrderId(null);
    setCancelReason("");
  };

  const deleteOrder = async (id) => {
    const ok = window.confirm(`確定刪除訂單 #${id}?`);
    if (!ok) return;

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${BASE_URL}/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadOrders(true);
    } catch (err) {
      console.error("Delete order error:", err);
      alert("刪除訂單失敗");
    }
  };

  useEffect(() => {
    if (!autoDelete) return;

    const token = localStorage.getItem("token");

    const deleteCancelled = async () => {
      try {
        await axios.delete(`${BASE_URL}/admin/orders/cancelled`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        await loadOrders(true);
      } catch (err) {
        console.error("Auto delete cancelled orders error:", err);
        alert("自動刪除失敗");
      }
    };

    deleteCancelled();
  }, [autoDelete]);

  const getDrinkImage = (drinkId) => {
    const d = drinks.find((item) => String(item.id) === String(drinkId));
    return d?.imageUrl || d?.image || assets.parcel_icon;
  };

  const getPaymentIcon = (method) => {
    const payment = normalizePayment(method);

    if (payment === "CREDIT CARD") return assets.visa;
    if (payment === "LINE PAY") return assets.line_pay;
    if (payment === "APPLE PAY") return assets.apple_pay;
    if (payment === "CASH ON DELIVERY") return assets.parcel_icon;

    return assets.bag_icon;
  };

  const isToday = (dateString) => {
    if (!dateString) return false;

    const orderDateKey = getTaiwanDateKey(dateString);
    const todayKey = getTaiwanDateKey(new Date().toISOString());

    return orderDateKey === todayKey;
  };

  const getOrderItemSummary = (order) => {
    if (!order.items || order.items.length === 0) {
      return "無商品";
    }

    return order.items
      .map((item) => `${item.name} x${item.quantity}`)
      .join("、");
  };

  const getOrderTotalQuantity = (order) => {
    if (!order.items || order.items.length === 0) {
      return 0;
    }

    return order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setDateFilter("ALL");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
  };

  const showPendingOnly = () => {
    setSearchText("");
    setDateFilter("ALL");
    setPaymentFilter("ALL");
    setStatusFilter("PENDING");
  };

  const applyDatePaymentFilter = (orderList) => {
    return orderList.filter((order) => {
      const matchDate =
        dateFilter === "ALL" ? true : isToday(order.createdAt);

      const matchPayment =
        paymentFilter === "ALL"
          ? true
          : normalizePayment(order.paymentMethod) ===
            normalizePayment(paymentFilter);

      return matchDate && matchPayment;
    });
  };

  const getStatusCount = (status) => {
    const baseOrders = applyDatePaymentFilter(orders);

    if (status === "ALL") return baseOrders.length;

    return baseOrders.filter(
      (order) => normalizeStatus(order.status) === normalizeStatus(status)
    ).length;
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = normalizeText(searchText);

    const matchDate = dateFilter === "ALL" ? true : isToday(order.createdAt);

    const matchStatus =
      statusFilter === "ALL"
        ? true
        : normalizeStatus(order.status) === normalizeStatus(statusFilter);

    const matchPayment =
      paymentFilter === "ALL"
        ? true
        : normalizePayment(order.paymentMethod) ===
          normalizePayment(paymentFilter);

    const itemSummary = getOrderItemSummary(order);

    const matchSearch =
      keyword === ""
        ? true
        : normalizeText(order.id).includes(keyword) ||
          normalizeText(order.userName).includes(keyword) ||
          normalizeText(order.userEmail).includes(keyword) ||
          normalizeText(order.paymentMethod).includes(keyword) ||
          normalizeText(order.status).includes(keyword) ||
          normalizeText(itemSummary).includes(keyword);

    return matchDate && matchStatus && matchPayment && matchSearch;
  });

  const dailyNumberMap = getDailyNumberMap(orders);

  const filteredOrdersWithDailyNo = filteredOrders.map((order) => {
    return {
      ...order,
      dailyNo: dailyNumberMap[order.id] || "-",
    };
  });

  const printOrder = (order) => {
    const itemRows = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>NT${item.price}</td>
            <td>NT${item.quantity * item.price}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("瀏覽器阻擋彈出視窗，請允許彈出視窗後再試一次");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>訂單 #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
            }

            h2 {
              margin-bottom: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
            }

            .total {
              margin-top: 20px;
              font-size: 20px;
              font-weight: bold;
              text-align: right;
            }
          </style>
        </head>

        <body>
          <h2>Drink Order Receipt</h2>
          <p><strong>今日編號：</strong>${order.dailyNo || "-"}</p>
          <p><strong>訂單編號：</strong>#${order.id}</p>
          <p><strong>顧客：</strong>${order.userName || ""}</p>
          <p><strong>Email：</strong>${order.userEmail || ""}</p>
          <p><strong>付款方式：</strong>${order.paymentMethod || ""}</p>
          <p><strong>訂單狀態：</strong>${normalizeStatus(order.status)}</p>
          <p><strong>成立時間：</strong>${formatTaiwanTime(order.createdAt)}</p>
          <p><strong>商品總數量：</strong>${getOrderTotalQuantity(order)} 杯</p>

          <table>
            <thead>
              <tr>
                <th>商品</th>
                <th>數量</th>
                <th>單價</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="total">
            總金額：NT${order.total}
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const exportOrdersCSV = () => {
    if (filteredOrdersWithDailyNo.length === 0) {
      alert("沒有訂單可以匯出");
      return;
    }

    const headers = [
      "Daily No",
      "ID",
      "User",
      "Email",
      "Total",
      "Payment",
      "Status",
      "Created At",
      "Items",
      "Total Quantity",
    ];

    const rows = filteredOrdersWithDailyNo.map((order) => [
      order.dailyNo || "",
      order.id,
      order.userName || "",
      order.userEmail || "",
      order.total || 0,
      order.paymentMethod || "",
      normalizeStatus(order.status),
      formatTaiwanTime(order.createdAt),
      getOrderItemSummary(order),
      getOrderTotalQuantity(order),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const todayOrders = orders.filter((order) => isToday(order.createdAt));

  const todayRevenue = todayOrders
    .filter((order) => normalizeStatus(order.status) === "COMPLETED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pendingCount = orders.filter(
    (order) => normalizeStatus(order.status) === "PENDING"
  ).length;

  const completedCount = orders.filter(
    (order) => normalizeStatus(order.status) === "COMPLETED"
  ).length;

  const cancelledCount = orders.filter(
    (order) => normalizeStatus(order.status) === "CANCELLED"
  ).length;

  if (error) {
    return <div className="admin-orders-error">{error}</div>;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <h2>All Orders (Admin)</h2>
          <p style={{ marginTop: "6px", color: "#666", fontSize: "14px" }}>
            最後更新：{lastUpdated || "尚未更新"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="view-items-btn"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
          >
            {refreshing ? "更新中..." : "手動刷新"}
          </button>

          <button className="view-items-btn" onClick={showPendingOnly}>
            只看待處理訂單
          </button>

          <button className="view-items-btn" onClick={exportOrdersCSV}>
            匯出 CSV
          </button>

          <button
            className={`auto-delete-toggle ${autoDelete ? "on" : ""}`}
            onClick={() => setAutoDelete(!autoDelete)}
          >
            {autoDelete ? "自動刪除已取消訂單：開啟" : "自動刪除已取消訂單：關閉"}
          </button>
        </div>
      </div>

      {newOrderMessage && (
        <div
          style={{
            margin: "15px 0",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#e9fff0",
            color: "#0a7a2f",
            fontWeight: "600",
          }}
        >
          {newOrderMessage}
        </div>
      )}

      <AdminOrderStats
        todayOrders={todayOrders}
        todayRevenue={todayRevenue}
        pendingCount={pendingCount}
        completedCount={completedCount}
        cancelledCount={cancelledCount}
      />

      <AdminOrderFilters
        searchText={searchText}
        setSearchText={setSearchText}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        getStatusCount={getStatusCount}
        clearFilters={clearFilters}
      />

      <AdminOrderTable
        filteredOrders={filteredOrdersWithDailyNo}
        assets={assets}
        getPaymentIcon={getPaymentIcon}
        normalizeStatus={normalizeStatus}
        getOrderItemSummary={getOrderItemSummary}
        formatTaiwanTime={formatTaiwanTime}
        setSelectedOrder={setSelectedOrder}
        updateOrderStatus={updateOrderStatus}
        deleteOrder={deleteOrder}
        printOrder={printOrder}
        canStartPreparing={canStartPreparing}
        getPreparingButtonText={getPreparingButtonText}
        handleStartPreparing={handleStartPreparing}
        preparingOrders={preparingOrders}
      />

      <AdminOrderModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        getOrderTotalQuantity={getOrderTotalQuantity}
        getDrinkImage={getDrinkImage}
      />

      {cancelModalOpen && (
        <div className="cancel-modal-overlay" onClick={closeCancelModal}>
          <div
            className="cancel-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>取消訂單 #{cancelOrderId}</h3>

            <p className="cancel-modal-text">
              請選擇取消原因，確認後才會取消訂單。
            </p>

            <div className="cancel-reason-list">
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  className={`cancel-reason-item ${
                    cancelReason === reason ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="cancel-modal-actions">
              <button
                type="button"
                className="cancel-modal-close"
                onClick={closeCancelModal}
              >
                關閉
              </button>

              <button
                type="button"
                className="cancel-modal-confirm"
                onClick={confirmCancelOrder}
              >
                確認取消訂單
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;