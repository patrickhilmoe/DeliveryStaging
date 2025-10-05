import React, { useState, useCallback, useEffect, use } from 'react';
import { Camera } from './components/Camera';
import { ProductTable } from './components/ProductTable';
import { OCRResult } from './components/OCRResult';
import { sampleProducts } from './data/products';
import { extractTextFromImage, findProductMatches, terminateOCR } from './utils/ocr';
import { ScanLine, Zap, Database, X } from 'lucide-react';
import axios from 'axios';
import { ExcelUpload } from './components/Excelupload';

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
  const [stock, setStock] = useState([]);

  const analyzeImage2 = async (imageData) => {
  const apiKey = "AIzaSyCpdX3mF1XyM7J-9IElR0IzM2Hg5KQGKKs";
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        image: {
          content: imageData,
        },
        features: [
          { type: 'TEXT_DETECTION' },
          { type: 'LABEL_DETECTION' },
        ],
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    console.log('Vision API Response:', data);
    // Process the data in your React component
  } catch (error) {
    console.error('Error calling Vision API:', error);
  }
};

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
      console.log(apiResponse)
      alert(apiResponse.data.responses[0].fullTextAnnotation.text)
    } catch(error) {
      console.error('Error analyzing image ', error)
        alert('Error analyzing image. Please try again later')
    }
  }

  const productModels = sampleProducts.map(product => product.modelNumber);

  const handleCapture = useCallback(async (imageData) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    setProcessingStatus('Initializing OCR...');
    
    try {
      setProcessingStatus('Analyzing image...');
      const text = await extractTextFromImage(imageData);
      setExtractedText(text);
      
      setProcessingStatus('Finding matches...');
      const matches = findProductMatches(text, productModels);
      setMatchedProducts(matches);
      
      setProcessingStatus('');
    } catch (error) {
      console.error('OCR processing failed:', error);
      setExtractedText('Failed to extract text from image. Please try again.');
      setMatchedProducts([]);
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  }, [productModels]);

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


  
  const uploadData = (() => {
    // Clean keys of stock data from Excel upload
    let id = 0;
    let updatedKeyStockArr = [];
    stock.forEach(item => {
      let updatedKeysStockObj = {};
      for (const key in item) {
        // console.log("Original Key:", key);
        const updatedKey = key.replace(/\s/g, "");
        // console.log("Updated Key:", updatedKey);
        updatedKeysStockObj[updatedKey] = item[key];
      }
      updatedKeysStockObj.id = id++;
      updatedKeyStockArr.push(updatedKeysStockObj);
    });
      console.log("Stock updated:", updatedKeyStockArr);
    });

/* add a relative div around the whole app and apply blur to it when no stock is loaded */
  const stockBlur = blur && "blur-sm bg-white/30";

  return (
    // <div className={stockBlur + " transition-all duration-500"}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className='flex justify-end mb-4'>
        <ExcelUpload stock={stock} setStock={setStock} blur={blur} setBlur={setBlur}/>
        <button onClick={uploadData}>Upload the Data!</button>
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
              analyzeImage={analyzeImage}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct} 
               />
            </div>

            {/* Right Column */}
            <div className="grid col-span-7 gap-6">
              <ProductTable
                products={sampleProducts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                matchedProducts={matchedProducts}
                selectedProduct={selectedProduct}
                onProductSelect={handleProductSelect}
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