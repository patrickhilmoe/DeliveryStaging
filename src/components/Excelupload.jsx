import * as XLSX from "xlsx";
import { useRef } from "react";

export const ExcelUpload = ({stock, setStock, blur, setBlur}) => {

const fileRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) readExcel(file);
  };


// const readExcel = (file) => {
//         const promise = new Promise((resolve, reject) => {
//           const fileReader = new FileReader();
//           fileReader.readAsArrayBuffer(file);
    
//           fileReader.onload = (e) => {
//             const bufferArray = e.target.result;
    
//             const wb = XLSX.read(bufferArray, { type: "buffer" });
    
//             const wsname = wb.SheetNames[0];
    
//             const ws = wb.Sheets[wsname];
    
//             const data = XLSX.utils.sheet_to_json(ws);
    
//             resolve(data);
//           };
    
//           fileReader.onerror = (error) => {
//             reject(error);
//           };
//         });
    
//         promise.then((d) => {
//           setStock(d);
//           console.log(stock);
//         });
    
    
//     }

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
      console.log("Excel data:", data);
      setStock(data);
      console.log(stock);
    //   setBlur(!blur);
    } catch (err) {
      console.error("Failed to read Excel file:", err);
    }
  };

  return (
    <>
    <button className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            onClick={() => fileRef.current.click()}
            >
      Upload TS Stock File
    </button>

     {/*Hidden file inputs*/}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />
      </>
  );
};
