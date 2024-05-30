const { userSeed } = require("./user.seeder");
const { guideData } = require("./guide.seeder");
const { contentSeed } = require("./contents.seeder");
const { eventSeed } = require("./event.seeder.");
const { iterationSeed } = require("./eventIteration.seeder.");
const { nationalitySeed } = require("./nationality.seeder");
const { orderSeed } = require("./order.seeder.");
const { pageSeed } = require("./pages.seeder");
const { subTypeSeed } = require("./orderSubType.seeder");
const { typeSeed } = require("./orderType.seeder.");
const { categorySeed } = require("./category.seeder");
const { newsSeed } = require("./news.seeder");
const { paramSeed } = require("./globalParam.seeder");
const { objekWisataSeed } = require("./objekWisata.seeder");

async function main() {
  await pageSeed();
  await paramSeed()
  await newsSeed();
  await nationalitySeed();
  await userSeed();
  await guideData();
  await iterationSeed();
  await categorySeed()
  await typeSeed();
  await subTypeSeed();
  await objekWisataSeed()
  await orderSeed();
  await eventSeed();
  await contentSeed();
}

main();
