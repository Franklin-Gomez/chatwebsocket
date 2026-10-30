import  { app , server } from "./index.ts";

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Socket.io server is running on port ${port}`);
});