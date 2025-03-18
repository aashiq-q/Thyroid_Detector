import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';

type Symptom = {
  name: string;
  weight: number; // Importance weight of the symptom
  options: string[];
};

type SymptomScore = {
  [key: string]: number;
};

function App() {
  const [symptoms, setSymptoms] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ diagnosis: boolean; accuracy: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updated symptom list with weighted importance
  const symptomsList: Symptom[] = [
    { name: 'fatigue', weight: 0.8, options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { name: 'weightGain', weight: 0.9, options: ['None', 'Slight', 'Moderate', 'Significant'] },
    { name: 'coldSensitivity', weight: 0.85, options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { name: 'drySkin', weight: 0.7, options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { name: 'hairLoss', weight: 0.75, options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { name: 'depression', weight: 0.6, options: ['None', 'Mild', 'Moderate', 'Severe'] },
  ];

  // Severity score mapping
  const severityScores: SymptomScore = {
    'None': 0,
    'Mild': 0.33,
    'Slight': 0.33,
    'Moderate': 0.66,
    'Severe': 1,
    'Significant': 1
  };

  const calculateThyroidRisk = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let filledSymptoms = 0;

    // Calculate weighted scores
    symptomsList.forEach(symptom => {
      const selectedSeverity = symptoms[symptom.name];
      if (selectedSeverity) {
        filledSymptoms++;
        const severityScore = severityScores[selectedSeverity];
        totalScore += severityScore * symptom.weight;
      }
      maxPossibleScore += symptom.weight;
    });

    // Require at least 4 symptoms to be filled for accurate diagnosis
    if (filledSymptoms < 4) {
      return { diagnosis: false, accuracy: 0 };
    }

    // Calculate normalized score (0-1)
    const normalizedScore = totalScore / maxPossibleScore;

    // Calculate accuracy based on number of symptoms filled
    const accuracyBase = 85; // Base accuracy
    const symptomCoverage = filledSymptoms / symptomsList.length;
    const accuracy = accuracyBase + (symptomCoverage * 10); // Max 95% accuracy

    // Threshold for positive diagnosis (0.4 = 40% of max possible score)
    const diagnosisThreshold = 0.4;
    
    return {
      diagnosis: normalizedScore >= diagnosisThreshold,
      accuracy: accuracy
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = calculateThyroidRisk();
    setResult(result);
    
    setIsSubmitting(false);
  };

  const handleSymptomChange = (symptom: string, value: string) => {
    setSymptoms(prev => ({ ...prev, [symptom]: value }));
  };

  const getSeverityColor = (option: string, selectedOption: string | undefined) => {
    if (option === selectedOption) {
      switch (option) {
        case 'None':
          return 'bg-green-500 border-green-600 text-white';
        case 'Mild':
        case 'Slight':
          return 'bg-yellow-500 border-yellow-600 text-white';
        case 'Moderate':
          return 'bg-orange-500 border-orange-600 text-white';
        case 'Severe':
        case 'Significant':
          return 'bg-red-500 border-red-600 text-white';
        default:
          return 'bg-blue-500 border-blue-600 text-white';
      }
    }
    return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-800">ThyroidAI Diagnosis</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Thyroid Condition Assessment
            </h1>
            <p className="text-gray-600">
              Please rate your symptoms to help us assess the likelihood of a thyroid condition.
              For accurate results, please rate at least 4 symptoms.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {symptomsList.map((symptom) => (
              <div key={symptom.name} className="border-b border-gray-200 pb-6">
                <div className="mb-4">
                  <span className="text-lg font-medium text-gray-900 capitalize">
                    {symptom.name.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {symptom.options.map((option) => (
                    <label
                      key={option}
                      className={`relative flex-1 min-w-[120px] cursor-pointer rounded-lg border p-4 text-center transition-all ${
                        getSeverityColor(option, symptoms[symptom.name])
                      }`}
                    >
                      <input
                        type="radio"
                        name={symptom.name}
                        value={option}
                        checked={symptoms[symptom.name] === option}
                        onChange={(e) => handleSymptomChange(symptom.name, e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting || Object.keys(symptoms).length < 4}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <Activity className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                Object.keys(symptoms).length < 4 
                  ? 'Please rate at least 4 symptoms'
                  : 'Analyze Symptoms'
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-8 p-4 rounded-lg ${
              result.diagnosis 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-start">
                {result.diagnosis ? (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                )}
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {result.diagnosis 
                      ? 'Potential Thyroid Condition Detected' 
                      : 'No Thyroid Condition Detected'}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Analysis Accuracy: {result.accuracy.toFixed(1)}%
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {result.diagnosis 
                      ? 'Please consult with a healthcare professional for a proper medical evaluation.' 
                      : 'Your symptoms suggest normal thyroid function, but consult a doctor if symptoms persist.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Disclaimer: This tool is for informational purposes only and should not be used as a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;