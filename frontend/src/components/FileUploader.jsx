import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File, X } from 'lucide-react'

function FileUploader({ onUpload, isUploading, accept }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isUploading
  })

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-slate-700">
            {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            or click to browse from your computer
          </p>
        </div>
        
        <div className="text-xs text-slate-400 mt-4">
          Supported formats: PDF, JPEG, PNG (Max 10MB)
        </div>
      </div>
    </div>
  )
}

export default FileUploader
