export const websocket_options = {
  cors: {
    origin: "*",
  },
};

export const route_options = {
  origin: /.*/,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
};
