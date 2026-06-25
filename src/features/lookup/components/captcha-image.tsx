export function CaptchaImage({ src }: { src: string }) {
  return (
    <div className="mt-8 flex justify-center">
      <img
        src={src}
        alt="Verification code"
        className="h-14 rounded-lg border border-border bg-white px-2"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
