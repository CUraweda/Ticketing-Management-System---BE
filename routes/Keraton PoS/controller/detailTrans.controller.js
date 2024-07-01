const { expressRouter } = require("../../utils/router");
const { error, success } = require("../../utils/response");
const detailTransModel = require("../models/detailTrans.models");
const { startDate, endDate, throwError } = require('../../utils/helper')

expressRouter.get("/table-data", async (req, res) => {
  try {
    const data = await detailTransModel.getTableData(req.query);
    return success(res, "Data Tabel berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get("/unavailable-guide", async (req, res) => {
  try {
    const data = await detailTransModel.getUnavailableGuide(req.query.date);
    return success(res, "Data Guide yang tidak tersedia berhasil di-fetch!", data);
  } catch (err) {
    return error(res, err.message);
  }
});
expressRouter.get('/category-sell', async (req,  res) => {
  let { start, end } = req.query
  try{
    if(!start || !end){
      start = startDate
      end = endDate
    }
    const data = await detailTransModel.getOneDaySellCategory(start, end)
    return success(res, 'Data Penjualan Category berhasil di fetch', data)
  }catch(err){
    return error(res, err.message)
  }
})


module.exports = expressRouter;
