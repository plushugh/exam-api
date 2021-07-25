require("dotenv").config();
const mongoose = require("mongoose");
const Exams = require("./models/Exams");

const fastify = require("fastify")({
  logger: true,
});

fastify.register(require("fastify-cors"), {
  origin: "*",
  methods: ["GET"],
});

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      return console.error(
        "[DB] Database connection unsuccessful, error: " + err.message
      );
    }
    console.info("[DB] Database connected");
  }
);

fastify.get("/current/:grade", async function (request, reply) {
  const now = Date.now();
  const currentExam = await Exams.findOne({
    startTime: {
      $lte: now,
    },
    endTime: {
      $gt: now,
    },
    grade: request.params.grade
  });

  if (currentExam) reply.send({ exists: true, ...currentExam._doc });
  else reply.send({ exists: false });
});

fastify.get("/next/:grade", async (request, reply) => {
  const now = Date.now();
  const nextExam = await Exams.findOne({
    startTime: { $gt: now },
    grade: request.params.grade
  });
  if (nextExam) reply.send({ exists: true, ...nextExam._doc });
  else reply.send({ exists: false });
});

fastify.listen(4000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.info(`[SERVER] Server listening on ${address}`);
});
