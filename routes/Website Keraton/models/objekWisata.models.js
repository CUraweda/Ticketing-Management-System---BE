const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")
const { update } = require("./user.models")

const getAll = async (query = {}) => {
    try {
        return await prisma.objekWisata.findMany({ ...query })
    } catch (err) {
        throwError(err)
    }
}

const getOne = async (query = {}) => {
    try {
        return await prisma.objekWisata.findFirst({ ...query })
    } catch (err) {
        throwError(err)
    }
}

const updateCreate = async (data) => {
    const { id } = data
    if (id) delete data.id
    try {
        return id ? await prisma.objekWisata.update({ data, where: { id } }) : await prisma.objekWisata.create({ data })
    } catch (err) {
        throwError(err)
    }
}

const deleteHard = async (id) => {
    try{
        const wisataExist = await getOne({ where: { id } })
        if(!wisataExist) throw Error('Wisata didnt exist')
        return await prisma.objekWisata.delete({ where: { id } })
    }catch(err){
        throwError(err)
    }
}
module.exports = { getAll, getOne, updateCreate, deleteHard}