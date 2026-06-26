export function ResultFooter({
  provisional,
  trainingHours,
}: {
  provisional: boolean;
  trainingHours: number | null;
}) {
  return (
    <footer className="shrink-0 space-y-1.5 pt-4">
      {provisional && (
        <p className="text-xs text-muted-foreground">
          Some credit hours are estimated, so the GPA may shift slightly.
        </p>
      )}
      {trainingHours !== null && (
        <p className="text-xs text-muted-foreground">
          Includes {trainingHours}h summer field training — pass/fail, required
          to graduate, not counted in the GPA.
        </p>
      )}
      <p className="text-xs text-muted-foreground/70">
        Official results are issued by the faculty's student affairs.
      </p>
    </footer>
  );
}
