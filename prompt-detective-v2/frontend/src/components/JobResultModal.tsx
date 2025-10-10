import React, { useState } from 'react';
import { X, Copy, Download, FileText, Image, Video, Check, Eye, Sparkles } from 'lucide-react';

interface StructuredPromptSection {
  title?: string;
  bullets?: string[];
}

interface StructuredPromptOverview {
  headline?: string;
  summary?: string;
  key_characteristics?: string[];
}

interface StructuredPromptData {
  overview?: StructuredPromptOverview;
  prompt?: {
    main?: string;
    quick?: string;
    negative?: string;
  };
  sections?: StructuredPromptSection[];
  technical?: {
    camera?: string[];
    lighting?: string[];
    rendering?: string[];
    materials?: string[];
  };
  style_keywords?: string[];
  color_palette?: string[];
}

interface JobResult {
  job_id: string;
  filename: string;
  content_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  main_prompt?: string;
  prompt_preview?: string;
  structured_prompt?: StructuredPromptData;
  quick_prompt?: string;
  negative_prompt?: string;
  summary?: {
    content_type: string;
    duration?: number;
    resolution?: string;
    fps?: number;
    frames_analyzed?: number;
    analysis_method?: string;
    enhancement_features?: string[];
  };
  enhancement_features?: string[];
  has_full_prompt?: boolean;
  analysis_quality?: {
    has_enhancement_features: boolean;
    has_detailed_analysis: boolean;
    analysis_timestamp: string;
    processing_successful: boolean;
  };
  error?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  processing_time_seconds?: number;
  thumbnail_url?: string;
}

interface JobResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobResult;
}

const JobResultModal: React.FC<JobResultModalProps> = ({ isOpen, onClose, job }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'prompt' | 'details' | 'metadata'>('prompt');

  if (!isOpen) return null;

  const structuredPrompt = job.structured_prompt;
  const promptBlock = structuredPrompt?.prompt;
  const mainPrompt = promptBlock?.main || job.main_prompt || '';
  const quickPrompt = promptBlock?.quick || job.quick_prompt || '';
  const negativePrompt = promptBlock?.negative || job.negative_prompt || '';
  const overview = structuredPrompt?.overview;
  const promptSections = structuredPrompt?.sections || [];
  const technical = structuredPrompt?.technical;
  const styleKeywords = structuredPrompt?.style_keywords || [];
  const colorPalette = structuredPrompt?.color_palette || [];

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = () => {
    if (job.content_type?.startsWith('video')) {
      return <Video className="w-6 h-6 text-blue-500" />;
    } else if (job.content_type?.startsWith('image')) {
      return <Image className="w-6 h-6 text-green-500" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const getStatusBadge = () => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[job.status]}`}>
        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{job.filename}</h3>
              <div className="flex items-center space-x-3 mt-1">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">
                  {formatDate(job.created_at)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'prompt', label: 'AI Prompt', icon: Sparkles },
            { id: 'details', label: 'Analysis Details', icon: Eye },
            { id: 'metadata', label: 'Metadata', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'prompt' && (
            <div className="space-y-6">
              {mainPrompt ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                        Complete AI Prompt
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyToClipboard(mainPrompt, 'main_prompt')}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {copiedField === 'main_prompt' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span>{copiedField === 'main_prompt' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => downloadAsFile(mainPrompt, `${job.filename}_prompt.txt`)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {mainPrompt}
                      </pre>
                    </div>
                  </div>

                  {(quickPrompt || negativePrompt) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickPrompt && (
                        <div className="border border-blue-200 bg-blue-50/60 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-blue-900">Quick Prompt</h5>
                              <p className="text-xs text-blue-600 mt-1">220-character optimized variant for fast iteration</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(quickPrompt, 'quick_prompt')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {copiedField === 'quick_prompt' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-sm text-blue-900 leading-relaxed">{quickPrompt}</p>
                        </div>
                      )}

                      {negativePrompt && (
                        <div className="border border-rose-200 bg-rose-50/60 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-rose-900">Negative Prompt</h5>
                              <p className="text-xs text-rose-600 mt-1">Elements to avoid for a clean render</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(negativePrompt, 'negative_prompt')}
                              className="text-rose-600 hover:text-rose-800"
                            >
                              {copiedField === 'negative_prompt' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-sm text-rose-900 leading-relaxed">{negativePrompt}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {overview && (
                    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                      <h5 className="text-base font-semibold text-gray-900 mb-2">Creative Overview</h5>
                      {overview.headline && (
                        <p className="text-lg font-medium text-gray-800 mb-2">{overview.headline}</p>
                      )}
                      {overview.summary && (
                        <p className="text-sm text-gray-600 leading-relaxed">{overview.summary}</p>
                      )}
                      {overview.key_characteristics && overview.key_characteristics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {overview.key_characteristics.map((item, idx) => (
                            <span
                              key={`${item}-${idx}`}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {promptSections.length > 0 && (
                    <div>
                      <h5 className="text-base font-semibold text-gray-900 mb-3">Prompt Building Blocks</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {promptSections.map((section, idx) => (
                          <div key={`${section.title}-${idx}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50/60">
                            {section.title && (
                              <h6 className="font-semibold text-gray-900 mb-2">{section.title}</h6>
                            )}
                            <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                              {(section.bullets || []).map((bullet, bulletIdx) => (
                                <li key={`${idx}-${bulletIdx}`}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {technical && (
                    <div>
                      <h5 className="text-base font-semibold text-gray-900 mb-3">Technical Blueprint</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {([
                          ['Camera & Optics', technical.camera],
                          ['Lighting Strategy', technical.lighting],
                          ['Rendering & Post', technical.rendering],
                          ['Materials & Surfaces', technical.materials],
                        ] as const).map(([label, values]) => (
                          values && values.length > 0 ? (
                            <div key={label} className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/40">
                              <h6 className="font-semibold text-indigo-900 mb-2">{label}</h6>
                              <ul className="space-y-1 text-sm text-indigo-900 list-disc list-inside">
                                {values.map((value, idx) => (
                                  <li key={`${label}-${idx}`}>{value}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}

                  {styleKeywords.length > 0 && (
                    <div>
                      <h5 className="text-base font-semibold text-gray-900 mb-2">Style Keywords</h5>
                      <div className="flex flex-wrap gap-2">
                        {styleKeywords.map((keyword, idx) => (
                          <span
                            key={`${keyword}-${idx}`}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {colorPalette.length > 0 && (
                    <div>
                      <h5 className="text-base font-semibold text-gray-900 mb-2">Color Palette</h5>
                      <div className="flex flex-wrap gap-3">
                        {colorPalette.map((color, idx) => (
                          <div key={`${color}-${idx}`} className="flex items-center space-x-2">
                            <span
                              className="w-6 h-6 rounded-full border border-gray-200"
                              style={{ backgroundColor: color }}
                              title={color}
                            ></span>
                            <span className="text-sm text-gray-600">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No Prompt Available</h4>
                  <p className="text-gray-400">
                    {job.status === 'completed' 
                      ? 'This analysis did not generate a prompt.'
                      : 'Prompt will be available once analysis is complete.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Enhancement Features */}
              {job.enhancement_features && job.enhancement_features.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Enhancement Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.enhancement_features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Summary */}
              {job.summary && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Analysis Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {job.summary.resolution && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolution:</span>
                        <span className="font-medium">{job.summary.resolution}</span>
                      </div>
                    )}
                    {job.summary.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{job.summary.duration}s</span>
                      </div>
                    )}
                    {job.summary.fps && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">FPS:</span>
                        <span className="font-medium">{job.summary.fps}</span>
                      </div>
                    )}
                    {job.summary.frames_analyzed && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frames Analyzed:</span>
                        <span className="font-medium">{job.summary.frames_analyzed}</span>
                      </div>
                    )}
                    {job.summary.analysis_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis Method:</span>
                        <span className="font-medium">{job.summary.analysis_method}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Processing Time */}
              {job.processing_time_seconds && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Processing Time:</span>
                      <span className="font-bold text-blue-900">{job.processing_time_seconds}s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">File Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Job ID:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{job.job_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content Type:</span>
                      <span className="font-medium">{job.content_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(job.created_at)}</span>
                    </div>
                    {job.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">{formatDate(job.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {job.analysis_quality && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Quality Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enhancement Features:</span>
                        <span className={`font-medium ${job.analysis_quality.has_enhancement_features ? 'text-green-600' : 'text-gray-400'}`}>
                          {job.analysis_quality.has_enhancement_features ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Detailed Analysis:</span>
                        <span className={`font-medium ${job.analysis_quality.has_detailed_analysis ? 'text-green-600' : 'text-gray-400'}`}>
                          {job.analysis_quality.has_detailed_analysis ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Success:</span>
                        <span className={`font-medium ${job.analysis_quality.processing_successful ? 'text-green-600' : 'text-red-600'}`}>
                          {job.analysis_quality.processing_successful ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Information */}
              {(job.error || job.error_message) && (
                <div>
                  <h4 className="text-lg font-semibold text-red-700 mb-3">Error Details</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                      {job.error || job.error_message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {mainPrompt && (
            <button
              onClick={() => downloadAsFile(mainPrompt, `${job.filename}_complete_analysis.txt`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Analysis</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobResultModal;