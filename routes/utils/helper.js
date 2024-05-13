require("dotenv").config();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Logs Initialization
const logDirectory = path.join(__dirname, "..", "Keraton Pos", "logs");
const logFileName = `log-${new Date().toISOString().slice(0, 10)}.txt`;
const logFilePath = path.join(logDirectory, logFileName);

if (!fs.existsSync(logDirectory)) {
  console.log(logDirectory);
  fs.mkdirSync(logDirectory);
}

const writeLog = (log) => {
  fs.appendFileSync(logFilePath, log + "\n", (err) => {
    if (err) {
      console.error("Gagal menulis log:", err);
    }
  });
};
// Logs End
// Multer Initialization
const allowedMimeTypes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/svg",
];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./public/uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      req.fileValidationError = "Only image file are allowed";
      cb(null, false);
      return;
    }
    cb(null, true);
  },
});
// Multer End

// Detail Trans Initialization
const today = new Date();
const startDate = new Date(today);
startDate.setHours(7, 0, 0, 0);
const endDate = new Date(today);
endDate.setHours(30, 59, 59, 999);

function generateYearlyCategory() {
  const months = {
    1: "JAN",
    2: "FEB",
    3: "MAR",
    4: "APR",
    5: "MAY",
    6: "JUN",
    7: "JUL",
    8: "AUG",
    9: "SEP",
    10: "OCT",
    11: "NOV",
    12: "DEC",
  };

  const yearlyCategory = [""];
  for (let month = 1; month <= 12; month++) {
    yearlyCategory.push(months[month]);
  }
  return yearlyCategory;
}
function generateMonthlyCategory(daysInMonth) {
  const monthlyCategory = [""];
  for (let day = 1; day <= daysInMonth; day++) {
    monthlyCategory.push(day);
  }
  return monthlyCategory;
}
// Detail Trans End

// Order Initialization
function groupedPurchase(orders, category) {
  const groupedOrders = {};

  orders.forEach((order) => {
    const categoryName = order.category.name;
    if (!groupedOrders[categoryName]) {
      groupedOrders[categoryName] = 0;
    }

    order.detailTrans.forEach((detail) => {
      groupedOrders[categoryName] += detail.amount;
    });
  });

  const orderInfo = Object.keys(groupedOrders).map((category) => ({
    category,
    sum: groupedOrders[category],
  }));

  orderInfo.sort(
    (a, b) => category.indexOf(a.category) - category.indexOf(b.category)
  );

  return orderInfo;
}
function groupYearData(data, categories, colors) {
  const yearlyData = categories.map((category, index) => {
    return {
      name: category,
      color: colors[index],
      data: [0, ...Array.from({ length: 12 }, () => 0)],
    };
  });

  data.forEach((order) => {
    const categoryIndex = categories
      .map((cat) => cat)
      .indexOf(order.category.name);
    order.detailTrans.forEach((detail) => {
      const month = detail.transaction.createdDate.getMonth() + 1;
      const amount = detail.amount;
      if (categoryIndex !== -1) {
        yearlyData[categoryIndex].data[month] += parseInt(amount);
      }
    });
  });

  const yearlyCategory = generateYearlyCategory();

  return {
    yearlyCategory,
    yearlyData,
  };
}
function groupMonthData(data, categories, colors, daysInMonth) {
  const monthlyData = categories.map((category, index) => {
    return {
      name: category,
      color: colors[index],
      data: [0, ...Array.from({ length: daysInMonth }, () => 0)], // Menambahkan data kosong di index 0
    };
  });

  // Mengisi data langsung dengan amount
  data.forEach((order) => {
    const categoryIndex = categories
      .map((cat) => cat)
      .indexOf(order.category.name);
    order.detailTrans.forEach((detail) => {
      const day = detail.transaction.createdDate.getDate();
      const amount = detail.amount;
      if (categoryIndex !== -1) {
        monthlyData[categoryIndex].data[day] += amount;
      }
    });
  });

  const monthlyCategory = generateMonthlyCategory(daysInMonth);

  return {
    monthlyCategory,
    monthlyData: Object.values(monthlyData),
  };
}
// Order End

const throwError = (err) => {
  console.log(err);
  throw err;
};

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function convertFilesToURL(filePath) {
  // Replace backslashes with forward slashes and remove the leading part of the path
  const urlPath = filePath.replace(/\\/g, "/").replace(/^public\//, "");
  // Concatenate with the base URL
  return `${process.env.BASE_URL}/${urlPath}`;
}

module.exports = {
  writeLog,
  upload,
  today,
  startDate,
  endDate,
  generateYearlyCategory,
  generateMonthlyCategory,
  groupedPurchase,
  groupYearData,
  groupMonthData,
  throwError,
  generateRandomString,
  convertFilesToURL,
};
