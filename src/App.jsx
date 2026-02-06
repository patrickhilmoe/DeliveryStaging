import { useState, useCallback, useEffect } from "react";
import { Camera } from "./components/Camera";
import { ProductTable } from "./components/ProductTable";
import { ScanLine } from "lucide-react";
import axios from "axios";
import { Header } from "./components/Header";
import { SignIn } from "./components/SignIn";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  setDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import signout from "./assets/icon-sign-out.svg";
import { downloadProductsAsCSV } from "./utils/csvExport";
import { Hatch } from "ldrs/react";
import "ldrs/react/Hatch.css";

function App() {
  const [extractedText, setExtractedText] = useState("");
  const [matchedProducts, setMatchedProducts] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stock, setStock] = useState([]); // Inventory Model Serial Report (using localStorage at this point)
  const [stageList, setStageList] = useState([]); // Staging list
  const [localMatch, setLocalMatch] = useState([]); // matched Timesavers model/serials
  const [localOCR, setLocalOCR] = useState([]); // OCR text array
  const [modelMatch, setModelMatch] = useState(null); // Matched Model Number
  const [serialMatch, setSerialMatch] = useState(null); // Matched Serial Number
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // firebase start
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC3qPVaaBjUhUG5dtAgjzLEQGoCopDYhxU",
    authDomain: "dandbcheckofftest.firebaseapp.com",
    projectId: "dandbcheckofftest",
    storageBucket: "dandbcheckofftest.firebasestorage.app",
    messagingSenderId: "230556784113",
    appId: "1:230556784113:web:e5ffdc10d56d189733a050",
  };

  //   const firebaseConfig = {
  //   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  //   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  //   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  //   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  //   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  //   appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  async function uploadObjectsAsDocs(collectionPath, objects) {
    console.log("Uploading objects to collection:", collectionPath, objects);
    const collectionRef = collection(db, collectionPath);
    for (const obj of objects) {
      await setDoc(doc(db, collectionPath, `${collectionPath}-${obj.id}`), obj);
    }
    console.log("Objects uploaded as separate documents successfully!");
    setIsUploading(false);
  }

  async function uploadObjectsAsDocsAdd(collectionPath, object) {
    console.log("Uploading objects to collection:", collectionPath, object);
    const collectionRef = collection(db, collectionPath);
    await setDoc(
      doc(db, collectionPath, `${collectionPath}-${object.id}`),
      object,
    );

    console.log("Objects uploaded as separate documents successfully!");
  }

  // define collection name based on selected date
  const collectionName = selectedDate;
  // set placeholder the serial number
  const serialPlaceholder = "nsy";

  const updateDate = (dateInput) => {
    if (dateInput === null || dateInput === undefined) return "";

    // If it's a JS Date
    if (dateInput instanceof Date && !isNaN(dateInput)) {
      const d = dateInput;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    // If Excel gives a numeric serial date (common)
    if (typeof dateInput === "number") {
      // convert Excel serial to JS Date (Excel epoch handling)
      const jsDate = new Date(
        (Math.round(dateInput) - 25569) * 24 * 60 * 60 * 1000,
      );
      if (!isNaN(jsDate)) {
        const yyyy = jsDate.getFullYear();
        const mm = String(jsDate.getMonth() + 1).padStart(2, "0");
        const dd = String(jsDate.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }

    // Otherwise coerce to string and handle formats like "DD/MM/YY" or "DD/MM/YYYY"
    const str = String(dateInput).trim();
    if (str.includes("/")) {
      const parts = str.split("/");
      // assume last part is year (2 or 4 digits)
      const yy = parts.pop();
      const year = yy.length === 2 ? `20${yy}` : yy;
      parts.unshift(year);
      return parts.join("-");
    }

    // fallback: try Date parsing
    const parsed = new Date(str);
    if (!isNaN(parsed)) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    // last resort — return original string
    return str;
  };

  const uploadData = (data) => {
    setIsUploading(true);
    console.log("Uploading data...", data);
    // Clean keys of stock data from Excel upload
    let id = 0;
    if (!(stageList.length === 0)) {
      id = stageList.length;
      // todo: error handling to avoid accidental duplicates
    }
    let updatedKeyStockArr = [];
    data.forEach((item) => {
      let updatedKeysStockObj = {};
      for (const key in item) {
        const updatedKey = key.replace(/[#\s]/g, "");
        updatedKeysStockObj[updatedKey] = item[key];
      }
      updatedKeysStockObj.id = id++;
      updatedKeysStockObj.SerialNumber = []; // add empty SN field for later update
      // create an object with multiple serial numbers if quantity > 1
      let qty = 1;
      console.log(
        "qty to ship is value of: ",
        typeof updatedKeysStockObj.QuantityToShip,
        "length is: ",
        updatedKeysStockObj.QuantityToShip.length,
      );
      if (updatedKeysStockObj.QuantityToShip.length > 2) {
        let splitQty = updatedKeysStockObj.QuantityToShip.split(" ");
        qty = splitQty[0];
        console.log("quantity is of number and text is: ", qty);
      } else {
        qty = Number(updatedKeysStockObj.QuantityToShip);
      }
      console.log("qty is: ", typeof qty, " and length of ", qty.length);
      console.log(
        "Quantity to ship is:",
        updatedKeysStockObj.QuantityToShip,
        "and type is:",
        typeof qty,
      );
      console.log("updated object looks like this: ", updatedKeysStockObj);
      for (let i = 1; i <= qty; i++) {
        updatedKeysStockObj.SerialNumber.push(serialPlaceholder);
      }
      updatedKeyStockArr.push(updatedKeysStockObj);
    });
    const date = updatedKeyStockArr[0].ShippingDate;
    const formattedDate = updateDate(date);
    console.log("Upload date is:", formattedDate);
    console.log("Stock updated:", updatedKeyStockArr);
    uploadObjectsAsDocs(formattedDate, updatedKeyStockArr);
  };

  const handleProductAdd = (product) => {
    console.log("Adding new product:", product);
    let id = 0;
    if (!(stageList.length === 0)) {
      id = stageList.length;
      // todo: error handling to avoid accidental duplicates
    }
    product.id = id++;
    for (let i = 1; i <= product.QuantityToShip; i++) {
      product.SerialNumber.push(serialPlaceholder);
    }
    console.log("New product to add is:", product);
    uploadObjectsAsDocsAdd(selectedDate, product);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (querySnapshot) => {
        const localData = []; // recreate/reset per snapshot
        querySnapshot.forEach((doc) => {
          localData.push({ id: doc.id, ...doc.data() });
        });
        setStageList(localData);
      },
      (error) => {
        console.error("onSnapshot error: ", error);
      },
    );

    return () => unsubscribe();
  }, [collectionName, db]);

  function authSignOut() {
    signOut(auth)
      .then(() => {})
      .catch((error) => {
        console.error(error.message);
      });
  }

  function clearAuthFields() {
    setEmail("");
    setPassword("");
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    });
    return () => unsub();
  }, [auth]);
  // firebase end

  const analyzeImage = async (imageData) => {
    try {
      if (!imageData) {
        alert("Please select and image");
        return;
      }

      function toBase64(fileOrBlob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrBlob);
        });
      }

      // Wait for base64 conversion
      const dataUrl =
        typeof imageData === "string" ? imageData : await toBase64(imageData);
      const base64Image = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

      // const apiKey = "AIzaSyCpdX3mF1XyM7J-9IElR0IzM2Hg5KQGKKs";
      const apiKey = process.env.REACT_APP_OCR_API_KEY;
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const requestData = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [{ type: "TEXT_DETECTION", maxResults: 5 }],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);
      console.log(
        "API textAnnotations response:",
        apiResponse.data.responses[0].textAnnotations,
      );
      // alert(apiResponse.data.responses[0].fullTextAnnotation.text)
      return apiResponse.data.responses[0].textAnnotations;
    } catch (error) {
      console.error("Error analyzing image ", error);
      alert("Error analyzing image. Please try again later");
    }
  };

  // Match product model numbers from stock data to extracted text ** keep in case of matching model numbers
  function matchProduct(textAnnotations) {
    // ensure we have an array to work with (fall back to state if no arg)
    const annotations = Array.isArray(textAnnotations)
      ? textAnnotations
      : Array.isArray(extractedText)
        ? extractedText
        : [];

    const textArray = annotations
      .map((a) =>
        typeof a === "string"
          ? a
          : a?.description || a?.description === 0
            ? a.description
            : "",
      )
      .filter(Boolean);

    console.log("text array is:", textArray);
    // await localOCRMatch(textArray);
    setLocalOCR(textArray);
    console.log("Local OCR stored:", localOCR);
    // match the selected model and compare against OCR text array
    for (const word of textArray) {
      if (word === selectedProduct.StockShipped) {
        console.log("Match found:", word);
        return word;
      }
    }
  }

  // local model match without promise from stock data - using TEMPORARY TimesaversSerial data
  function localModelMatch(match) {
    console.log("model to match batch of local stock:", match);
    //** keeping this commented out in case of testing
    // const localMatches = TimesaversSerial.filter(
    //   (item) => item.StockNumber === match
    // );
    const localStorageStock = localStorage.getItem("stock");
    const localStorageStockParse = JSON.parse(localStorageStock);
    const localMatches = localStorageStockParse.filter(
      (item) => item.StockNumber === match,
    );
    // filter matches using state stored stock
    // const localMatches = stock.filter(
    //   (item) => item.StockNumber === match
    // );
    setLocalMatch(localMatches);
    console.log("Local matches found:", localMatches);
    return localMatches;
  }
  // matching serial number to matched OCR model number
  function matchSerial(text, stockMatchArray) {
    if (!Array.isArray(text) || !Array.isArray(stockMatchArray)) return null;

    for (const tsSerial of stockMatchArray) {
      for (const item of text) {
        // item may be a string or an object like { description: "..." }
        const value = typeof item === "string" ? item : item?.description;
        if (!value) continue;

        if (tsSerial.TrackingNumber === value) {
          console.log("Serial unit found:", item);
          console.log("Serial unit found in TS:", tsSerial);
          setSerialMatch(value);
          console.log("Serial matched set to state:", value);
          return value;
        }
      }
    }

    return null;
  }
  // matching serial number based on selected product model number
  function matchSerial2(text, stockMatchArray) {
    if (!Array.isArray(text) || !Array.isArray(stockMatchArray)) return null;

    for (const tsSerial of stockMatchArray) {
      for (const item of text) {
        // item may be a string or an object like { description: "..." }

        const value = typeof item === "string" ? item : item?.description;
        if (!value) continue;
        // console.log("ts trackingnum: ", tsSerial.TrackingNumber, "and ocr num: ", value)
        if (tsSerial.TrackingNumber === value) {
          console.log("Serial unit found:", item);
          console.log("Serial unit found in TS:", tsSerial);
          setSerialMatch(value);
          console.log("Serial matched set to state:", value);
          return tsSerial;
        }
      }
    }

    return null;
  }
  // ** redunant to capture image text with model and serial number ** keep in case of matching model number
  // const handleCapture = useCallback(async (imageData, productId) => {
  //   // setCapturedImage(imageData);
  //   setIsProcessing(true);
  //   setProcessingStatus("Initializing OCR...");

  //   try {
  //     setProcessingStatus("Analyzing image...");
  //     const text = await analyzeImage(imageData);
  //     setExtractedText(text);

  //     setProcessingStatus("Finding matches...");
  //     // if the model has its picture taken but need the serial number. bypass matching model number
  //     let matchingSerial = "";
  //     if (!modelMatch) {
  //       const match = matchProduct(text);
  //       setModelMatch(match);
  //       if (!match) {
  //         alert("No matching model number found in the image.");
  //         return;
  //       }
  //       console.log("Model matched is:", match);
  //       setMatchedProducts(match ? [match] : []);
  //       console.log("Matched products:", match);
  //       // store array of the matched model number from the Serial Number Stcok
  //       const stockMatchArray = localModelMatch(match);
  //       console.log("Local stored matches:", stockMatchArray);
  //       matchingSerial = matchSerial(text, stockMatchArray);
  //     if (!matchingSerial) {
  //       console.log("triggering here")
  //       stockMatchArray.length === 0 ?
  //       alert("This model doesn't have a serial or isn't recieved yet.") : // if it is a model that doesn't have a serial or isn't recieved yet
  //       alert("No matching serial number found in the image.");
  //       return;
  //     };
  //     } else {
  //       // match OCR text array with model matched SN Stock array
  //       matchingSerial = matchSerial(text, localMatch);
  //       if (!matchingSerial) {
  //         console.log("triggering here")
  //         localMatch.length === 0 ?
  //         alert("This model doesn't have a serial or isn't recieved yet.") : // if it is a model that doesn't have a serial or isn't recieved yet
  //         alert("No matching serial number found in the image.");
  //         return;
  //       };
  //       console.log("Matching serial is:", matchingSerial);
  //     }
  //     handleSerialNumberUpdate(productId, matchingSerial, collectionName);

  //     // setProcessingStatus('Finding Serial Number...');
  //     setModelMatch(null)
  //     setProcessingStatus("");
  //   } catch (error) {
  //     console.error("OCR processing failed:", error);
  //     setExtractedText("Failed to extract text from image. Please try again.");
  //     setMatchedProducts([]);
  //     setProcessingStatus("");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // });

  // capture image text with only serial number and selected model number
  const handleCaptureSN = useCallback(async (imageData, productId) => {
    // setCapturedImage(imageData);
    setIsProcessing(true);
    setProcessingStatus("Initializing OCR...");

    try {
      setProcessingStatus("Analyzing image...");
      const text = await analyzeImage(imageData);
      setExtractedText(text);

      setProcessingStatus("Finding matches...");

      const model = selectedProduct.StockShipped;
      const stockMatchArray = localModelMatch(model);
      console.table("Local stored matches:", stockMatchArray);
      const matchingSerial = matchSerial2(text, stockMatchArray); // returns object with model and serial info
      setMatchedProducts(matchingSerial);
      if (!matchingSerial) {
        console.log("triggering here");
        stockMatchArray.length === 0
          ? alert("This model doesn't have a serial or isn't recieved yet.") // if it is a model that doesn't have a serial or isn't recieved yet
          : alert("No matching serial number found in the image.");
        return;
      }
      console.log("Matching serial is:", matchingSerial.TrackingNumber);
      console.log(
        "matching model number is:",
        selectedProduct,
        "with ts stock mode:",
        matchingSerial.StockNumber,
      );
      handleSerialNumberUpdate(
        productId,
        matchingSerial.TrackingNumber,
        collectionName,
      );

      setProcessingStatus("");
    } catch (error) {
      console.error("OCR processing failed:", error);
      setExtractedText("Failed to extract text from image. Please try again.");
      setMatchedProducts(null);
      setProcessingStatus("");
    } finally {
      setIsProcessing(false);
    }
  });

  const handleClearResult = useCallback(() => {
    setExtractedText("");
    setMatchedProducts(null);
    // setCapturedImage("");
    setSelectedProduct(null);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setExtractedText("");
    setMatchedProducts(null);
    // setCapturedImage("");
    setModelMatch(null);
  }, []);

  async function handleSerialNumberUpdate(
    productId,
    newSerial,
    collectionPath,
    idx,
  ) {
    console.log("Updating product", productId, "with serial number", newSerial);
    // serial number array of the same product id
    const snObj = stageList.filter((item) => {
      if (item.id === productId) {
        return item.SerialNumber;
      }
    });
    // update the specific index in the serial number array
    // console.log("Current obj is:", snObj);
    const snArray = Array.isArray(snObj[0].SerialNumber)
      ? [...snObj[0].SerialNumber]
      : [];
    console.log("Current SN array is:", snArray);
    if (idx) {
      // update using index when manually making changes
      console.log("Updating index:", idx, "with new serial:", newSerial);
      snArray[idx] = newSerial;
    } else {
      // update the next placeholder serial
      let idx = "";
      snArray.forEach((item, index) => {
        let val = true;
        if (val && item === serialPlaceholder) {
          console.log("updating item:", item, "with serial: ", newSerial);
          idx = index;
          val = false;
        }
      });
      snArray[idx] = newSerial;
    }
    console.log("Updated SN array is:", snArray);
    const docId = `${collectionPath}-${productId}`;
    // update entire serial number array in firestore
    try {
      await updateDoc(doc(db, collectionPath, docId), {
        SerialNumber: snArray,
      });

      // optimistic update so UI shows the new serial immediately
      setStageList((prev) =>
        prev.map((p) =>
          p.id === docId || p.id === productId
            ? { ...p, SerialNumber: snArray }
            : p,
        ),
      );

      // console.log("Updated product", docId, "with serial number", newSerial);
      // console.log("Updated product", docId, "with serial number", snArray);
    } catch (err) {
      console.error("Failed to update serial:", err);
    }
  }

  // If not signed in, show sign-in page
  if (!isSignedIn) {
    return (
      <SignIn setIsSignedIn={setIsSignedIn} isSignedIn={isSignedIn} app={app} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <div className="flex mb-4 justify-between">
            <Header
              setStock={setStock}
              stageList={stageList}
              setStageList={setStageList}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              db={db}
              uploadData={uploadData}
            />
            <button onClick={authSignOut} className="icon-btn float-right">
              <img src={signout} className="icon-img-btn" />
            </button>
          </div>
        </div>
        {/* When uploading to firebase */}
        {isUploading && (
          <div className="flex flex-row items-center justify-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Uploading...</h2>
            <Hatch size={50} speed={4.5} bgOpacity={0.25} />
          </div>
        )}
        <div className="transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Kill List Scanner
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Upload the Stock File. Select a product below, then use your
              camera to verify the serial number
            </p>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mb-6 flex justify-center">
              <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-blue-200 flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-blue-800 font-medium">
                  {processingStatus}
                </span>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-10 grid-cols-1 gap-2">
            {/* Left Column */}
            <div
              style={{
                pointerEvents: localStorage.getItem("stock") ? "auto" : "none",
              }}
              className={
                "space-y-6 grid col-span-3 gap-6 sticky top-0 self-start z-20 bg-transparent"
              }
            >
              {/* <div style={{ display: (localStorage.getItem("stock")) ? "pointer-events-auto" : "pointer-events-none" }} className={`${noEdit} space-y-6 grid col-span-3 gap-6 sticky top-0 self-start z-20 bg-transparent`}> */}
              <Camera
                // onCapture={handleCapture}
                onCaptureSN={handleCaptureSN}
                isProcessing={isProcessing}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                extractedText={extractedText}
              />
            </div>

            {/* Right Column */}
            <div className="grid col-span-7 gap-6">
              <ProductTable
                products={stageList}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                matchedProducts={matchedProducts}
                selectedProduct={selectedProduct}
                onProductSelect={handleProductSelect}
                serialMatch={serialMatch}
                onSerialNumberUpdate={handleSerialNumberUpdate}
                selectedDate={selectedDate}
                onDownloadCSV={() => downloadProductsAsCSV(stageList)}
                onProductAdd={handleProductAdd}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
