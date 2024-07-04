const path = require('path')
const fs = require('fs');
const LocalJson = require("../../../utils/localJson")
const { prisma } = require("../../../utils/prisma")

const getDataReference = async (databaseName) => {
    return await prisma[databaseName].findMany()
}

const getAllTabel = async () => {
    const schema = fs.readFileSync('C:/VCS/PKL/Code/Tefa-Backend/prisma/schema.prisma', 'utf-8');
    const modelRegex = /model\s+(\w+)\s+{/g;
    let models = [];
    let match;
    while ((match = modelRegex.exec(schema)) !== null) {
      models.push(match[1]);
    }
    console.log(models)
    return models;
}

module.exports = {
    getDataReference,
    getAllTabel
}