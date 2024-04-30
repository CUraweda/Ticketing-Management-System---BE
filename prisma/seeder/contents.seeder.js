const { prisma } = require("../../routes/utils/prisma")

const contents = [
    {
        pageId: 1,
        sectionName: "Warisan Leluhur Cirebon",
        context: {
            xs1: {
                data: "Bersama Lestarikan Keraton Tertua di Kota Cirebon",
                textSize: "",
            },
            xi1: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-1.png`
            },
            xl1: {
                data: "https://picsum.photos/200/300"
            }
        }
    },
    {
        pageId: 1,
        sectionName: "Tentang",
        context: {
            xs1: {
                data: "Keraton Kesepuham Cirebon",
                textSize: ""
            },
            xs2: {
                data: "Pada awai pembangunannya. Keraton Kasepuhan dibangun oleh Pangeran Emas Zainul Arifin dengan maksud untuk memperluas bangunan pesanggerahan Keraton Pangkuwati",
                textSize: ""
            },
            xi1: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-2.png`
            },
        }
    },
    {
        pageId: 1,
        sectionName: "Youtube Video",
        context: {
            xi1: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-3.png`
            },
            xl1: {
                data: "https://picsum.photos/200/300"
            }
        }
    },
    {
        pageId: 1,
        sectionName: "Sejarah",
        context: {
            xs1: {
                data: "Keraton Kesepuhan Cirebon"
            },
            xi1: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-4a.png`,
            },
            xi2: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-4b.png`
            },
            xi3: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-4c.png`
            },
            xl1: {
                data: "#/sejarah"
            }
        }
    },
    {
        pageId: 1,
        sectionName: "Event",
        context: {
            xs1: {
                data: "Keraton Kasepuhan Cirebon"
            },
            xi1: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-5a.png`,
            },
            xi2: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-5b.png`
            },
            xi3: {
                data: `${process.env.BASE_URL}/assets/dashboard/section-5c.png`
            },
            xl1: {
                data: "#/eventgratis"
            }
        }
    },
    {
        pageId: 1,
        sectionName: "Objek Wisata",
        context: {
            xs1: {
                data: "Keraton Kasepuhan Cirebon"
            },
            xs2: {
                data: "Mari mengenal budaya kasepuhan Cirebon. Bersama kita lestarikan dan apresiasikan beragam budaya dan tradisi Indonesia dengan mengunjungi Keraton Kasepuhan Cirebon."
            },
            xl1: {
                data: "#/areakeraton"
            }
        }
    },
    {
        pageId: 1,
        sectionName: "FAQ",
        context: {
            xs1: {
                data: "Ada pertanyaan untuk Kami?"
            },
            xs2: {
                data: "Bagaimana cara saya memesan tiket melalui website?",
                sub: "Anda bisa pergi ke halaman tiket dan mulai memilih pilihan tiket yang anda inginkan"

            },
            xs3: {
                data: "Bagaimana saya ?",
                sub: "Anda tidak bisa memesan lonte melalui website kami"

            }
        }
    }
]

const contentSeed = async () => {
    const contentLength = await prisma.contents.count()
    if (contentLength > 3) return
    for (let i in contents) {
        await prisma.contents.create({
            data: {
                ...contents[i],
                sectionOrder: +i
            }
        })
    }
}

module.exports = { contentSeed }