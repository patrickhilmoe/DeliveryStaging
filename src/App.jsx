import React, { useState, useCallback, useEffect } from 'react';
import { Camera } from './components/Camera';
import { ProductTable } from './components/ProductTable';
import { OCRResult } from './components/OCRResult';
import { sampleProducts } from './data/products';
import { extractTextFromImage, findProductMatches, terminateOCR } from './utils/ocr';
import { ScanLine, Zap, Database, X } from 'lucide-react';
// import google from '@google-cloud/vision';
import axios from 'axios';



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

// Creates a client
// const client = new google.ImageAnnotatorClient();

// /**
//  * TODO(developer): Uncomment the following line before running the sample.
//  */
// const fileName = "./data/sign_small.jpg";
// async function visions() {

  // const vision = require('@google-cloud/vision');

  // Creates a client
//   const client = new google.ImageAnnotatorClient();
// //   // Performs text detection on the local file
// const [result] = await client.textDetection(fileName);
// const detections = result.textAnnotations;
// console.log('Text:');
// detections.forEach(text => console.log(text));
// console.log("working")
// }

// visions()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <ScanLine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              OCR Product Scanner
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Select a product from the database below, then use your camera to verify the model number
          </p>
        </div>

        {/* Selected Product Banner */}
        {selectedProduct && (
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-2xl px-8 py-4 shadow-lg border-2 border-blue-200 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">Selected Product</h3>
                  <p className="text-blue-600 font-mono font-medium">{selectedProduct.modelNumber}</p>
                  <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-6 flex justify-center">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-blue-200 flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-800 font-medium">{processingStatus}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{sampleProducts.length}</p>
                <p className="text-gray-600 text-sm">Products in Database</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{selectedProduct ? 1 : 0}</p>
                <p className="text-gray-600 text-sm">Selected Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ScanLine className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{extractedText ? extractedText.length : 0}</p>
                <p className="text-gray-600 text-sm">Characters Extracted</p>
              </div>
            </div>
          </div>
        </div>

        {!selectedProduct ? (
          /* Product Selection */
          <div>
            <ProductTable
              products={sampleProducts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              matchedProducts={matchedProducts}
              selectedProduct={selectedProduct}
              onProductSelect={handleProductSelect}
            />
          </div>
        ) : (
          /* Camera and Results */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <Camera onCapture={handleCapture} isProcessing={isProcessing} analyzeImage={analyzeImage} />
              
              {(extractedText || capturedImage) && (
                <OCRResult
                  extractedText={extractedText}
                  matchedProducts={matchedProducts}
                  onClear={handleClearResult}
                  capturedImage={capturedImage}
                />
              )}
            </div>

            {/* Right Column */}
            <div>
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
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Tesseract.js OCR Engine</p>
        </div>
      </div>
    </div>
  );
}

export default App;