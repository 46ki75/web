import cf from "cloudfront";

function base64Decode(str) {
  var chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";

  str = String(str).replace(/=+$/, "");

  for (
    var bc = 0, bs, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}

function parseBasicAuth(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    throw new Error("Authorization header is missing or invalid.");
  }

  var strings = authorizationHeader.split(" ");

  if (
    !strings ||
    strings.length !== 2 ||
    strings[0] !== "Basic" ||
    !strings[1]
  ) {
    throw new Error("Invalid Authorization header format.");
  }

  var authString = strings[1];
  var decodedAuthString = base64Decode(authString);

  if (!decodedAuthString) {
    throw new Error("Invalid base64 decoded auth string.");
  }

  var credentials = decodedAuthString.split(":");

  if (
    !credentials ||
    credentials.length !== 2 ||
    !credentials[0] ||
    !credentials[1]
  ) {
    throw new Error("Invalid basic auth format after decoding.");
  }

  return { user: credentials[0], password: credentials[1] };
}

const errorResponse = {
  statusCode: 401,
  statusDescription: "Unauthorized",
  headers: {
    "www-authenticate": { value: 'Basic realm="Restricted"' },
  },
};

const KVS_ID = "${KVS_ID}";
const kvsHandle = cf.kvs(KVS_ID);

async function handler(event) {
  try {
    let request = event.request;
    const uri = request.uri;
    const headers = request.headers;

    if (!headers || !headers.authorization || !headers.authorization.value) {
      return errorResponse;
    }

    var basicAuth = parseBasicAuth(headers.authorization.value);

    var storedPassword = await kvsHandle.get(basicAuth.user, {
      format: "string",
    });

    if (!storedPassword) {
      return errorResponse;
    }

    if (basicAuth.password === storedPassword) {
      if (uri && uri.indexOf(".") === -1 && !uri.startsWith("/api")) {
        request.uri =
          uri.charAt(uri.length - 1) === "/"
            ? uri + "index.html"
            : uri + "/index.html";
      }
      return request;
    } else {
      return errorResponse;
    }
  } catch (_) {
    return errorResponse;
  }
}
