import bcrypt from "bcrypt";
import CustomerAccount from "../models/customerModel.js";
import issueJsonWebToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

const AUTHENTICATION_COOKIE_PRESETS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * Register a new customer account
 * @route POST /customers/register
 */
export const registerCustomer = asyncHandler(async (req, res) => {
  const { name: rawName, email: rawEmail, password: rawPassword, phoneNo: rawPhone } = req.body;

  if (!rawName || !rawEmail || !rawPassword || !rawPhone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (name, email, password, phoneNo)",
    });
  }

  const normalizedEmail = String(rawEmail).trim().toLowerCase();
  const trimmedName = String(rawName).trim();
  const trimmedPhone = String(rawPhone).trim();

  if (rawPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters in length",
    });
  }

  const existingAccount = await CustomerAccount.findOne({ email: normalizedEmail });

  if (existingAccount) {
    return res.status(409).json({
      success: false,
      message: "An account with this email address already exists",
    });
  }

  const encryptedPassword = await bcrypt.hash(rawPassword, 10);

  const registeredCustomerRecord = await CustomerAccount.create({
    name: trimmedName,
    email: normalizedEmail,
    password: encryptedPassword,
    phoneNo: trimmedPhone,
    wishlist: [],
    cart: [],
  });

  const sessionAuthToken = issueJsonWebToken(registeredCustomerRecord._id);

  return res
    .cookie("token", sessionAuthToken, AUTHENTICATION_COOKIE_PRESETS)
    .status(201)
    .json({
      success: true,
      message: "Registration successful",
      Customer: {
        _id: registeredCustomerRecord._id,
        name: registeredCustomerRecord.name,
        email: registeredCustomerRecord.email,
        phoneNo: registeredCustomerRecord.phoneNo,
      },
      token: sessionAuthToken,
    });
});

/**
 * Authenticate customer credentials and establish session
 * @route POST /customers/login
 */
export const loginCustomer = asyncHandler(async (req, res) => {
  const { email: inputEmail, password: inputPassword } = req.body;

  if (!inputEmail || !inputPassword) {
    return res.status(400).json({
      success: false,
      message: "Both email and password are required",
    });
  }

  const lookupEmail = String(inputEmail).trim().toLowerCase();
  const matchedCustomerProfile = await CustomerAccount.findOne({ email: lookupEmail });

  if (!matchedCustomerProfile) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials provided",
    });
  }

  const isPasswordValid = await bcrypt.compare(inputPassword, matchedCustomerProfile.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials provided",
    });
  }

  const sessionAuthToken = issueJsonWebToken(matchedCustomerProfile._id);

  res.cookie("token", sessionAuthToken, AUTHENTICATION_COOKIE_PRESETS);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    Customer: {
      _id: matchedCustomerProfile._id,
      name: matchedCustomerProfile.name,
      email: matchedCustomerProfile.email,
      phoneNo: matchedCustomerProfile.phoneNo,
    },
    token: sessionAuthToken,
  });
});

/**
 * Retrieve current authenticated customer session profile
 * @route GET /customers/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const verifiedAccount = req.authenticatedCustomer || req.user;
  return res.status(200).json(verifiedAccount);
});

/**
 * Terminate authenticated customer session and clear cookie
 * @route POST /customers/logout
 */
export const logoutCustomer = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Modern naming aliases
export const handleCustomerRegistration = registerCustomer;
export const handleCustomerLogin = loginCustomer;
export const retrieveCurrentCustomerProfile = getMe;
export const handleCustomerLogout = logoutCustomer;