import React from "react";

const AdminOrderFilters = ({
  searchText,
  setSearchText,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  getStatusCount,
  clearFilters,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: "18px",
      }}
    >
      <input
        type="text"
        placeholder="搜尋訂單 ID、姓名、Email、付款方式、狀態、商品..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          minWidth: "280px",
        }}
      />

      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <option value="ALL">全部日期</option>
        <option value="TODAY">今日訂單</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <option value="ALL">全部狀態 ({getStatusCount("ALL")})</option>
        <option value="PENDING">PENDING ({getStatusCount("PENDING")})</option>
        <option value="COMPLETED">
          COMPLETED ({getStatusCount("COMPLETED")})
        </option>
        <option value="CANCELLED">
          CANCELLED ({getStatusCount("CANCELLED")})
        </option>
      </select>

      <select
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <option value="ALL">全部付款方式</option>
        <option value="CREDIT CARD">Credit Card</option>
        <option value="CASH ON DELIVERY">Cash on Delivery</option>
        <option value="LINE PAY">Line Pay</option>
        <option value="APPLE PAY">Apple Pay</option>
      </select>

      <button className="view-items-btn" onClick={clearFilters}>
        清除篩選
      </button>
    </div>
  );
};

export default AdminOrderFilters;