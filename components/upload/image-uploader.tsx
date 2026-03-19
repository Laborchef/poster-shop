'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  aspectRatio: number
  onImageSelect: (file: File, preview: string) => void
}

export function ImageUploader({ aspectRatio, onImageSelect }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      onImageSelect(file, objectUrl)
    }
  }, [onImageSelect])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })
  
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-96 object-contain rounded-lg"
              style={{ aspectRatio }}
            />
          </div>
        ) : (
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">Bild hierher ziehen</p>
            <p className="text-sm mb-2">oder klicken zum Auswählen</p>
            <p className="text-xs text-muted-foreground">PNG, JPG bis 10MB</p>
          </div>
        )}
      </div>
      
      {preview && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setPreview(null)
            onImageSelect(null as any, '')
          }}
        >
          Bild entfernen
        </Button>
      )}
    </div>
  )
}