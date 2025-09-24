type DateParameter = Date | string | number;

function dateInstance(date: DateParameter) {
  if (typeof date === "string") {
    // TODO: String Parsing...
    return new Date(date);
  }

  if (typeof date === "number") {
    return new Date(date);
  }

  return date;
}

export function dateFormat(date: DateParameter) {
  const d = dateInstance(date);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("/");
}
