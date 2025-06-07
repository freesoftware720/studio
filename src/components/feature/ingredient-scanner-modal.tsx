
"use client";

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { detectIngredientsFromImage } from '@/ai/flows/detect-ingredients-from-image';
import { LoadingSpinner } from './loading-spinner';
import { Camera, Upload, ScanLine, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface IngredientScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngredientsDetected: (ingredients: string[]) => void;
}

export function IngredientScannerModal({ isOpen, onClose, onIngredientsDetected }: IngredientScannerModalProps) {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentView, setCurrentView] = useState<'select' | 'camera' | 'preview'>('select');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    // Cleanup when modal is closed or component unmounts
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);
  
  useEffect(() => {
    if (!isOpen) {
        // Reset state when modal is closed
        stopCameraStream();
        setCurrentView('select');
        setCapturedImage(null);
        setDetectedIngredients([]);
        setScanError(null);
        setHasCameraPermission(null); // Reset camera permission status
    }
  }, [isOpen, stopCameraStream]);


  const requestCameraPermission = async () => {
    setHasCameraPermission(null); // Reset to show loading/pending state
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        setStream(cameraStream);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
        setCurrentView('camera');
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    } else {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access. Try uploading an image.',
      });
    }
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        setCurrentView('preview');
        stopCameraStream();
      } else {
        toast({ title: 'Capture Failed', description: 'Could not get canvas context.', variant: 'destructive'});
      }
    } else {
      toast({ title: 'Capture Failed', description: 'Video or canvas element not ready.', variant: 'destructive'});
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setCurrentView('preview');
      };
      reader.onerror = () => {
        toast({title: 'File Read Error', description: 'Could not read the selected file.', variant: 'destructive'});
      }
      reader.readAsDataURL(file);
    }
  };

  const handleScanIngredients = async () => {
    if (!capturedImage) {
      toast({ title: 'No Image Provided', description: 'Please capture or upload an image first.', variant: 'destructive' });
      return;
    }
    setIsScanning(true);
    setScanError(null);
    setDetectedIngredients([]);
    try {
      const result = await detectIngredientsFromImage({ photoDataUri: capturedImage });
      setDetectedIngredients(result.detectedIngredients);
      if (result.detectedIngredients.length === 0) {
        toast({ title: 'No Ingredients Found', description: 'The AI could not identify any distinct food ingredients in the image. Try a clearer photo.', variant: 'default' });
      } else {
         toast({ title: 'Ingredients Detected!', description: `Found ${result.detectedIngredients.length} ingredient(s).`, variant: 'default' });
      }
    } catch (error: any) {
      console.error('Error scanning ingredients:', error);
      const specificMessage = error.message || 'An unexpected error occurred while scanning.';
      setScanError(specificMessage);
      toast({ title: 'Scan Failed', description: specificMessage, variant: 'destructive' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleUseIngredients = () => {
    onIngredientsDetected(detectedIngredients);
    onClose(); // This will trigger the useEffect to clean up state
  };

  const resetScannerAndPreview = () => {
    setCapturedImage(null);
    setDetectedIngredients([]);
    setCurrentView('select');
    setScanError(null);
    stopCameraStream();
    if (fileInputRef.current) { // Reset file input
        fileInputRef.current.value = "";
    }
  };
  
  const handleDialogCloseAttempt = () => {
    // This function is called when the dialog's open state changes to false
    // The useEffect for isOpen will handle the actual cleanup
    onClose(); 
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogCloseAttempt(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center text-xl">
            <ScanLine className="mr-3 h-7 w-7 text-primary" />
            AI Ingredient Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {currentView === 'select' && (
            <div className="flex flex-col items-center justify-center space-y-6 pt-4 pb-4">
              <p className="text-muted-foreground text-center">Take a photo of your fridge/pantry or upload an image.</p>
              <Button onClick={requestCameraPermission} size="lg" className="w-full py-3 text-base">
                <Camera className="mr-2 h-5 w-5" /> Use Camera
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} size="lg" variant="outline" className="w-full py-3 text-base">
                <Upload className="mr-2 h-5 w-5" /> Upload Image
              </Button>
              <Input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
              {hasCameraPermission === false && (
                 <Alert variant="destructive" className="w-full mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Issue</AlertTitle>
                    <AlertDescription>
                        Camera access was denied or is not supported. Please check your browser settings or try uploading an image.
                    </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentView === 'camera' && (
            <div className="space-y-4">
              <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {(hasCameraPermission === null || (hasCameraPermission && !stream)) && ( // Show loading if permission pending or stream not yet set
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <LoadingSpinner text="Initializing camera..." />
                    </div>
                )}
              </div>
              <Button onClick={handleCaptureImage} className="w-full py-3 text-base" disabled={!hasCameraPermission || !stream}>
                <Camera className="mr-2 h-5 w-5" /> Capture Image
              </Button>
               <Button onClick={() => setCurrentView('select')} variant="outline" className="w-full py-3 text-base">Back to Options</Button>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {currentView === 'preview' && capturedImage && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
                <Image src={capturedImage} alt="Captured or uploaded to scan" layout="fill" objectFit="contain" />
              </div>
              <Button onClick={handleScanIngredients} disabled={isScanning} className="w-full py-3 text-base">
                {isScanning ? <LoadingSpinner text="Scanning..." size={20} /> : <><ScanLine className="mr-2 h-5 w-5" /> Scan Ingredients</>}
              </Button>
              <Button onClick={resetScannerAndPreview} variant="outline" className="w-full py-3 text-base">
                <XCircle className="mr-2 h-5 w-5" /> Clear & Use Different Image
              </Button>

              {scanError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Scan Error</AlertTitle>
                  <AlertDescription>{scanError}</AlertDescription>
                </Alert>
              )}

              {detectedIngredients.length > 0 && !isScanning && (
                <div className="space-y-3 p-1 rounded-md">
                  <h3 className="text-lg font-semibold text-primary">Detected Ingredients:</h3>
                  <div className="flex flex-wrap gap-2">
                    {detectedIngredients.map((ing, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm shadow-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                  <Button onClick={handleUseIngredients} className="w-full mt-4 py-3 text-base">
                    <CheckCircle className="mr-2 h-5 w-5" /> Use These Ingredients
                  </Button>
                </div>
              )}
               {detectedIngredients.length === 0 && !isScanning && !scanError && (
                <p className="text-muted-foreground text-center pt-2">Click "Scan Ingredients" or try a different image if no ingredients were found.</p>
               )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
