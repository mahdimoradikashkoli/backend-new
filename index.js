const express = require("express");
const app = express();
const mongoose = require("mongoose");
const appRoot = require("app-root-path");
const cors = require("cors");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

require("dotenv").config({
  path: appRoot + "/.env",
});
console.log(process.env.PORT);

mongoose.connect(process.env.DB_URI);
// , { useNewUrlParser: true, useUnifiedTopology: true }
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'Connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

const UsersModel = mongoose.model("users", {
  name: String,
  email: String,
  password: String,
  phoneNumber:String,
  dateBrithDay:String,
  gender:String,
  userImageAddress:String,
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(appRoot + "/static/"));

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({
        msg: "Please fill in all fields",
      });
    const existingUser = await UsersModel.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "This email has already been registered" });

    const hashedPassword = await bycrypt.hash(req.body.password, 10);

    const user = new UsersModel({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res.status(201).json({
      msg: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({
      msg: "Error in registration",
    });
  }
});

app.get("/auth/register", async (req, res) => {
  const usersList = await UsersModel.find({});
  res.status(200).json({
    msg: usersList,
  });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      msg: "Please fill in all fields",
    });
  const existUser = await UsersModel.findOne({ email: email });
  if (!existUser)
    return res.status(400).json({
      msg: "user is not exist",
    });
  const corectPassword = await bycrypt.compare(password, existUser.password);
  if (!corectPassword)
    return res.status(400).json({
      msg: "The password is wrong",
    });

  const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRETE);
  const userInfo=await UsersModel.findById(id=existUser._id)
  res.status(200).json({
    token: token,userInfo
  });
});
// update user info
// const saveUserImage=multer.diskStorage(
//   {
//     destination:function(req,file,cb){
//       const uploadPath=path.join(__dirname,"/static/puplic/userimage/")
//       cb(null,uploadPath)
//     },
//     filename:function(req,file,cb){
//       cb(null, Date.now() + "-" + file.originalname);
//     },
//   }
// )
// const uploadUserImage=multer({storage:saveUserImage})
// app.put("/user/update",uploadUserImage.single("profileImage"),async(req,res)=>{
// console.log(req.file)
// console.log(req.body)
// const updateUser=await UsersModel.findByIdAndUpdate()
// res.status(201)
// })

// فرستادن سرفصل ها به بک اند
const categorieSchema = new mongoose.Schema({
  img: String,
  categorieName: String,
});

const CategoryModle = new mongoose.model("category", categorieSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "/static/puplic/categorieuploads/");
    cb(null, uploadPath); // ذخیره در مسیر ./uploads/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/create/categorie", upload.single("img"), async (req, res) => {
  const { categorieName } = req.body;
  const imgPath = "/puplic" + "/categorieuploads/" + req.file.filename;

  const newCategory = await new CategoryModle({
    img: imgPath,
    categorieName: categorieName,
  });
  newCategory.save().then((resp) => {
    res.status(201).json({
      msg: "categorie created",
      resp,
    });
  });
});

// فرستادن سرفصل ها به بخش فرانت اند

app.get("/get/categorie", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ message: "unauthorization" });
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRETE);

  if (!decodedToken) return res.status(400).json({ msg: "unauthorization" });
  const allCategorie = await CategoryModle.find({});
  res.status(200).json({
    msg: allCategorie,
  });
});

//فرستادن pupular Course به بک اند

const PupularCourseModle = mongoose.model("pupularcourse", {
  courseImageAddress: String,
  corseSubject: String,
  mentorImageAddress: String,
  mentorName: String,
  courseprice: String,
  numberOfLessons: Number,
  aboutCourse: String,
  language: String,
  numberOfStudent: Number,
  lastUpdate: String,
  subtitle: String,
  level: String,
  access: String,
  subjectOne: String,
  subjectTowe: String,
  subjectThree: String,
  subjectFor: String,
  subjectFive: String,
  subjectSix: String,
  subjectSeven: String,
  subjectEight: String,
  subjectNine: String,
  lessonOneAddress: String,
  lessonToweAddress: String,
  lessonThreeAddress: String,
  lessonForAddress: String,
  lessonFiveAddress: String,
  lessonSixAddress: String,
  lessonSevenAddress: String,
  lessonEightAddress: String,
  lessonNineAddress: String,
});

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "/static/puplic/pupularcourse");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload2 = multer({ storage: storage2 });

app.post(
  "/pupularcourse",
  upload2.array("imageandlesson[]"),
  async (req, res) => {
    if(!req.files)return res.status(400).json({msg:"Files is not exist"})
    const courseImgAddress =
      "/puplic" + "/pupularcourse/" + req.files[0].filename;
    const mentorImgAddress =
      "/puplic" + "/pupularcourse/" + req.files[1].filename;
    const lessonOneAddress =
      "/puplic" + "/pupularcourse/" + req.files[2].filename;
    const lessonToweAddress =
      "/puplic" + "/pupularcourse/" + req.files[3].filename;
    const lessonThreeAddress =
      "/puplic" + "/pupularcourse/" + req.files[4].filename;
    const lessonForAddress =
      "/puplic" + "/pupularcourse/" + req.files[5].filename;
    const lessonFiveAddress =
      "/puplic" + "/pupularcourse/" + req.files[6].filename;
    const lessonSixAddress =
      "/puplic" + "/pupularcourse/" + req.files[7].filename;
    const lessonSevenAddress =
      "/puplic" + "/pupularcourse/" + req.files[8].filename;
    const lessonEightAddress =
      "/puplic" + "/pupularcourse/" + req.files[9].filename;
    const lessonNineAddress =
      "/puplic" + "/pupularcourse/" + req.files[10].filename;

    const pupularCourse = await new PupularCourseModle({
      courseImageAddress: courseImgAddress,
      corseSubject: req.body.subjectcourse,
      mentorImageAddress: mentorImgAddress,
      mentorName: req.body.mentorname,
      courseprice: req.body.courseprice,
      numberOfLessons: req.body.numberOfLessons,
      aboutCourse: req.body.aboutCourse,
      language: req.body.language,
      numberOfStudent: req.body.numberOfStudent,
      lastUpdate: req.body.lastUpdate,
      subtitle: req.body.subtitle,
      level: req.body.level,
      access: req.body.access,
      subjectOne: req.body.subjectOne,
      subjectTowe: req.body.subjectTowe,
      subjectThree: req.body.subjectThree,
      subjectFor: req.body.subjectFor,
      subjectFive: req.body.subjectFive,
      subjectSix: req.body.subjectSix,
      subjectSeven: req.body.subjectSeven,
      subjectEight: req.body.subjectEight,
      subjectNine: req.body.subjectNine,
      lessonOneAddress: lessonOneAddress,
      lessonToweAddress: lessonToweAddress,
      lessonThreeAddress: lessonThreeAddress,
      lessonForAddress: lessonForAddress,
      lessonFiveAddress: lessonFiveAddress,
      lessonSixAddress: lessonSixAddress,
      lessonSevenAddress: lessonSevenAddress,
      lessonEightAddress: lessonEightAddress,
      lessonNineAddress: lessonNineAddress,
    });

    pupularCourse.save();
    res.status(201).json({
      msg: pupularCourse,
    });
  }
);

app.get("/get/pupuparcourse", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ message: "unauthorization" });
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRETE);
  if (!decodedToken)
    return res.status(401).json({
      msg: "unauthorization",
    });

  const allPupularCourse = await PupularCourseModle.find({});
  res.status(200).json({
    msg: allPupularCourse,
  });
});

app.get("/coursedetailes/:productid", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ message: "unauthorization" });
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRETE);
  if (!decodedToken)
    return res.status(401).json({
      msg: "unauthorization",
    });
  if (!req.params.productid)
    return res.status(400).json({ msg: "Bad request" });
  const courseDetailes = await PupularCourseModle.findById(
    req.params.productid
  );
  res.status(200).json({
    data: "secces",
    courseDetailes,
  });
});

//فرستادن TopMentor به بک اند
const TopMentorModle = mongoose.model("topmentor", {
  topMentorImage: String,
  topMentorName: String,
});

const storageTopMentor = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadTopMentor = path.join(__dirname, "/static/puplic/topmentor/");
    cb(null, uploadTopMentor);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadTopMentor = multer({ storage: storageTopMentor });

app.post(
  "/topmentor",
  uploadTopMentor.single("mentorimg"),
  async (req, res) => {
    console.log(req.file);
    const topMentorImgAddress = "/puplic" + "/topmentor/" + req.file.filename;
    const newTopMentor = await new TopMentorModle({
      topMentorImage: topMentorImgAddress,
      topMentorName: req.body.mentorname,
    });
    newTopMentor.save();
    res.status(201).json({
      msg: newTopMentor,
    });
  }
);

app.get("/get/topmentor", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ message: "unauthorization" });
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRETE);
  if (!decodedToken) return res.status(401).json({ msg: "unauthorization" });

  const allTopMentor = await TopMentorModle.find({});
  res.status(200).json({
    msg: allTopMentor,
  });
});

const PORT = process.env.PORT || 6003;
app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
