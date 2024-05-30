const { throwError, convertFilesToURL } = require("../../utils/helper");
const { prisma } = require("../../utils/prisma");

async function isExist(id) {
    const data = await prisma.contents.findFirst({ where: { id } });
    return data;
}

const getAll = async () => {
    try {
        return await prisma.contents.findMany({ include: { page: true } });
    } catch (err) {
        throwError(err);
    }
}

const getOne = async (id) => {
    try {
        return await prisma.contents.findFirst({ where: { id } });
    } catch (err) {
        throwError(err);
    }
}

const createUpdate = async (ident, id, data) => {
    let context = {}
    const { textList, imageList, linkList } = data
    try {
        if (ident != "create") await isExist(id).then(exist => { if (!exist) throw Error('Content ID didnt Exist') })
        if (textList) {
            for (let textIndex = 0; textIndex < textList.length; textIndex++) {
                context[`xs${textIndex + 1}`] = {
                    data: textList[textIndex].data,
                    textSize: textList[textIndex].textSize,
                    sub: textList[textIndex].sub
                }
            }
            delete data.textList
            data.context = context
        }
        if (imageList) {
            for (let imgIndex = 0; imgIndex < imageList.length; imgIndex++) {
                console.log(imageList[imgIndex])
                context[`xi${imgIndex + 1}`] = {
                    data:  imageList[imgIndex]?.path ? convertFilesToURL(imageList[imgIndex].path) : imageList[imgIndex],
                    sub: imageList[imgIndex]?.sub
                }
            }
            delete data.imageList
            data.context = context
        }
        if (linkList) {
            for (let linkIndex = 0; linkIndex < linkList.length; linkIndex++) {
                console.log(linkList[linkIndex])
                context[`xl${linkIndex + 1}`] = {
                    data: linkList[linkIndex].data,
                    sub: linkList[linkIndex].sub
                }
            }
            delete data.linkList
            data.context = context
        }
        let dataToReturn
        if (ident != 'create') {
            dataToReturn = await prisma.contents.update({ where: { id }, data: { context } })
        } else dataToReturn = await prisma.contents.create({ data })
        return dataToReturn
    } catch (err) {
        throwError(err);
    }
}

module.exports = {
    createUpdate,
    getOne,
    getAll
}
