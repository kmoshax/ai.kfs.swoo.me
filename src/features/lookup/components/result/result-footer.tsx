export function ResultFooter({ provisional }: { provisional: boolean }) {
  return (
    <footer className="shrink-0 space-y-1.5 pt-4">
      {provisional && (
        <p className="text-xs text-muted-foreground">
          Some credit hours are estimated, so the GPA may shift slightly.
        </p>
      )}
      <p className="text-xs text-muted-foreground/70">
        Official results are issued by the faculty's student affairs.
      </p>
    </footer>
  );
}
