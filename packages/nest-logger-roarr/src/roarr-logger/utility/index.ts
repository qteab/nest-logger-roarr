export function isErrorLike(value: any) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    "name" in value &&
    "message" in value &&
    "stack" in value
  );
}
