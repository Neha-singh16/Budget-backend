const validator = require("validator");

const validateSignUp = async (req) => {
  const { firstName, email, password } = req.body;

  if (!firstName || !email || !password) {
    throw new Error("Please fill all the feilds!!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Please provide the valid Email!!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be strong use one uppercase letter , one lowercase letter, one number and one  symbol!!"
    );
  }
};

const validateFeilds = async (req) => {
  // const {amount , date , category , subCategories , note} = req.body;
  const ALLOWED_FIELDS = [
    "amount",
    "date",
    "category",
    "subCategories",
    "note",
  ];

  const data = req.body;

  if (Object.keys(data).length === 0) {
    throw new Error("No fields provided for update!!");
  }

  const isUpdateFeilds =  Object.keys(data).every(field => 
    ALLOWED_FIELDS.includes(field)
  );
  if (!isUpdateFeilds) {
    throw new Error("Invalid feild Update");
  }
};

module.exports = {
  validateSignUp,
  validateFeilds,
};
