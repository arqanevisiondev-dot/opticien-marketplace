
"use client"

import { useState, useCallback, useRef } from "react"
import Cropper, { Area, Point } from "react-easy-crop"
import { Button } from "@/components/ui/Button"
import { X, Check, Globe, Tablet, Smartphone } from "lucide-react"

interface ImageCropperProps {
    imageFile: File
    onCropComplete: (crops: {
        desktop: string
        tablet: string
        mobile: string
    }) => void
    onCancel: () => void
}

type DeviceType = "desktop" | "tablet" | "mobile"

const CROP_ASPECTS = {
    desktop: 1920 / 600,
    tablet: 800 / 320,
    mobile: 500 / 250,
}

const CROP_LABELS = {
    desktop: "Bureau (1920x600)",
    tablet: "Tablette (800x320)",
    mobile: "Mobile (500x250)",
}

// Utility to create the cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error) => reject(error))
        image.setAttribute("crossOrigin", "anonymous") // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<string> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
        return ""
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    )

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0)

    // As Base64 string
    return canvas.toDataURL("image/jpeg")
}

function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

export default function ImageCropper({
    imageFile,
    onCropComplete,
    onCancel,
}: ImageCropperProps) {
    const [currentStep, setCurrentStep] = useState<DeviceType>("desktop")
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreas, setCroppedAreas] = useState<{
        [key in DeviceType]?: Area
    }>({})
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    // Load image from file
    useState(() => {
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            setImageSrc(reader.result?.toString() || null)
        })
        reader.readAsDataURL(imageFile)
    })

    const onCropChange = (location: Point) => {
        setCrop(location)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropAreaChange = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            // We store the crop data but don't finalize it yet
            // This is called on every move, so we might want to store it in a ref or just state
            // For simplicity, we'll store it in a ref-like object in the "next" step handler
            // But actually, we need the *pixels* when the user clicks "Next"
            // So let's store it in a temporary state
        },
        []
    )

    // We need to capture the current crop pixels when moving to next step.
    // react-easy-crop provides the pixels in onCropComplete callback
    const [currentCropPixels, setCurrentCropPixels] = useState<Area | null>(null)

    const handleCropAreaComplete = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCurrentCropPixels(croppedAreaPixels)
        },
        []
    )

    const handleNext = async () => {
        if (!currentCropPixels) return

        // Save current crop
        const newCroppedAreas = {
            ...croppedAreas,
            [currentStep]: currentCropPixels
        }
        setCroppedAreas(newCroppedAreas)

        // Reset crop/zoom for next step
        setCrop({ x: 0, y: 0 })
        setZoom(1)

        // Move to next step or finish
        if (currentStep === "desktop") {
            setCurrentStep("tablet")
        } else if (currentStep === "tablet") {
            setCurrentStep("mobile")
        } else {
            // FINISH
            await finishCropping(newCroppedAreas)
        }
    }

    const finishCropping = async (finalCroppedAreas: typeof croppedAreas) => {
        if (!imageSrc || !finalCroppedAreas.desktop || !finalCroppedAreas.tablet || !finalCroppedAreas.mobile) return

        setProcessing(true)
        try {
            const desktopUrl = await getCroppedImg(imageSrc, finalCroppedAreas.desktop)
            const tabletUrl = await getCroppedImg(imageSrc, finalCroppedAreas.tablet)
            const mobileUrl = await getCroppedImg(imageSrc, finalCroppedAreas.mobile)

            onCropComplete({
                desktop: desktopUrl,
                tablet: tabletUrl,
                mobile: mobileUrl
            })
        } catch (e) {
            console.error(e)
            alert("Erreur lors du recadrage de l'image")
        } finally {
            setProcessing(false)
        }
    }

    if (!imageSrc) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-900">
                        Recadrage de l'image - {CROP_LABELS[currentStep]}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs/Steps Indicator */}
                <div className="flex items-center justify-center p-4 bg-gray-50 border-b space-x-8">
                    <div className={`flex items-center space-x-2 ${currentStep === 'desktop' ? 'text-burning-flame font-bold' : 'text-gray-500'}`}>
                        <Globe className="w-5 h-5" />
                        <span>Bureau</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${currentStep === 'tablet' ? 'text-burning-flame font-bold' : 'text-gray-500'}`}>
                        <Tablet className="w-5 h-5" />
                        <span>Tablette</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${currentStep === 'mobile' ? 'text-burning-flame font-bold' : 'text-gray-500'}`}>
                        <Smartphone className="w-5 h-5" />
                        <span>Mobile</span>
                    </div>
                </div>

                {/* Cropper Container */}
                <div className="relative flex-1 bg-gray-900 min-h-[400px]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={CROP_ASPECTS[currentStep]}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={handleCropAreaComplete}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t flex items-center justify-between">
                    <div className="w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
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
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <Button variant="secondary" onClick={onCancel} disabled={processing}>
                            Annuler
                        </Button>
                        <Button onClick={handleNext} disabled={processing} className="flex items-center space-x-2">
                            {processing ? (
                                <span>Traitement...</span>
                            ) : (
                                <>
                                    <span>{currentStep === 'mobile' ? 'Terminer' : 'Suivant'}</span>
                                    <Check className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
