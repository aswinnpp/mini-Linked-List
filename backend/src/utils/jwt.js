import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const generateOTP = () => Math.floor(1000 + Math.random() * 9000);


export const authenticate = (req, res, next) => {
  try {
    
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
    
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = decoded; 
    next();
  });
};

