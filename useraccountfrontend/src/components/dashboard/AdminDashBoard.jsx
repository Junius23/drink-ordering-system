import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CreditCard,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  CalendarDays,
  Flame,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
import BASE_URL from "../../cors/config";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
];

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [revenueByDate, setRevenueByDate] = useState([]);
  const [ordersByPayment, setOrdersByPayment] = useState([]);
  const [topDrinks, setTopDrinks] = useState([]);

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

  const formatTaiwanTime = (dateString) => {
    const date = parseOrderDate(dateString);

    if (!date) return "";

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

  const isToday = (createdAt) => {
    const orderDate = parseOrderDate(createdAt);
    if (!orderDate) return false;

    return getTaiwanDateValue(orderDate) === getTaiwanDateValue(new Date());
  };

  const buildCharts = (data) => {
    const revenueMap = {};

    data.forEach((order) => {
      if (!order.createdAt || order.total == null) return;

      const date = parseOrderDate(order.createdAt);
      if (!date) return;

      const dateKey = getTaiwanDateValue(date).slice(5).replace("-", "/");

      if (normalizeStatus(order.status) === "COMPLETED") {
        revenueMap[dateKey] = (revenueMap[dateKey] || 0) + Number(order.total);
      }
    });

    const revenueArr = Object.entries(revenueMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setRevenueByDate(revenueArr);

    const payMap = {};

    data.forEach((order) => {
      const paymentMethod = order.paymentMethod || "其他";
      payMap[paymentMethod] = (payMap[paymentMethod] || 0) + 1;
    });

    setOrdersByPayment(
      Object.entries(payMap).map(([name, value]) => ({ name, value }))
    );

    const drinkMap = {};

    data.forEach((order) => {
      if (normalizeStatus(order.status) !== "COMPLETED") return;

      (order.items || []).forEach((item) => {
        const drinkName = item.name || "未知商品";
        const quantity = Number(item.quantity || 0);

        drinkMap[drinkName] = (drinkMap[drinkName] || 0) + quantity;
      });
    });

    const topDrinkArr = Object.entries(drinkMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setTopDrinks(topDrinkArr);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (role !== "ADMIN") {
      setError("沒有權限查看此頁面（需要 ADMIN 權限）");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("請先登入系統");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${BASE_URL}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || [];

        const sortedOrders = [...data].sort((a, b) => {
          const timeA = parseOrderDate(a.createdAt)?.getTime() || 0;
          const timeB = parseOrderDate(b.createdAt)?.getTime() || 0;
          return timeB - timeA;
        });

        setOrders(sortedOrders);
        buildCharts(sortedOrders);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "伺服器連線失敗";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const todayOrders = orders.filter((order) => isToday(order.createdAt));

  const totalRevenue = orders
    .filter((order) => normalizeStatus(order.status) === "COMPLETED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const todayRevenue = todayOrders
    .filter((order) => normalizeStatus(order.status) === "COMPLETED")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pendingTodayCount = todayOrders.filter(
    (order) => normalizeStatus(order.status) === "PENDING"
  ).length;

  const completedTodayCount = todayOrders.filter(
    (order) => normalizeStatus(order.status) === "COMPLETED"
  ).length;

  const cancelledTodayCount = todayOrders.filter(
    (order) => normalizeStatus(order.status) === "CANCELLED"
  ).length;

  const pendingAllCount = orders.filter(
    (order) => normalizeStatus(order.status) === "PENDING"
  ).length;

  const recentOrders = orders.slice(0, 5);

  const CountUp = ({ end, duration = 1200 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const safeEnd = Number(end || 0);

      if (safeEnd === 0) {
        setCount(0);
        return;
      }

      const increment = safeEnd / (duration / 16);

      const timer = setInterval(() => {
        start += increment;

        if (start > safeEnd) {
          setCount(safeEnd);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [end, duration]);

    return <>{count.toLocaleString()}</>;
  };

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            最後更新：{new Date().toLocaleString("zh-TW")}
          </p>
        </div>

        <div className="dashboard-links">
          <Link to="/admin/orders" className="dashboard-link-btn">
            前往訂單管理
          </Link>

          <Link
            to="/admin/order-report"
            className="dashboard-link-btn secondary"
          >
            查看訂單報表
          </Link>
        </div>
      </div>

      {pendingAllCount > 0 && (
        <div className="pending-alert">
          <Clock size={20} />
          <span>
            目前有 <strong>{pendingAllCount}</strong> 筆待處理訂單，請盡快處理。
          </span>
        </div>
      )}

      <h2 className="section-title">今日重點</h2>

      <div className="summary-cards">
        <div className="summary-card glass">
          <div className="icon-wrapper bg-indigo">
            <CalendarDays size={28} />
          </div>
          <h3>今日訂單數</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              <CountUp end={todayOrders.length} />
            </p>
          )}
          <span className="trend neutral">今日</span>
        </div>

        <div className="summary-card glass">
          <div className="icon-wrapper bg-emerald">
            <DollarSign size={28} />
          </div>
          <h3>今日營收</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              NT$ <CountUp end={todayRevenue} />
            </p>
          )}
          <span className="trend positive">只計算已完成訂單</span>
        </div>

        <div className="summary-card glass">
          <div className="icon-wrapper bg-orange">
            <Clock size={28} />
          </div>
          <h3>今日待處理</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              <CountUp end={pendingTodayCount} />
            </p>
          )}
          <span className="trend warning">需要處理</span>
        </div>

        <div className="summary-card glass">
          <div className="icon-wrapper bg-cyan">
            <CheckCircle size={28} />
          </div>
          <h3>今日已完成</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              <CountUp end={completedTodayCount} />
            </p>
          )}
          <span className="trend positive">完成訂單</span>
        </div>
      </div>

      <h2 className="section-title">總覽</h2>

      <div className="summary-cards">
        <div className="summary-card glass">
          <div className="icon-wrapper bg-indigo">
            <ShoppingCart size={28} />
          </div>
          <h3>總訂單數</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              <CountUp end={orders.length} />
            </p>
          )}
          <span className="trend positive">全部訂單</span>
        </div>

        <div className="summary-card glass">
          <div className="icon-wrapper bg-emerald">
            <DollarSign size={28} />
          </div>
          <h3>總營收</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              NT$ <CountUp end={totalRevenue} />
            </p>
          )}
          <span className="trend positive">只計算已完成訂單</span>
        </div>

        <div className="summary-card glass">
          <div className="icon-wrapper bg-rose">
            <CreditCard size={28} />
          </div>
          <h3>付款方式種類</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">{ordersByPayment.length}</p>
          )}
          <span className="trend neutral">種</span>
        </div>

        <div className="summary-card glass">
          <div className="icon-wrapper bg-red">
            <FileText size={28} />
          </div>
          <h3>今日已取消</h3>
          {loading ? (
            <div className="skeleton value" />
          ) : (
            <p className="value">
              <CountUp end={cancelledTodayCount} />
            </p>
          )}
          <span className="trend danger">取消訂單</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card glass">
          <h3>每日營收趨勢</h3>

          {loading ? (
            <div className="chart-skeleton" />
          ) : revenueByDate.length === 0 ? (
            <p className="no-data">暫無資料</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByDate}>
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="date" stroke="#e2e8f0" />
                <YAxis stroke="#e2e8f0" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#a5b4fc" }}
                />
                <Bar
                  dataKey="total"
                  fill="url(#colorRevenue)"
                  radius={[12, 12, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card glass">
          <h3>付款方式分佈</h3>

          {loading ? (
            <div className="chart-skeleton" />
          ) : ordersByPayment.length === 0 ? (
            <p className="no-data">暫無資料</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByPayment}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, value }) => `${name} ${value}筆`}
                >
                  {ordersByPayment.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="dashboard-panel glass">
          <div className="panel-title-row">
            <h3>最近 5 筆訂單</h3>
            <Link to="/admin/orders">查看全部</Link>
          </div>

          {loading ? (
            <div className="chart-skeleton small" />
          ) : recentOrders.length === 0 ? (
            <p className="no-data">暫無訂單</p>
          ) : (
            <div className="recent-order-list">
              {recentOrders.map((order) => (
                <div className="recent-order-item" key={order.id}>
                  <div>
                    <strong>#{order.id}</strong>
                    <p>{order.userName || "未知顧客"}</p>
                    <span>{formatTaiwanTime(order.createdAt)}</span>
                  </div>

                  <div className="recent-order-right">
                    <strong>NT${order.total || 0}</strong>
                    <span
                      className={`status-pill ${normalizeStatus(
                        order.status
                      ).toLowerCase()}`}
                    >
                      {normalizeStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel glass">
          <div className="panel-title-row">
            <h3>熱銷飲料 TOP 5</h3>
            <Flame size={22} color="#f59e0b" />
          </div>

          {loading ? (
            <div className="chart-skeleton small" />
          ) : topDrinks.length === 0 ? (
            <p className="no-data">暫無資料</p>
          ) : (
            <div className="top-drink-list">
              {topDrinks.map((drink, index) => (
                <div className="top-drink-item" key={drink.name}>
                  <div className="rank-badge">{index + 1}</div>

                  <div className="top-drink-info">
                    <strong>{drink.name}</strong>
                    <div className="top-drink-bar">
                      <div
                        className="top-drink-bar-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (drink.quantity / topDrinks[0].quantity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <span>{drink.quantity} 杯</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;