const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

const logCreate = async (activity, changedAt, status) => {
  const app = require("../../../app");
  try {
    return await prisma.logs.create({
      data: {
        userId: app.locals.userId,
        action: "CREATE",
        activity: activity,
        changedAt: changedAt,
        status: status,
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const logUpdate = async (activity, changedAt, status) => {
  const app = require("../../../app");
  try {
    return await prisma.logs.create({
      data: {
        userId: app.locals.userId,
        action: "UPDATE",
        activity: activity,
        changedAt: changedAt,
        status: status,
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const logDelete = async (activity, changedAt, status) => {
  const app = require("../../../app");
  console.log(app);
  try {
    return await prisma.logs.create({
      data: {
        userId: app.locals.userId,
        action: "DELETE",
        activity: activity,
        changedAt: changedAt,
        status: status,
      },
    });
  } catch (err) {
    throwError(err);
  }
};

module.exports = {
  logCreate,
  logUpdate,
  logDelete,
};
