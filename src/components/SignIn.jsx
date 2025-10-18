import React, { useState, useEffect, use } from "react";
import { ScanLine, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged} from "firebase/auth";

export const SignIn = ({ setIsSignedIn, isSignedIn, app }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Firebase
  const auth = getAuth(app);

//    useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (user) => {
//       setIsSignedIn(!!user);
//     });
//     return () => unsub();
//   }, [setIsSignedIn]);

//   const authSignInWithEmail = async (e) => {
//     if (e && e.preventDefault) e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       setIsSignedIn(true);
//     } catch (err) {
//       setError("Invalid email or password");
//     } finally {
//       setIsLoading(false);
//     }
//   };

// function authSignInWithEmail() {
// e.preventDefault();
//     console.log("isSignedIn:", isSignedIn)
//     setIsLoading(true);
//     setError("");
//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         // Signed in 
//         const user = userCredential.user;
//         console.log("isSignedIn:", isSignedIn)
//         setIsSignedIn(true);
//         console.log("isSignedIn:", isSignedIn)
//         setIsLoading(false);
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         setError("Please enter both Email and Password")
//       });
// }

//   useEffect(() => {
//   const auth = getAuth(app);
//   const unsub = onAuthStateChanged(auth, (user) => {
//     setIsSignedIn(!!user);
//   });
//   return () => unsub();
// }, [app, setIsSignedIn]);

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

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("isSignedIn:", isSignedIn)
        setIsSignedIn(true);
        console.log("isSignedIn:", isSignedIn)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError("Please enter both Email and Password")
      });
      setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate authentication delay
    setTimeout(() => {
      if (email && password) {
        setIsSignedIn(true);
      } else {
        setError("Please enter both email and password");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setEmail("pshilmoe@gmail.com");
    setPassword("123456");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <ScanLine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              OCR Scanner
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Sign in to access the product scanner
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit2} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
            //   onClick={() => {authSignInWithEmail}}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDemoLogin}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Use Demo Credentials
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Click to auto-fill demo login credentials
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Secure access to OCR Product Scanner</p>
        </div>
      </div>
    </div>
  );
};
