const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

const checkUserId = async () => {
  const app = require("../../../app");
  return app.locals.userId
};

const getAll = async (search, action) => {
  try {
    const conditions = [];

    if (search) {
      conditions.push({
        OR: [
          {
            user: {
              email: {
                contains: search,
              },
            },
          },
          {
            activity: {
              contains: search,
            },
          },
          {
            changedAt: {
              contains: search,
            },
          },
        ],
      });
    }

    if (action) {
      conditions.push({ action: action });
    }

    return await prisma.logs.findMany({
      where: {
        AND: conditions.length > 0 ? conditions : undefined,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdDate: "desc",
      },
    });
  } catch (err) {
    throwError(err);
  }
};
const logCreate = async (activity, changedAt, status) => {
  const userId = await checkUserId();
  if(!userId) throw Error("Local User isn't found")
  try {
    return await prisma.logs.create({
      data: {
        userId,
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
    const userId = await checkUserId();
  try {
    return await prisma.logs.create({
      data: {
        userId,
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
    const userId = await checkUserId();
  try {
    return await prisma.logs.create({
      data: {
        userId,
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
  getAll,
  logCreate,
  logUpdate,
  logDelete,
};
