const path = require('path')
const fs = require('fs');
const LocalJson = require("../../../utils/localJson")
const { prisma } = require("../../../utils/prisma");
const { clear, table } = require('console');
const { update } = require('../../models/order.models');

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
        const arrayFieldTypes = [...modelBody.matchAll(/\w+\s+(\w+)\[\]/g)].map(match => match[1]);
        const uniqueFields = [...modelBody.matchAll(/(\w+)\s+\w+\s+@unique/g)].map(match => match[1]);

        models.push({ name: modelName, relationships: relationCount, depended: arrayFieldTypes, uniqueFields });
    }
    return models
}

const getPropertiesForModel = async (modelName) => {
    const schema = fs.readFileSync('C:/VCS/PKL/Code/Tefa-Backend/prisma/schema.prisma', 'utf-8');
    const modelRegex = new RegExp(`model\\s+${modelName}\\s+{([^}]*)}`, 'gs');
    let properties = [];

    const match = modelRegex.exec(schema);
    if (!match) {
        throw new Error(`Model '${modelName}' not found in schema.`);
    }

    const modelBody = match[1];
    const propertyRegex = /(\w+)\s+[\w\[\]]+(?![?])\s+@?/g;

    let propertyMatch;
    while ((propertyMatch = propertyRegex.exec(modelBody)) !== null) {
        properties.push(propertyMatch[1]);
    }

    return properties;
}

const storeBackup = async (filePath, deleteDatabase) => {
    try {
        const jsonFile = new LocalJson(filePath)
        let { dataReferences, backups } = jsonFile.fileData
        dataReferences.sort((a, b) => a['load'] - b['load'])

        //Delete Databases
        if (deleteDatabase) {
            const tableData = await getAllTabel()
            tableData.sort((a, b) => a.depended.length - b.depended.length)
            while (tableData.length > 0) {
                for (let dataIndex in tableData) {
                    const data = tableData[dataIndex]
                    const dependedData = []
                    if (data.depended.length < 1) {
                        await prisma[data.name].deleteMany().catch(err => { console.log(`${client.dbName} gagal dihapus, Error occured`) })
                        console.log(`${data.name} berhasil di hapus, memasuki stage backup...`)
                        tableData.splice(dataIndex, 1)
                        continue
                    }
                    for (let dependedName of data.depended) {
                        const dependedReference = tableData.find(model => model.name === dependedName)
                        if (dependedReference) dependedData.push(dependedReference)
                    }
                    if (dependedData.length < 1) {
                        await prisma[data.name].deleteMany().catch(err => { console.log(`${data.name} berhasil di hapus, memasuki stage backup...`) })
                        console.log(`${data.name} berhasil di hapus, memasuki stage backup...`)
                        tableData.splice(dataIndex, 1)
                    }
                }
            }
        }

        //Create Backup Data
        const unUsedData = []
        for (let client of dataReferences) {
            if (client.dbName === "nationality") continue
            let uniqueFields = client.uniqueFields[0]
            if (!uniqueFields) uniqueFields = "id"
            const backupDatas = backups[client.dbName].backupDatas
            if (backupDatas.length < 1) continue
            const dataToCheck = await getPropertiesForModel(capitalizeFirstChar(client.dbName))
            if (!dataToCheck) throw Error(`${client.dbName} didnt exist, please check!`)
            const dataToDb = backupDatas.filter(dataBackup => dataBackup[uniqueFields]).map((dataBackup, i) => {
                if (!deleteDatabase) delete dataBackup.id;
                return dataBackup;
            });
            await prisma[client.dbName].createMany({ data: dataToDb }).catch(err => {
                console.log(err);
            }).then(() => { console.log(`${client.dbName} successfully backuped`) })
        }
    } catch (err) {
        console.log(err)
    }
}

const capitalizeFirstChar = (str) => {
    if (!str || typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}


module.exports = {
    getDataReference,
    storeBackup,
    getAllTabel
}