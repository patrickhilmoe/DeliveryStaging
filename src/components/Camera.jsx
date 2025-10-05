import React, { useRef, useCallback, useState } from "react";
import { Camera as CameraIcon, Database, X } from "lucide-react";

export const Camera = ({
  onCapture,
  isProcessing,
  analyzeImage,
  selectedProduct,
  setSelectedProduct,
}) => {
  /*camera */
  const cameraInputRef = useRef(null);

  const handleCameraCapture = () => {
    if (selectedProduct === null) {
      alert("Please select a product first.");
      return;
    }
    cameraInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // onCapture(file);
      analyzeImage(file);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-2">
      <div className="flex flex-col items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-blue-600 pb-16" />
          Camera
        </h2>
        {selectedProduct && (
          <div className="flex items-center gap-1 pb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                Selected Product
              </h3>
              <p className="text-blue-600 font-mono font-medium">
                {selectedProduct.modelNumber}
              </p>
              <p className="text-gray-600 text-sm">
                {selectedProduct.description}
              </p>
              <p className="text-gray-600 text-sm">
                {selectedProduct.orderNumber}
              </p>
              <p className="text-gray-600 text-sm">
                C# {selectedProduct.customerNumber}
              </p>
              <p className="text-gray-600 text-sm">
                Name: {selectedProduct.customerName}
              </p>
              <p className="text-gray-600 text-sm">
                Salesman: {selectedProduct.salesman}
              </p>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <button
          onClick={handleCameraCapture}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <CameraIcon className="w-5 h-5" />
          Start Camera
        </button>
      </div>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
