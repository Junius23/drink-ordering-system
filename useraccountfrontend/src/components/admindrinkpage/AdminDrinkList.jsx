const AdminDrinkList = ({
  drinks,
  totalCount,
  drinkTimes,
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  onClearFilters,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleSoldOut,
  onPreviewImage,
}) => {
  const getListedAt = (drink) => {
    return drinkTimes?.[drink.id]?.listedAt || "-";
  };

  const getUnlistedAt = (drink) => {
    return drinkTimes?.[drink.id]?.unlistedAt || "-";
  };

  return (
    <div className="admin-drinks-list">
      <div className="drink-list-header">
        <div>
          <h2>飲料列表</h2>
          <p>
            目前顯示 {drinks.length} 筆 / 全部 {totalCount} 筆
          </p>
        </div>
      </div>

      <div className="drink-list-tools">
        <input
          type="text"
          placeholder="搜尋名稱、分類或描述..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">全部飲料</option>
          <option value="ACTIVE">只看上架</option>
          <option value="INACTIVE">只看下架</option>
          <option value="SOLD_OUT">只看售完</option>
          <option value="NORMAL">只看正常供應</option>
        </select>

        <button
          type="button"
          className="clear-filter-btn"
          onClick={onClearFilters}
        >
          清除篩選
        </button>
      </div>

      {drinks.length === 0 ? (
        <p>目前沒有符合條件的飲料。</p>
      ) : (
        <div className="admin-drinks-table-wrap">
          <table>
            <thead>
              <tr>
                <th>編號</th>
                <th>名稱</th>
                <th>價格</th>
                <th>分類</th>
                <th>是否上架</th>
                <th>是否售完</th>
                <th>上架時間</th>
                <th>下架時間</th>
                <th>圖片</th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {drinks.map((d, index) => (
                <tr key={d.id}>
                  <td>{index + 1}</td>
                  <td>{d.name}</td>
                  <td>NTD{d.price}</td>
                  <td>{d.category || "未分類"}</td>

                  <td>
                    <button
                      type="button"
                      className={`drink-status-btn ${
                        d.active ? "on" : "off"
                      }`}
                      onClick={() => onToggleActive(d)}
                      title="點擊切換上架 / 下架"
                    >
                      {d.active ? "上架" : "下架"}
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`drink-stock-btn ${
                        d.soldOut ? "sold-out" : "normal"
                      }`}
                      onClick={() => onToggleSoldOut(d)}
                      title="點擊切換正常 / 售完"
                    >
                      {d.soldOut ? "售完" : "正常"}
                    </button>
                  </td>

                  <td className="drink-time-cell">{getListedAt(d)}</td>
                  <td className="drink-time-cell">{getUnlistedAt(d)}</td>

                  <td>
                    {d.imageUrl ? (
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        className="drink-img clickable"
                        onClick={() => onPreviewImage(d)}
                        onError={(e) => {
                          e.currentTarget.src = "/no-image.png";
                        }}
                      />
                    ) : (
                      "無"
                    )}
                  </td>

                  <td>
                    <div className="drink-action-buttons">
                      <button type="button" onClick={() => onEdit(d)}>
                        編輯
                      </button>

                      <button type="button" onClick={() => onDelete(d.id)}>
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDrinkList;