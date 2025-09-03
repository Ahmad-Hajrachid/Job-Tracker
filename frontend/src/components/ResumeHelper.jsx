import React, { useState, useRef } from 'react';
import { Upload, FileText, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { chatWithPDF } from '../AI/Api'; // Direct PDF analysis
import MarkdownRenderer from './MarkDownRenderer';

const ResumeHelper = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const fileInputRef = useRef(null);

  // Analysis prompt templates
  const analysisPrompts = {
    comprehensive: `Please analyze this resume PDF and provide a comprehensive analysis in markdown format including:

## Resume Analysis Report

### 1. Overall Structure and Formatting Assessment
- Layout and visual appeal
- Section organization and hierarchy  
- Font choices and consistency
- White space usage and readability
- Length appropriateness

### 2. Content Quality and Effectiveness
- Professional summary impact
- Work experience descriptions
- Skills presentation and relevance
- Education and certifications display
- Contact information completeness

### 3. Keyword Optimization and ATS Compatibility
- Industry-specific keywords present
- Missing keywords for better searchability
- ATS-friendly formatting assessment
- Potential parsing issues identified

### 4. Strengths and Areas for Improvement
- Key strengths to leverage
- Critical areas needing attention
- Missing sections or information
- Ways to better highlight achievements

### 5. Specific Action Items
- Priority improvements ranked by impact
- Concrete examples of better phrasing
- Formatting recommendations
- Next steps for optimization

Please be specific, actionable, and use clear markdown formatting throughout.`,

    structure: `Analyze the structure and formatting of this resume PDF:

## Structure & Formatting Analysis

### Visual Layout Assessment
### Section Organization Review
### Typography and Consistency Check
### White Space and Readability Analysis
### Professional Appearance Evaluation

Provide specific recommendations for improvement.`,

    keywords: `Analyze this resume PDF for keyword optimization and ATS compatibility:

## Keyword & ATS Analysis

### Current Keywords Assessment
### Missing Industry Keywords
### ATS Compatibility Review
### Search Optimization Recommendations

Focus on actionable keyword suggestions and ATS improvements.`,

    impact: `Focus on impact and achievements in this resume PDF:

## Impact & Achievement Analysis

### Current Achievements Review
### Quantification Opportunities
### Stronger Action Verbs Suggestions
### Before/After Improvement Examples

Provide specific ways to make accomplishments more impactful.`,

    customAnalysis: (userRequest) => `Please analyze this resume PDF with focus on: ${userRequest}

Provide detailed feedback in markdown format with specific recommendations.`
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setPdfFile(file);
    await analyzeResume(file, 'comprehensive');
  };

  const analyzeResume = async (file, analysisType, customRequest = '') => {
    setIsAnalyzing(true);
    try {
      const prompt = analysisType === 'custom' 
        ? analysisPrompts.customAnalysis(customRequest)
        : analysisPrompts[analysisType];
      
      const result = await chatWithPDF(file, prompt);
      
      const newAnalysis = {
        type: analysisType,
        request: customRequest,
        result: result,
        timestamp: new Date().toLocaleTimeString()
      };

      setAnalysis(result);
      setAnalysisHistory(prev => [newAnalysis, ...prev]);
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomAnalysis = async (customRequest) => {
    if (!pdfFile || !customRequest.trim()) return;
    await analyzeResume(pdfFile, 'custom', customRequest);
  };

  const clearAnalysis = () => {
    setPdfFile(null);
    setAnalysis('');
    setAnalysisHistory([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg my-5">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Resume Analyzer</h1>
        <p className="text-gray-600">Upload your resume PDF and get instant AI-powered insights and recommendations</p>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          
          {!pdfFile ? (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                    Analyzing Resume...
                  </>
                ) : (
                  'Upload Resume (PDF)'
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">Select a PDF file to get instant analysis</p>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-lg font-medium text-green-700">{pdfFile.name}</p>
                <p className="text-sm text-gray-500">
                  {isAnalyzing ? 'Analyzing...' : 'Analysis complete'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => analyzeResume(pdfFile, 'comprehensive')}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm transition-colors flex items-center"
                  disabled={isAnalyzing}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Re-analyze
                </button>
                <button
                  onClick={clearAnalysis}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Type Buttons */}
      {pdfFile && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => analyzeResume(pdfFile, 'structure')}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm transition-colors"
            disabled={isAnalyzing}
          >
            Structure Analysis
          </button>
          <button
            onClick={() => analyzeResume(pdfFile, 'keywords')}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm transition-colors"
            disabled={isAnalyzing}
          >
            Keywords & ATS
          </button>
          <button
            onClick={() => analyzeResume(pdfFile, 'impact')}
            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm transition-colors"
            disabled={isAnalyzing}
          >
            Impact & Achievements
          </button>
        </div>
      )}

      {/* Custom Analysis Input */}
      {pdfFile && (
        <div className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask for specific analysis (e.g., 'How can I tailor this for software engineering roles?')"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleCustomAnalysis(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value.trim()) {
                  handleCustomAnalysis(input.value);
                  input.value = '';
                }
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              disabled={isAnalyzing}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Bot className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">AI Analysis Results</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <MarkdownRenderer content={analysis} />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-lg">
            <Loader2 className="animate-spin h-5 w-5 text-blue-500 mr-3" />
            <span className="text-blue-700">Analyzing your resume with AI...</span>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Previous Analyses</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analysisHistory.slice(1).map((item, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setAnalysis(item.result)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {item.type === 'custom' ? `Custom: ${item.request}` : `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)} Analysis`}
                  </span>
                  <span className="text-xs text-gray-500">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeHelper;