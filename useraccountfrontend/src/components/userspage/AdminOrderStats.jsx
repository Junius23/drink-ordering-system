import React from "react";

const AdminOrderStats = ({
  todayOrders,
  todayRevenue,
  pendingCount,
  completedCount,
  cancelledCount,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "14px",
        margin: "18px 0",
      }}
    >
      <div className="order-stat-card">
        <p>今日訂單</p>
        <h3>{todayOrders.length}</h3>
      </div>

      <div className="order-stat-card">
        <p>今日營業額</p>
        <h3>NTD{todayRevenue}</h3>
      </div>

      <div className="order-stat-card">
        <p>待處理</p>
        <h3>{pendingCount}</h3>
      </div>

      <div className="order-stat-card">
        <p>已完成</p>
        <h3>{completedCount}</h3>
      </div>

      <div className="order-stat-card">
        <p>已取消</p>
        <h3>{cancelledCount}</h3>
      </div>
    </div>
  );
};

export default AdminOrderStats;