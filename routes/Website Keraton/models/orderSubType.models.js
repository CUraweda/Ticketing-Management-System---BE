const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderTypeModel = require('./orderType.models');

const isExist = async (id) => {
    try {
        return await prisma.orderSubType.findFirst({ where: { id } });
    } catch (err) {
        throwError(err);
    }
};

const nameExist = async (name) => {
    try {
        return await prisma.orderSubType.findFirst({ where: { name } });;
    } catch (err) {
        throwError(err);
    }
};

const getAll = async () => {
    try {
        return await prisma.orderSubType.findMany({
            where: { disabled: false },
            include: { orders: {
                where: { deleted: false }
            } }
        });
    } catch (err) {
        throwError(err);
    }
};

const getOne = async (id) => {
    try {
        return await prisma.orderSubType.findFirstOrThrow({
            where: { id },
            include: { orders: true }
        });
    } catch (err) {
        throwError(err);
    }
};

const createUpdate = async (ident, data = { name, typeId }) => {
    try {
        const alreadyExist = await nameExist(data.name);
        const typeExist = await orderTypeModel.isExist(data.typeId);
        if (!typeExist) throw new Error('Type doesn\'t exist')
        if (data.minimumUnits) data.minimumUnits = +data.minimumUnits
        if (ident !== 'create') if (alreadyExist) throw new Error('Sub Type Name already exists');
        if (alreadyExist && alreadyExist.disabled) data.disabled = false
        return await prisma.orderSubType.upsert({
            where:{ ...(data.id ? { id: data.id } : { name: data.name }) },
            create: data, update: data
        });
    } catch (err) {
        throwError(err);
    }
};

const deleteSoft = async (id) => {
    try {
        return await prisma.orderSubType.update({ where: { id }, data: { disabled: true } })
    } catch (err) {
        throwError(err)
    }
}
module.exports = { isExist, getOne, getAll, createUpdate, deleteSoft };
