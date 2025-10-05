import { Link } from "react-router-dom";
import { BarChart3, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-stretch justify-stretch">
      <div className="w-full px-6 md:px-10 lg:px-14 py-10">
        {/* Header */}
        <div className="w-full text-center mb-12 md:mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Exoplanet Detection
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Choose a model to analyze your data
          </p>
        </div>

        {/* Model Cards (full-width grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Tabular Model */}
          <Link
            to="/tabular"
            className="group block h-full bg-gray-800/80 hover:bg-gray-800 border-2 border-gray-700 hover:border-blue-500 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <BarChart3 className="w-10 h-10 text-blue-400" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Tabular Model
              </h2>

              <p className="text-gray-300 mb-6 max-w-prose">
                Gradient-boosted trees analyzing engineered transit features
              </p>

              <div className="w-full bg-gray-700/40 rounded-lg p-4 text-left space-y-2">
                <div className="text-sm text-gray-200">• Fast screening of candidates</div>
                <div className="text-sm text-gray-200">• Explainable predictions</div>
                <div className="text-sm text-gray-200">• Calibrated probabilities</div>
              </div>

              <div className="mt-8 inline-flex px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold group-hover:bg-blue-600 transition-colors">
                Launch Model →
              </div>
            </div>
          </Link>

          {/* Light Curve Model */}
          <Link
            to="/lightcurve"
            className="group block h-full bg-gray-800/80 hover:bg-gray-800 border-2 border-gray-700 hover:border-purple-500 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20"
          >
            <div className="flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Activity className="w-10 h-10 text-purple-400" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Light Curve Model
              </h2>

              <p className="text-gray-300 mb-6 max-w-prose">
                Deep neural network learning from time-series flux data
              </p>

              <div className="w-full bg-gray-700/40 rounded-lg p-4 text-left space-y-2">
                <div className="text-sm text-gray-200">• Deep pattern recognition</div>
                <div className="text-sm text-gray-200">• Captures subtle signals</div>
                <div className="text-sm text-gray-200">• Rejects false positives</div>
              </div>

              <div className="mt-8 inline-flex px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold group-hover:bg-purple-600 transition-colors">
                Launch Model →
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Both models trained on Kepler mission data • Results presented independently
          </p>
        </div>
      </div>
    </div>
  );
}
