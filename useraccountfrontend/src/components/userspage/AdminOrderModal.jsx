import React from "react";

const AdminOrderModal = ({
  selectedOrder,
  setSelectedOrder,
  getOrderTotalQuantity,
  getDrinkImage,
}) => {
  if (!selectedOrder) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>訂單 #{selectedOrder.id} 明細</h3>

        <div className="order-detail-summary">
          <p>商品總數量：{getOrderTotalQuantity(selectedOrder)} 杯</p>
          <p>總金額：NTD{selectedOrder.total}</p>
        </div>

        {(selectedOrder.items || []).map((item) => (
          <div className="modal-item" key={item.drinkId}>
            <img
              src={getDrinkImage(item.drinkId)}
              className="modal-drink-img"
              alt={item.name}
            />

            <div className="modal-info">
              <p>{item.name}</p>
              <p>數量：{item.quantity}</p>
              <p>單價：NT${item.price}</p>
              <p>小計：NT${item.quantity * item.price}</p>
            </div>
          </div>
        ))}

        <button className="modal-close" onClick={() => setSelectedOrder(null)}>
          關閉
        </button>
      </div>
    </div>
  );
};

export default AdminOrderModal;