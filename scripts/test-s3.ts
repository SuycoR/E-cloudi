import fs from "fs";

async function main() {
  const url =
    "https://e-cloudi-service-amzon.s3.us-east-1.amazonaws.com/avatars/...";

  const response = await fetch(url);

  console.log("status:", response.status);
  console.log("content-type:", response.headers.get("content-type"));

  const buffer = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync("avatar.jpg", buffer);

  console.log("ok");
}

main();