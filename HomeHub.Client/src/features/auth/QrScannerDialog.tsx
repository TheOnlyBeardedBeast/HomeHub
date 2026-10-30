import * as stylex from '@stylexjs/stylex';
import jsQR from 'jsqr';
import { CameraOff, LoaderCircle, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { colors, fonts, motion, radius } from '../../styles/tokens.stylex';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';

const SCAN_INTERVAL = 180;

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

function cameraMessage(error: unknown): string {
  if (!window.isSecureContext) {
    return 'Camera scanning needs a secure connection. Open HomeHub over HTTPS, or paste the key instead.';
  }
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera access was blocked. Allow the camera in your browser and try again.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No camera was found on this device. Paste the key instead.';
  }
  if (name === 'NotReadableError') {
    return 'The camera is busy in another app. Close it and try again.';
  }
  return 'The camera could not start. Try again, or paste the key instead.';
}

const styles = stylex.create({
  frame: {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '4 / 3',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: '#000000',
  },
  video: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
  guide: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '56%',
    aspectRatio: '1',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.md,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.38)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '24px',
    textAlign: 'center',
    color: '#f4f1ea',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  overlayIcon: { color: '#a49d91' },
  overlayTitle: {
    fontFamily: fonts.sans,
    fontSize: '14px',
    fontWeight: 620,
    margin: 0,
  },
  overlayText: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    lineHeight: 1.5,
    color: '#d3cdc2',
    margin: 0,
    maxWidth: '300px',
  },
  spinner: {
    animationName: 'homehub-spin',
    animationDuration: '850ms',
    animationIterationCount: 'infinite',
  },
  hint: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontFamily: fonts.sans,
    fontSize: '12px',
    lineHeight: 1.5,
    color: colors.inkMuted,
  },
  hintIcon: { flexShrink: 0, marginTop: 1, color: colors.accentInk },
  footer: { display: 'flex', justifyContent: 'flex-end', width: '100%' },
  fadeIn: {
    animationName: 'homehub-fade-in',
    animationDuration: motion.base,
    animationFillMode: 'both',
  },
});

export function QrScannerDialog({
  onClose,
  onScan,
}: {
  onClose: () => void;
  onScan: (value: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let stopped = false;

    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
      .BarcodeDetector;
    let detector: BarcodeDetectorLike | null = null;
    if (Detector) {
      try {
        detector = new Detector({ formats: ['qr_code'] });
      } catch {
        detector = null;
      }
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    function stop() {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    async function detect(video: HTMLVideoElement): Promise<string | null> {
      if (detector) {
        try {
          const codes = await detector.detect(video);
          if (codes[0]?.rawValue) return codes[0].rawValue;
        } catch {
          detector = null;
        }
      }
      if (!context || video.readyState < 2) return null;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (!canvas.width || !canvas.height) return null;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      return jsQR(image.data, image.width, image.height)?.data ?? null;
    }

    async function scan() {
      if (stopped) return;
      const video = videoRef.current;
      if (video) {
        const value = await detect(video);
        if (value && !stopped) {
          stop();
          onScanRef.current(value.trim());
          return;
        }
      }
      if (!stopped) timer = window.setTimeout(scan, SCAN_INTERVAL);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStarting(false);
        setError(cameraMessage(new DOMException('Unsupported', 'NotSupportedError')));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (stopped) return;
        setStarting(false);
        void scan();
      } catch (cameraError) {
        if (stopped) return;
        setStarting(false);
        setError(cameraMessage(cameraError));
      }
    }

    void start();

    return stop;
  }, []);

  return (
    <Dialog
      open
      onClose={onClose}
      size="sm"
      title="Scan your key"
      description="Point the camera at the QR code shown when your household key was created."
      footer={
        <div {...stylex.props(styles.footer)}>
          <Button variant="ghost" onClick={onClose}>
            Enter key manually
          </Button>
        </div>
      }
    >
      <div {...stylex.props(styles.frame)}>
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          aria-label="Camera preview"
          {...stylex.props(styles.video)}
        />
        {!error && <div {...stylex.props(styles.guide)} />}
        {(starting || error) && (
          <div {...stylex.props(styles.overlay, styles.fadeIn)}>
            {starting ? (
              <>
                <LoaderCircle size={22} {...stylex.props(styles.spinner)} />
                <p {...stylex.props(styles.overlayTitle)}>Starting the camera…</p>
              </>
            ) : (
              <>
                <CameraOff size={24} {...stylex.props(styles.overlayIcon)} />
                <p {...stylex.props(styles.overlayTitle)}>Camera unavailable</p>
                <p {...stylex.props(styles.overlayText)}>{error}</p>
              </>
            )}
          </div>
        )}
      </div>

      {!error && (
        <p {...stylex.props(styles.hint)} style={{ marginTop: 12 }}>
          <ScanLine size={14} {...stylex.props(styles.hintIcon)} />
          Hold steady inside the frame. The key is read automatically and signs you in.
        </p>
      )}
    </Dialog>
  );
}
