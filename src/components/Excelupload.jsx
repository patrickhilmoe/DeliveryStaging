import * as XLSX from "xlsx";
import { useRef } from "react";
import { Calendar } from "lucide-react";

export const ExcelUpload = ({
  stock,
  setStock,
  blur,
  setBlur,
  stageList,
  setStageList,
  selectedDate,
  setSelectedDate,
  visibleTest,
  setVisibileTest,
  db,
  uploadData,
}) => {

  const fileRef = useRef(null);
  const fileRef2 = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) readExcel(file);
  };

  const handleFileChange2 = (event) => {
    const file = event.target.files?.[0];
    if (file) readExcel2(file);
  };

  const readExcel = async (file) => {
    try {
      const data = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        fileReader.onload = (e) => {
          try {
            const bufferArray = e.target.result;
            const wb = XLSX.read(bufferArray, { type: "buffer" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const json = XLSX.utils.sheet_to_json(ws);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      });

      let id = 0;
      let updatedKeyStockArr = [];
      data.forEach((item) => {
        let updatedKeysStockObj = {};
        for (const key in item) {
          const updatedKey = key.replace(/[#\s]/g, "");
          updatedKeysStockObj[updatedKey] = item[key];
        }
        updatedKeysStockObj.id = id++;
        updatedKeyStockArr.push(updatedKeysStockObj);
      });
      setStock(updatedKeyStockArr);
      console.log("updated data:", updatedKeyStockArr);
      //   setBlur(!blur);
    } catch (err) {
      console.error("Failed to read Excel file:", err);
    }
  };

  const readExcel2 = async (file) => {
    try {
      const data = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        fileReader.onload = (e) => {
          try {
            const bufferArray = e.target.result;
            const wb = XLSX.read(bufferArray, { type: "buffer" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const json = XLSX.utils.sheet_to_json(ws);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      });
      console.log("Excel data:", data);
      setStageList(data);
      uploadData(data);
    } catch (err) {
      console.error("Failed to read Excel file:", err);
    }
  };

  return (
    <>
      {/* Date Selector */}
      <div className="mb-2 justify-between">
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200 w-fit">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div className="flex items-center gap-2">
            <label
              htmlFor="date-select"
              className="text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div style={{ display: visibleTest ? "none" : "flex" }}>
        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          onClick={() => fileRef2.current.click()}
        >
          Upload Staging List
        </button>
      </div>
      <div style={{ display: visibleTest ? "none" : "flex" }}>
        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          onClick={() => fileRef.current.click()}
        >
          Upload TS Stock File
        </button>
      </div>

      {/*Hidden file inputs*/}
      {/* handle stock list upload */}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* handle staging list upload */}
      <input
        ref={fileRef2}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange2}
        className="hidden"
      />
    </>
  );
};
