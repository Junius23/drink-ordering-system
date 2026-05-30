import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../cors/config";
import "./AdminOrderReportPage.css";

const AdminOrderReportPage = () => {
  const [orders, setOrders] = useState([]);
  const [viewMode, setViewMode] = useState("date");
  const [exportMode, setExportMode] = useState("current");

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeStatus = (status) => {
    return String(status || "").trim().toUpperCase();
  };

  const parseOrderDate = (dateString) => {
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
    const date = parseOrderDate(dateString);

    if (!date) {
      return "";
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

  const getTaiwanDateValue = (date) => {
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

  const getTaiwanYearValue = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
    }).format(date);
  };

  const getTodayDateValue = () => {
    return getTaiwanDateValue(new Date());
  };

  const getYesterdayDateValue = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getTaiwanDateValue(yesterday);
  };

  const isSameSelectedDate = (createdAt) => {
    const orderDate = parseOrderDate(createdAt);
    if (!orderDate) return false;

    return getTaiwanDateValue(orderDate) === selectedDate;
  };

  const isToday = (createdAt) => {
    const orderDate = parseOrderDate(createdAt);
    if (!orderDate) return false;

    return getTaiwanDateValue(orderDate) === getTodayDateValue();
  };

  const isYesterday = (createdAt) => {
    const orderDate = parseOrderDate(createdAt);
    if (!orderDate) return false;

    return getTaiwanDateValue(orderDate) === getYesterdayDateValue();
  };

  const isThisYear = (createdAt) => {
    const orderDate = parseOrderDate(createdAt);
    if (!orderDate) return false;

    return getTaiwanYearValue(orderDate) === getTaiwanYearValue(new Date());
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

  const loadOrders = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (role !== "ADMIN") {
      setError("沒有權限查看此頁面（ADMIN only）");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data || [];

      const sortedOrders = [...data].sort((a, b) => {
        const timeA = parseOrderDate(a.createdAt)?.getTime() || 0;
        const timeB = parseOrderDate(b.createdAt)?.getTime() || 0;
        return timeB - timeA;
      });

      setOrders(sortedOrders);
      setError("");
    } catch (err) {
      console.error("Load order report error:", err);
      setError("載入訂單報表失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getCurrentOrders = () => {
    if (viewMode === "date") {
      return orders.filter((order) => isSameSelectedDate(order.createdAt));
    }

    if (viewMode === "today") {
      return orders.filter((order) => isToday(order.createdAt));
    }

    if (viewMode === "yesterday") {
      return orders.filter((order) => isYesterday(order.createdAt));
    }

    if (viewMode === "year") {
      return orders.filter((order) => isThisYear(order.createdAt));
    }

    return [];
  };

  const currentOrders = getCurrentOrders();

  const getExportOrders = () => {
    if (exportMode === "current") {
      return currentOrders;
    }

    if (exportMode === "today") {
      return orders.filter((order) => isToday(order.createdAt));
    }

    if (exportMode === "yesterday") {
      return orders.filter((order) => isYesterday(order.createdAt));
    }

    if (exportMode === "year") {
      return orders.filter((order) => isThisYear(order.createdAt));
    }

    if (exportMode === "date") {
      return orders.filter((order) => isSameSelectedDate(order.createdAt));
    }

    return [];
  };

  const getTotalRevenue = (orderList) => {
    return orderList
      .filter((order) => normalizeStatus(order.status) === "COMPLETED")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
  };

  const getCompletedCount = (orderList) => {
    return orderList.filter(
      (order) => normalizeStatus(order.status) === "COMPLETED"
    ).length;
  };

  const getPendingCount = (orderList) => {
    return orderList.filter(
      (order) => normalizeStatus(order.status) === "PENDING"
    ).length;
  };

  const getCancelledCount = (orderList) => {
    return orderList.filter(
      (order) => normalizeStatus(order.status) === "CANCELLED"
    ).length;
  };

  const getTotalQuantity = (orderList) => {
    return orderList.reduce(
      (sum, order) => sum + getOrderTotalQuantity(order),
      0
    );
  };

  const getReportTitle = () => {
    if (viewMode === "date") {
      return `日期訂單：${selectedDate}`;
    }

    if (viewMode === "today") {
      return "今日訂單";
    }

    if (viewMode === "yesterday") {
      return "昨日訂單";
    }

    if (viewMode === "year") {
      return "今年訂單";
    }

    return "訂單報表";
  };

  const getExportTitle = () => {
    if (exportMode === "current") {
      return `目前畫面_${getReportTitle()}`;
    }

    if (exportMode === "today") {
      return "今日訂單";
    }

    if (exportMode === "yesterday") {
      return "昨日訂單";
    }

    if (exportMode === "year") {
      return "今年訂單";
    }

    if (exportMode === "date") {
      return `指定日期_${selectedDate}`;
    }

    return "訂單報表";
  };

  const exportCSV = () => {
    const exportOrders = getExportOrders();

    if (exportOrders.length === 0) {
      alert("選擇的範圍沒有訂單可以匯出");
      return;
    }

    const ok = window.confirm(
      `確定要匯出「${getExportTitle()}」嗎？\n\n共 ${exportOrders.length} 筆訂單`
    );

    if (!ok) {
      return;
    }

    const headers = [
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

    const rows = exportOrders.map((order) => [
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
    link.download = `${getExportTitle()}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return <div className="order-report-error">{error}</div>;
  }

  return (
    <div className="order-report-page">
      <div className="order-report-header">
        <div>
          <h2>訂單報表</h2>
          <p>可以依照日期、今日、昨日或今年查看與匯出訂單統計</p>
        </div>

        <div className="order-report-actions">
          <button onClick={loadOrders} disabled={loading}>
            {loading ? "更新中..." : "重新整理"}
          </button>

          <select
            className="export-select"
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value)}
          >
            <option value="current">匯出目前畫面</option>
            <option value="today">匯出今日訂單</option>
            <option value="yesterday">匯出昨日訂單</option>
            <option value="year">匯出今年訂單</option>
            <option value="date">匯出指定日期</option>
          </select>

          <button onClick={exportCSV}>匯出 CSV</button>
        </div>
      </div>

      <div className="order-report-filter-box">
        <div className="date-filter">
          <label>選擇日期：</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setViewMode("date");
              setExportMode("date");
            }}
          />
        </div>

        <div className="order-report-tabs">
          <button
            className={viewMode === "date" ? "active" : ""}
            onClick={() => setViewMode("date")}
          >
            指定日期
          </button>

          <button
            className={viewMode === "today" ? "active" : ""}
            onClick={() => {
              setSelectedDate(getTodayDateValue());
              setViewMode("today");
            }}
          >
            今日訂單
          </button>

          <button
            className={viewMode === "yesterday" ? "active" : ""}
            onClick={() => {
              setSelectedDate(getYesterdayDateValue());
              setViewMode("yesterday");
            }}
          >
            昨日訂單
          </button>

          <button
            className={viewMode === "year" ? "active" : ""}
            onClick={() => setViewMode("year")}
          >
            今年訂單
          </button>
        </div>
      </div>

      <div className="order-report-summary">
        <div className="report-card">
          <p>訂單數</p>
          <h3>{currentOrders.length}</h3>
        </div>

        <div className="report-card">
          <p>營業額</p>
          <h3>NTD{getTotalRevenue(currentOrders)}</h3>
          <span className="report-note">只計算已完成訂單</span>
        </div>

        <div className="report-card">
          <p>商品總數量</p>
          <h3>{getTotalQuantity(currentOrders)} 杯</h3>
        </div>

        <div className="report-card">
          <p>待處理</p>
          <h3>{getPendingCount(currentOrders)}</h3>
        </div>

        <div className="report-card">
          <p>已完成</p>
          <h3>{getCompletedCount(currentOrders)}</h3>
        </div>

        <div className="report-card">
          <p>已取消</p>
          <h3>{getCancelledCount(currentOrders)}</h3>
        </div>
      </div>

      <div className="order-report-table-box">
        <h3>{getReportTitle()}</h3>

        {currentOrders.length === 0 ? (
          <p className="no-orders">目前沒有訂單</p>
        ) : (
          <table className="order-report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>顧客</th>
                <th>Email</th>
                <th>總金額</th>
                <th>付款方式</th>
                <th>狀態</th>
                <th>時間</th>
                <th>商品摘要</th>
                <th>商品數量</th>
              </tr>
            </thead>

            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userName || ""}</td>
                  <td>{order.userEmail || ""}</td>
                  <td>NTD{order.total || 0}</td>
                  <td>{order.paymentMethod || ""}</td>
                  <td>
                    <span
                      className={`report-status ${normalizeStatus(
                        order.status
                      ).toLowerCase()}`}
                    >
                      {normalizeStatus(order.status)}
                    </span>
                  </td>
                  <td>{formatTaiwanTime(order.createdAt)}</td>
                  <td>{getOrderItemSummary(order)}</td>
                  <td>{getOrderTotalQuantity(order)} 杯</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrderReportPage;