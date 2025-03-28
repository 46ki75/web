function handler(event) {
  const request = event.request;
  let uri = request.uri;

  if (uri && uri.indexOf(".") === -1) {
    request.uri =
      uri.charAt(uri.length - 1) === "/"
        ? uri + "index.html"
        : uri + "/index.html";
  }

  return request;
}
