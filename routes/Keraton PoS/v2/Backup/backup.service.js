const path = require('path')
const fs = require('fs');
const LocalJson = require("../../../utils/localJson")
const { prisma } = require("../../../utils/prisma")

const getDataReference = async (databaseName) => {
    return await prisma[databaseName].findMany()
}

const getAllTabel = async () => {
    const schema = fs.readFileSync('C:/VCS/PKL/Code/Tefa-Backend/prisma/schema.prisma', 'utf-8');
    const modelRegex = /model\s+(\w+)\s+{([^}]*)}/gs;
    let models = [];
    let match;

    while ((match = modelRegex.exec(schema)) !== null) {
        const modelName = match[1];
        const modelBody = match[2];

        const relationCount = (modelBody.match(/@relation/g) || []).length;
        const arrayCount = (modelBody.match(/\[\]/g) || []).length;

        models.push({ name: modelName, relationships: relationCount + arrayCount });
    }
    return models
}

const storeBackup = async (filePath) => {
    try {
        const jsonFile = new LocalJson(filePath)
        const { dataReferences, backups } = jsonFile.fileData
        dataReferences.sort((a, b) => a.load - b.load);
        for(let client of dataReferences){
            await prisma[client.dbName].deleteMany({});
            await prisma[client.dbName].createMany({ data: backups[client.dbName].backupDatas });
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    getDataReference,
    storeBackup,
    getAllTabel
}