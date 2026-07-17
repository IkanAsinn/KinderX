import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'
import { Button } from './ui/button'
import { Slider } from './ui/slider'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) return
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0)
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-2xl">
        <h3 className="font-heading font-bold text-xl mb-4 text-slate-800">Sesuaikan Foto</h3>
        <div className="relative w-full h-[300px] bg-slate-900 rounded-2xl overflow-hidden mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(Number(e.target.value))
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} className="rounded-xl px-6 h-11">
            Batal
          </Button>
          <Button onClick={handleSave} className="rounded-xl px-6 h-11 shadow-lg shadow-primary/20">
            Gunakan Foto
          </Button>
        </div>
      </div>
    </div>
  )
}
