const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderTypeModel = require('./orderType.models');

const isExist = async (id) => {
    try{
        return await prisma.orderSubType.findFirst({ where: { id } });
    } catch(err) {
        throwError(err);
    }
};

const nameExist = async (name) => {
    try{
        const nameExist = await prisma.orderSubType.findFirst({ where: { name } });
        return (nameExist != null);
    } catch(err) {
        throwError(err);
    }
};

const getAll = async () => {
    try {
        return await prisma.orderSubType.findMany({
            // where: { },
            include: { orders: true } // Include the orders relation
        });
    } catch (err) {
        throwError(err);
    }
};

const getOne = async (id) => {
    try{
        return await prisma.orderSubType.findFirstOrThrow({
            where: { id },
            include: { orders: true } // Include the orders relation
        });
    } catch(err) {
        throwError(err);
    }
};

const createUpdate = async (ident, data = { name, typeId }) => {
    try{
        if(ident !== 'edit'){
            const alreadyExist = await nameExist(data.name);
            if(alreadyExist) throw new Error('Sub Type name already exists');
            const typeExist = await orderTypeModel.isExist(data.typeId);
            if(!typeExist) throw new Error('Type doesn\'t exist');
        }
        return await prisma.orderSubType.upsert({
            where: { name: data.name },
            create: data, update: data
        });
    } catch(err) {
        throwError(err);
    }
};

module.exports = { isExist, getOne, getAll, createUpdate };
