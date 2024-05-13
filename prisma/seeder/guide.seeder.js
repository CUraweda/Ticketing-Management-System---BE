const { throwError } = require('../../routes/utils/helper')
const { prisma } = require('../../routes/utils/prisma')

const guides = [
  {
    name: 'Udin Sucipto',
    email: 'yahudin@gmail.com',
    gender: 'MALE',
    birthdate: new Date('1987-05-02')
  },
  {
    name: 'Deden Subagja',
    email: 'bagjaaslikediri@gmail.com',
    gender: 'MALE',
    birthdate: new Date('1981-07-14')
  },
  {
    name: 'Taufik Pangalengan',
    email: 'bukantopik@gmail.com',
    gender: 'MALE',
    birthdate: new Date('1993-01-29')
  },
  {
    name: 'Rofiq Magelang',
    email: 'inirofiqbukantofiq@gmail.com',
    gender: 'MALE',
    birthdate: new Date('1998-08-17')
  },
  {
    name: 'Aziz Sijabat',
    email: 'azizanyadua@gmail.com',
    gender: 'MALE',
    birthdate: new Date('2003-04-19')
  }
]

const guideData = async () => {
  try {
    for (let guide of guides) {
      await prisma.guide.upsert({
        where: { email: guide.email },
        create: guide,
        update: guide
      })
    }
  } catch (err) {
    throwError(err)
  }
}

module.exports = { guideData }
