import React, { useState, useMemo } from "react";
import {
  Search,
  Package,
  CheckCircle,
  AlertCircle,
  Save,
  CreditCard as Edit3,
  Download
} from "lucide-react";

export const ProductTable = ({
  products,
  searchQuery,
  onSearchChange,
  matchedProducts,
  selectedProduct,
  onProductSelect,
  serialMatch,
  onSerialNumberUpdate,
  selectedDate,
  noEdit,
  onDownloadCSV
}) => {
  const [sortBy, setSortBy] = useState("StockShipped");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingSerial, setEditingSerial] = useState({});
  const [serialInputs, setSerialInputs] = useState({});

  const sortedAndFilteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];

    let filtered = list;

    if (searchQuery) {
      filtered = products.filter(
        (product) =>
          product.StockShipped.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          product.Description1.toLowerCase().includes(searchQuery.toLowerCase())
        //|| product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      const aValue = a[sortBy].toLowerCase();
      const bValue = b[sortBy].toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [products, searchQuery, sortBy, sortOrder]);

  const handleSort = (column) => {
    console.log(column);
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // row highlighting green not working
  const getRowClassName = (id) => {
    // console.log("matchedProducts?.id is: ", matchedProducts?.id)
    // console.log("serialMatch is: ", serialMatch)
    // console.log("matchedProducts.length is: ", matchedProducts)
    if (matchedProducts?.id === id && serialMatch && matchedProducts) {
      return "bg-green-50 border-green-200 shadow-sm ring-1 ring-green-200";
    }
    if (selectedProduct?.id === id) {
      return "bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-300";
    }
    return "bg-white hover:bg-gray-50 cursor-pointer";
  };

  const getMatchIcon = (id) => {
    if (selectedProduct?.id === id && serialMatch && matchedProducts) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return null;
  };
  const collectionName = selectedDate;

  // serial editing below
  // multiple serials per quantity
  const handleSerialEdit = (productId, currentSerialArray) => {
    setEditingSerial((prev) => ({ ...prev, [productId]: true }));
    // initialize per-index inputs from existing serial array
    setSerialInputs((prev) => ({
      ...prev,
      [productId]: Array.isArray(currentSerialArray)
        ? [...currentSerialArray]
        : [currentSerialArray || ""],
    }));
  };

  const handleSerialSave = (productId, idx) => {
    const newSerial =
      (serialInputs[productId] && serialInputs[productId][idx]) || "";
    onSerialNumberUpdate(productId, newSerial, collectionName, idx);
    // setEditingSerial((prev) => ({ ...prev, [productId]: false }));
    // keep local inputs in sync so UI can immediately show the saved value
    setSerialInputs((prev) => {
      const arr = Array.isArray(prev[productId]) ? [...prev[productId]] : [];
      arr[idx] = newSerial;
      return { ...prev, [productId]: arr };
    });
    setEditingSerial((prev) => ({ ...prev, [productId]: false }));
  };

  const handleSerialCancel = (productId) => {
    setEditingSerial((prev) => ({ ...prev, [productId]: false }));
    // setSerialInputs((prev) => ({ ...prev, [productId]: [] }));
    setSerialInputs((prev) => {
      const next = { ... prev };
      delete next[productId];
      return next;
    })
  };

  const handleSerialInputChange = (productId, snIdx, value) => {
    setSerialInputs((prev) => {
      const arr = Array.isArray(prev[productId]) ? [...prev[productId]] : [];
      arr[snIdx] = value;
      return { ...prev, [productId]: arr };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Database
          </h2>
          {matchedProducts && (
            <>
              {/* <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <AlertCircle className="w-4 h-4" />
                Model Number {matchedProducts} confirmed
              </div> */}
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <AlertCircle className="w-4 h-4" />
                Serial Number {serialMatch} confirmed
              </div>
            </>
          )}
                      <button
              onClick={onDownloadCSV}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              title="Download as CSV"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div style={{ pointerEvents: (localStorage.getItem("stock")) ? "auto" : "none" }} className={"overflow-x-auto"}>
      {/* <div className={`${noEdit} overflow-x-auto`}> */}
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort("StockShipped")}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Model Number
                  {sortBy === "StockShipped" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort("Description1")}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Description
                  {sortBy === "Description1" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  // onClick={() => handleSort("QuantityToShip")}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Quantity
                  {sortBy === "QuantityToShip" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort("LocationNumber")}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Location
                  {sortBy === "LocationNumber" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  // onClick={() => handleSort("SerialNumber")}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Serial Number
                  {sortBy === "SerialNumber" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredProducts.length > 0 ? (
              sortedAndFilteredProducts.map((product, index) => (
                <tr
                  key={product.id}
                  onClick={() => onProductSelect(product)}
                  className={`border-b border-gray-200 transition-all duration-200 ${getRowClassName(
                    product.id
                  )}`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeIn 0.3s ease-out forwards",
                  }}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {product.StockShipped}
                      </span>
                      {getMatchIcon(product.id)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {product.Description1}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {product.QuantityToShip}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {product.LocationNumber}
                  </td>
                  {/* added serial number editing below */}
                  <td className="px-4 py-2">
                    {(() => {
                      // prefer local inputs (most recent edit), otherwise coerce product.SerialNumber to array
                      const serialList =
                        serialInputs[product.id] ??
                        (Array.isArray(product.SerialNumber)
                          ? product.SerialNumber
                          : product.SerialNumber
                          ? [product.SerialNumber]
                          : []);

                      return serialList.map((sn, idx) => {
                        const existing =
                          serialInputs[product.id] &&
                          serialInputs[product.id][idx];
                        const value =
                          existing ??
                          (typeof sn === "object" ? sn.serial : sn) ??
                          "";

                        if (editingSerial[product.id]) {
                          return (
                            <div
                              key={`${product.id}-sn-${idx}`}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={value}
                                onChange={(e) =>
                                  handleSerialInputChange(
                                    product.id,
                                    idx,
                                    e.target.value
                                  )
                                }
                                className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter serial..."
                                autoFocus={idx === 0}
                              />
                              <button
                                onClick={() =>
                                  handleSerialSave(product.id, idx)
                                }
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSerialCancel(product.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                title="Cancel"
                              >
                                ×
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`${product.id}-sn-${idx}`}
                            className="flex items-center gap-2"
                          >
                            <span className="font-mono text-sm text-gray-700 min-w-[100px]">
                              {value}
                            </span>
                            <button
                              onClick={() =>
                                handleSerialEdit(product.id, product.SerialNumber)
                              }
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit serial number"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="justify-center">
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No products to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredProducts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No products found matching your search.</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
