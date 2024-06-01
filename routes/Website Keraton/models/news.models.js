const { throwError } = require("../../utils/helper")
const { prisma } = require("../../utils/prisma")

const isExist = async (id) => {
    return await prisma.news.findFirst({ where: { id } })
}
const getAll = async  () => {
    try{
        return await prisma.news.findMany()
    }catch(err){
        throwError(err)
    }
}

const getOne = async (id) => {
    try{
        const exist = await isExist(id)
        if(exist) return exist
    }catch(err){
        throwError(err)
    }
}

const create = async (data) => {
    try{
        return await prisma.news.create({ data })
    }catch(err){
        throwError(err)
    }
}

const update = async (id, data) => {
    try{
        const exist = await isExist(id)
        if(!exist) throw Error('News didnt exist')
        return await prisma.news.update({ where: { id }, data })
    }catch(err){
        throwError(err)
    }
}

const deleteData = async (id) => {
    try{
        return await prisma.news.delete({ where: { id } })
    }catch(err){
        throwError(err)
    }
}

module.exports = { getAll, getOne, create, update, isExist , deleteData}