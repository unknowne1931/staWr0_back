// const jwt = require('jsonwebtoken');

// const adminMidleware = (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) {
//     return res.status(202).json({ Logout : "OUT" });
//   }

//   try {
//     const decoded = jwt.verify(token, "kanna_staWro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__"); // Replace 'kanna_staWro_founders_withhh_1931_liketha' with your actual secret
//     req.username = decoded.username;
//     if(req.username = decoded.username){
//       next();
//     }else{
//         res.status(202).json({ Logout : "OUT" });
//     }
//   } catch (err) {
    
//   }
// };

// module.exports = adminMidleware;



const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(202).json({ Logout : "OUT" });
  }

  try {
    const decoded = jwt.verify(token, "kanna_staWro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__"); // Replace with your actual secret
    req.username = decoded.username;
    if (req.username === decoded.username) {
      next();
    } else {
      return res.status(202).json({ Logout : "OUT" });
    }
  } catch (err) {
    return res.status(202).json({ Logout : "OUT" });
  }
};

module.exports = adminMiddleware;
