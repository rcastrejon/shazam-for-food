export function ConditionalRender({
  condition,
  children,
}: React.PropsWithChildren<{ condition: boolean }>) {
  if (condition) {
    return <>{children}</>;
  }
  return null;
}
