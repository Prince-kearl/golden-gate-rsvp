export function MotionBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="motion-orb motion-orb-1" />
      <div className="motion-orb motion-orb-2" />
      <div className="motion-orb motion-orb-3" />
    </div>
  );
}
