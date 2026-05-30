import React from "react";

const AdminOrderTable = ({
  filteredOrders,
  assets,
  getPaymentIcon,
  normalizeStatus,
  getOrderItemSummary,
  formatTaiwanTime,
  setSelectedOrder,
  updateOrderStatus,
  printOrder,

  // 製作中功能
  canStartPreparing,
  getPreparingButtonText,
  handleStartPreparing,
  preparingOrders,
}) => {
  if (filteredOrders.length === 0) {
    return <p>No orders yet.</p>;
  }

  return (
    <table className="admin-orders-table">
      <thead>
        <tr>
          <th>今日編號</th>
          <th>User</th>
          <th>Email</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Created At</th>
          <th>商品摘要</th>
          <th>Items</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        {filteredOrders.map((o) => {
          const status = normalizeStatus(o.status);
          const isCompleted = status === "COMPLETED";
          const isCancelled = status === "CANCELLED";

          const isPreparing = preparingOrders?.[o.id] === true;
          const allowPreparing = canStartPreparing
            ? canStartPreparing(o)
            : false;

          return (
            <tr key={o.id}>
              <td>{o.dailyNo || "-"}</td>

              <td className="user-cell">
                <img src={assets.profile_icon} className="avatar-img" alt="" />
                {o.userName}
              </td>

              <td>{o.userEmail}</td>

              <td>NTD{o.total}</td>

              <td className="payment-cell">
                <img
                  src={getPaymentIcon(o.paymentMethod)}
                  className="payment-img"
                  alt=""
                />
                {o.paymentMethod}
              </td>

              <td>
                <span className={`status-badge ${status.toLowerCase()}`}>
                  {status}
                </span>
              </td>

              <td>{formatTaiwanTime(o.createdAt)}</td>

              <td>{getOrderItemSummary(o)}</td>

              <td>
                {o.items && o.items.length > 0 ? (
                  <button
                    className="view-items-btn"
                    onClick={() => setSelectedOrder(o)}
                  >
                    查看（{o.items.length}）
                  </button>
                ) : (
                  "無"
                )}
              </td>

              <td className="action-cell">
                <button
                  className="btn-complete"
                  onClick={() => updateOrderStatus(o.id, "complete", o)}
                  disabled={isCompleted || isCancelled}
                  title={
                    isCompleted
                      ? "此訂單已完成"
                      : isCancelled
                      ? "此訂單已取消，不能完成"
                      : "完成訂單"
                  }
                >
                  完成
                </button>

                <button
                  className="btn-cancel"
                  onClick={() => updateOrderStatus(o.id, "cancel")}
                  disabled={isCompleted || isCancelled}
                  title={
                    isCompleted
                      ? "此訂單已完成，不能取消"
                      : isCancelled
                      ? "此訂單已取消"
                      : "取消訂單"
                  }
                >
                  取消
                </button>

                <button className="btn-print" onClick={() => printOrder(o)}>
                  列印
                </button>

                <button
                  className={`btn-preparing ${isPreparing ? "active" : ""}`}
                  onClick={() => handleStartPreparing(o)}
                  disabled={
                    !allowPreparing || isPreparing || isCompleted || isCancelled
                  }
                  title={
                    isCompleted
                      ? "此訂單已完成，不能再製作"
                      : isCancelled
                      ? "此訂單已取消，不能製作"
                      : allowPreparing
                      ? "可以開始製作"
                      : "訂單成立滿 5 分鐘後才能按"
                  }
                >
                  {isPreparing
                    ? "製作中"
                    : getPreparingButtonText
                    ? getPreparingButtonText(o)
                    : "製作中"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AdminOrderTable;