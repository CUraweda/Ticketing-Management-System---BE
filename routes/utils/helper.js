require("dotenv").config();
const fs = require("fs");
const multer = require("multer");
const qr = require("qr-image");

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

// QR Start
const qrDir = "./public/qrcodes";

const createQr = (data, type) => {
  const qrCodes = {};
  if (type === "ticket") {
    for (let i = 1; i <= data.amount; i++) {
      const qrData = JSON.stringify({ id: data.id, iteration: i });
      const qrImage = qr.image(qrData, { type: "png" });
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir);
      }
      const filePath = `${qrDir}/${type}_${data.id}_${i}.png`;
      qrImage.pipe(fs.createWriteStream(filePath));

      qrCodes[i - 1] = filePath;
    }
  } else if (type === "invoice") {
    const qrData = JSON.stringify({ id: data.id });
    const qrImage = qr.image(qrData, { type: "png" });
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir);
    }
    const filePath = `${qrDir}/${type}_${data.id}.png`;
    qrImage.pipe(fs.createWriteStream(filePath));

    qrCodes[0] = filePath;
  }
  return qrCodes;
};
const searchQr = (data, type) => {
  const qrCodes = {};
  if (type === "ticket") {
    for (let i = 1; i <= data.amount; i++) {
      const filePath = `${qrDir}/${type}_${data.id}_${i}.png`;
      if (fs.existsSync(filePath)) {
        qrCodes[i - 1] = filePath;
      } else {
        qrCodes[i - 1] = null;
      }
    }
  } else if (type === "invoice") {
    const filePath = `${qrDir}/${type}_${data.id}.png`;
    if (fs.existsSync(filePath)) {
      qrCodes[0] = filePath;
    } else {
      qrCodes[0] = null;
    }
  }
  return qrCodes;
};
const decodeQr = (data) => {};
// QR End

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
// Change to get all category and then take the order
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
  const urlPath = filePath.replace(/\\/g, "/").replace(/^public\//, "");
  return `${process.env.BASE_URL}/${urlPath}`;
}

function splitDate(dateTime) {
  const parts = dateTime.split("T");
  const dateParts = parts[0].split("-");
  const timeParts = parts[1].split(":");

  // Memformat tanggal (dd/mm/yyyy)
  const day = dateParts[2];
  const month = dateParts[1];
  const year = dateParts[0];
  const formattedDate = `${day}/${month}/${year}`;

  // Memformat waktu (hh.mm)
  const hours = timeParts[0];
  const minutes = timeParts[1];
  const formattedTime = `${hours}.${minutes}`;

  return [formattedDate, formattedTime];
}

const shaHash256 = async (input) => {
    // Convert the input string to an ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Use the SubtleCrypto API to hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the ArrayBuffer to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;

}

function formatCurrency(value) {
  return Number(value).toLocaleString("id-ID");
}
module.exports = {
  upload,
  today,
  startDate,
  endDate,
  createQr,
  searchQr,
  generateYearlyCategory,
  generateMonthlyCategory,
  groupedPurchase,
  groupYearData,
  groupMonthData,
  shaHash256,
  throwError,
  generateRandomString,
  convertFilesToURL,
  splitDate,
  formatCurrency
};
