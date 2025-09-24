export function getCanonical(path: string) {
  console.log(path);
  const url = new URL(path, process.env.HOMEPAGE);
  return url.toString();
}

export default getCanonical;
