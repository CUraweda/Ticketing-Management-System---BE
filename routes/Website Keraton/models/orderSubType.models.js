const { throwIfDetached } = require("puppeteer");
const { throwError } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");
const orderTypeModel = require('./orderType.models');
const logsModel = require('../../Keraton PoS/models/logs.models')

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
            include: {
                orders: {
                    where: { deleted: false, disabled: false }
                }
            }
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
        // if(data.name){
        const alreadyExist = await nameExist(data.name);
        if (ident !== 'create') if (alreadyExist && alreadyExist.id != data.id) throw new Error('Sub Type Name already exists');
        if (ident != 'update' && alreadyExist) throw Error('Sub Type Name already exist')
        if (alreadyExist && alreadyExist.disabled) data.disabled = false
        // }
        const typeExist = await orderTypeModel.isExist(data.typeId);
        if (!typeExist) throw new Error('Type doesn\'t exist')
        if (data.minimumUnits) data.minimumUnits = +data.minimumUnits
        return await prisma.orderSubType.upsert({
            where: { ...(data.id ? { id: data.id } : { name: data.name }) },
            create: data, update: data
        }).then(async (dbData) => {
            ident != "create" ? await logsModel.logUpdate(`Mengubah sub-tipe pesanan ${dbData.name}`, "Order Subtype", "Success") : await logsModel.logCreate(`Membuat sub-tipe pesanan ${dbData.name}`, "Order Subtype", "Success")
        })
    } catch (err) {
        ident != "create" ? await logsModel.logUpdate(`Mengubah sub-tipe pesanan ${data.name}`, "Order Subtype", "Failed") : await logsModel.logCreate(`Membuat sub-tipe pesanan ${data.name}`, "Order Subtype", "Failed")
        throwError(err);
    }
};

const deleteSoft = async (id) => {
    try {
        return await prisma.orderSubType.update({ where: { id }, data: { disabled: true } }).then(async (data) => {
            await logsModel.logDelete(`Menghapus sub-tipe pesanan ${data.name}`, "Order Subtype", "Success")
        })
    } catch (err) {
        await logsModel.logDelete(`Menghapus sub-tipe pesanan ID : ${id}`, "Order Subtype", "Failed")
        throwError(err)
    }
}
module.exports = { isExist, getOne, getAll, createUpdate, deleteSoft };
