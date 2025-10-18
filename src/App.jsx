import React, { useState, useCallback, useEffect } from 'react';
import { Camera } from './components/Camera';
import { ProductTable } from './components/ProductTable';
import { OCRResult } from './components/OCRResult';
import { sampleProducts } from './data/products';
import { extractTextFromImage, findProductMatches, terminateOCR } from './utils/ocr';
import { ScanLine, Zap, Database, X } from 'lucide-react';
import axios from 'axios';
import { ExcelUpload } from './components/Excelupload';
import { SignIn } from './components/SignIn';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import signout from './assets/icon-sign-out.svg';
// Temporary serials data import
import { TimesaversSerial } from './data/TimesaversSerial';

function App() {
  const [extractedText, setExtractedText] = useState('');
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [capturedImage, setCapturedImage] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [imageUri, setImageUri] = useState(null);
  const [labels, setLabels] = useState([]);

  const [blur, setBlur] = useState(false);
  // Timesavers Model Serial Report
  const [stock, setStock] = useState([]);
  // Staging list
  const [stageList, setStageList] = useState([]);
  // matched Timesavers model/serials
  const [localMatch, setLocalMatch] = useState([]);
  // OCR text array
  const [localOCR, setLocalOCR] = useState([]);
  // Matched Model Number
  const [modelMatch, setModelMatch] = useState(null);
  // Matched Serial Number
  const [serialMatch, setSerialMatch] = useState(null);
  const [visibleTest, setVisibleTest] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

// firebase start
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3qPVaaBjUhUG5dtAgjzLEQGoCopDYhxU",
  authDomain: "dandbcheckofftest.firebaseapp.com",
  projectId: "dandbcheckofftest",
  storageBucket: "dandbcheckofftest.firebasestorage.app",
  messagingSenderId: "230556784113",
  appId: "1:230556784113:web:e5ffdc10d56d189733a050"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// upload objects as separate documents to a collection
const objectsToUpload = [
  { name: "Product X", category: "Electronics" },
  { name: "Product Y", category: "Clothing" }
];

async function uploadObjectsAsDocs(collectionPath, objects) {
  console.log("Uploading objects to collection:", collectionPath, objects);
  const collectionRef = collection(db, collectionPath);
  for (const obj of objects) {
    await addDoc(collectionRef, obj);
  }
  console.log("Objects uploaded as separate documents successfully!");
}

  // set current date for firebase upload
  let date = new Date().getDate(); //Current Date
  let month = new Date().getMonth() + 1; //Current Month
  let year = new Date().getFullYear(); //Current Year
  let todayDate = year + "-" + month + "-" + date;

  // todo: when poplulating from firebase, boolean to update state item to hide stagelist button

// uploadObjectsAsDocs("2025-10-5", stageList);

  const uploadData = ((data) => {
    console.log("Uploading data...", data);
    // Clean keys of stock data from Excel upload
    let id = 0;
    let updatedKeyStockArr = [];
    data.forEach(item => {
      let updatedKeysStockObj = {};
      for (const key in item) {
        // console.log("Original Key:", key);
        const updatedKey = key.replace(/[#\s]/g, "");
        // console.log("Updated Key:", updatedKey);
        updatedKeysStockObj[updatedKey] = item[key];
      }
      updatedKeysStockObj.id = id++;
      updatedKeysStockObj.SerialNumber = ""; // add empty SN field for later update
      updatedKeyStockArr.push(updatedKeysStockObj);
    });
    console.log("Stock updated:", updatedKeyStockArr);
    uploadObjectsAsDocs("2025-10-5", updatedKeyStockArr);
    });

        const collectionName = "2025-10-5";

    useEffect(() => {
        const localData = [];
              const unsubscribe = onSnapshot(collection(db, collectionName), (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                  localData.push({id: doc.id, ...doc.data()})
            });
            setStageList(localData);
        },
                    (error) => {
              console.error("onSnapshot error: ", error);
            }
      );

      return () => unsubscribe();
    }, [collectionName, db]);

    // const collectionName = selectedDate;

    // useEffect(() => {
    //   let localData = [];
    //       onSnapshot(collection(db, collectionName), (querySnapshot) => {
    //     console.log(querySnapshot)
    //     querySnapshot.forEach((doc) => {
    //       console.log(doc.data())
    //         localData.push({...doc.data()});
    //     })
    //     setStageList(localData);
    // })
    // }, [collectionName, db]);

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

//   const analyzeImage2 = async (imageData) => {
//   const apiKey = "AIzaSyCpdX3mF1XyM7J-9IElR0IzM2Hg5KQGKKs";
//   const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

//   const requestBody = {
//     requests: [
//       {
//         image: {
//           content: imageData,
//         },
//         features: [
//           { type: 'TEXT_DETECTION' },
//           { type: 'LABEL_DETECTION' },
//         ],
//       },
//     ],
//   };

//   try {
//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestBody),
//     });
//     const data = await response.json();
//     console.log('Vision API Response:', data);
//     // Process the data in your React component
//   } catch (error) {
//     console.error('Error calling Vision API:', error);
//   }
// };

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
    const dataUrl = typeof imageData === "string" ? imageData : await toBase64(imageData);
    const base64Image = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      const apiKey = "AIzaSyCpdX3mF1XyM7J-9IElR0IzM2Hg5KQGKKs";
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

            // var encoded = Buffer.from(imageFile).toString('base64');
            // console.log(base64ImageData2)

      const requestData = {
        requests:[
          {
            image: {
              content: base64Image
            },
            features: [{ type: 'TEXT_DETECTION', maxResults: 5}]
          }
        ]
      };

      const apiResponse = await axios.post(apiURL, requestData);
      // setLabels(apiResponse.data.responses[0].labelAnnotations);
      // console.log(Labels)
      console.log("API response:", apiResponse);
      console.log("API textAnnotations response:", apiResponse.data.responses[0].textAnnotations)
      // alert(apiResponse.data.responses[0].fullTextAnnotation.text)
      return apiResponse.data.responses[0].textAnnotations;
    } catch(error) {
      console.error('Error analyzing image ', error)
        alert('Error analyzing image. Please try again later')
    }
  }

  // Match product model numbers from stock data to extracted text
  function matchProduct(textAnnotations) {
  // ensure we have an array to work with (fall back to state if no arg)
  const annotations = Array.isArray(textAnnotations) ? textAnnotations
                     : Array.isArray(extractedText) ? extractedText
                     : [];

  const textArray = annotations
    .map(a => (typeof a === 'string' ? a : (a?.description || a?.description === 0 ? a.description : '')))
    .filter(Boolean);

  console.log("text array is:", textArray);
  // await localOCRMatch(textArray);
  setLocalOCR(textArray);
  console.log("Local OCR stored:", localOCR);
    // match the selected model and compare against OCR text array
  for (const word of textArray) {
    if ( word === selectedProduct.StockShipped) {
      console.log("Match found:", word);
      return word;
    }
  }
};

// store OCR text array locally
// function localOCRMatch(ocr) {
//   return new Promise ((resolve) => resolve(setLocalOCR(ocr))) ;
// };
// store locally matched model numbers from stock data
// function localModelMatch(match) {
//   const localMatches = stock.filter(item => item.StockNumber === match);
//   // setLocalMatch(localMatches);
//   console.log("Local matches found:", localMatches);
//   return new Promise ((resolve) => resolve(setLocalMatch(localMatches))) ;
// }
// local model match without promise from stock data - using TEMPORARY TimesaversSerial data
function localModelMatch(match) {
  console.log("model to match batch of local stock:", match);
  // todo : update the temp local stock data with uploaded version
  const localMatches = TimesaversSerial.filter(item => item.StockNumber === match);
  setLocalMatch(localMatches);
  console.log("Local matches found:", localMatches);
  return localMatches;
  // return new Promise ((resolve) => resolve(setLocalMatch(localMatches))) ;
}

  // need to match model numbers to model numbers in stock data / TS serial data. Then locally store the matched serial numbers
  function matchSerial(text, stockMatchArray) {
    // need match OCR text array and array of matched TSstock
    stockMatchArray.forEach(tsSerial => {
      text.forEach(item => {
        if (tsSerial.TrackingNumber === item.description || tsSerial.TrackingNumber === item) {
          console.log("Serial unit found:", item);
          console.log("Serial unit found in TS:", tsSerial);
          setSerialMatch(item);
          return item.description || item;
        }
      });
    });
  }

  const productModels = sampleProducts.map(product => product.modelNumber);

  const handleCapture = useCallback(async (imageData) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    setProcessingStatus('Initializing OCR...');
    
    try {
      setProcessingStatus('Analyzing image...');
      const text = await analyzeImage(imageData);
      setExtractedText(text);
      
      setProcessingStatus('Finding matches...');
      const match = matchProduct(text);
      setModelMatch(match);
      console.log("Model matched is:", match);
      // await localModelMatch(match);
      // console.log("Local model match is:", localMatch);
      // setMatchedProducts(match);
      setMatchedProducts(match ? [match] : []);
      console.log("Matched products:", match);
      // store array of the matched model number from the Serial Number Stcok
      const stockMatchArray = localModelMatch(match)
      console.log("Local stored matches:", stockMatchArray);
      // match OCR text array with model matched SN Stock array
      const matchingSerial = matchSerial(text, stockMatchArray)

      // setProcessingStatus('Finding Serial Number...');
      // matchSerial(match, localMatch);
      
      setProcessingStatus('');
    } catch (error) {
      console.error('OCR processing failed:', error);
      setExtractedText('Failed to extract text from image. Please try again.');
      setMatchedProducts([]);
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  });

  console.log("matched model is:", modelMatch, "matched sn is:", serialMatch)

  const handleClearResult = useCallback(() => {
    setExtractedText('');
    setMatchedProducts([]);
    setCapturedImage('');
    setSelectedProduct(null);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setExtractedText('');
    setMatchedProducts([]);
    setCapturedImage('');
  }, []);

  useEffect(() => {
    return () => {
      terminateOCR();
    };
  }, []);

/* add a relative div around the whole app and apply blur to it when no stock is loaded */
  const stockBlur = blur && "blur-sm bg-white/30";

    const handleSerialNumberUpdate = useCallback((productId, newSerial) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, serialNumber: newSerial }
          : product
      )
    );
  }, []);

    // If not signed in, show sign-in page
  if (!isSignedIn) {
    return <SignIn setIsSignedIn={setIsSignedIn} isSignedIn={isSignedIn} app={app} />;
  }

  return (
    // <div className={stockBlur + " transition-all duration-500"}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className='flex justify-end mb-4'>
        <ExcelUpload stock={stock} setStock={setStock} blur={blur} setBlur={setBlur} stageList={stageList} setStageList={setStageList} selectedDate={selectedDate} setSelectedDate={setSelectedDate} visibleTest={visibleTest} setVisibleTest={setVisibleTest} db={db} uploadData={uploadData}/>
                    <button
              onClick={authSignOut}
              className="icon-btn"
            >
              <img src={signout} className="icon-img-btn" />
            </button>
        </div>
        <div className={stockBlur + " transition-all duration-500"}>
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
            Select a product from the database below, then use your camera to verify the serial number
          </p>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-blue-200 flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-800 font-medium">{processingStatus}</span>
            </div>
          </div>
        )}

<div className="grid lg:grid-cols-10 grid-cols-1 gap-2">
            {/* Left Column */}
            <div className="space-y-6 grid col-span-3 gap-6 sticky top-0 self-start">
              <Camera 
              onCapture={handleCapture} 
              isProcessing={isProcessing} 
              analyzeImage={handleCapture}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct} 
               />
            </div>

            {/* Right Column */}
            <div className="grid col-span-7 gap-6">
              <ProductTable
                // products={sampleProducts}
                products={stageList}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                matchedProducts={matchedProducts}
                selectedProduct={selectedProduct}
                onProductSelect={handleProductSelect}
                db={db}
                serialMatch={serialMatch}
                handleSerialNumberUpdate={handleSerialNumberUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
}

export default App;