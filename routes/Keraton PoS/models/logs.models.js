const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

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
        createdAt: 'desc',
      }
    });
  } catch (err) {
    throwError(err);
  }
};
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
  getAll,
  logCreate,
  logUpdate,
  logDelete,
};
